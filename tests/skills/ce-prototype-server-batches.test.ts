import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import net from "net"
import os from "os"
import path from "path"
import {
  createServerHarness, serverScript, runServerCommand, postAnnotation, flushAnnotations,
} from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer } = createServerHarness()

describe("ce-prototype light-webserver.js / batches", () => {
  test("wait reaches a server bound to a specific interface, and 127.0.0.1 when bound to every interface", async () => {
    // The POST goes through Node's own fetch in a subprocess, which ignores
    // HTTP_PROXY; the test runner's fetch may not, and a proxy cannot reach
    // a loopback alias.
    const postFromNode = async (url: string, comment: string) => {
      const proc = Bun.spawn(["node", "-e", `fetch(process.argv[1], { method: "POST", headers: { "Content-Type": "application/json" }, body: process.argv[2] }).then((r) => { console.log(r.status) }, (e) => { console.error(e); process.exit(1) })`, url, JSON.stringify({ comment, selector: "h1" })], { stdout: "pipe", stderr: "pipe" })
      const [exitCode, stdout, stderr] = await Promise.all([proc.exited, new Response(proc.stdout).text(), new Response(proc.stderr).text()])
      expect(exitCode, stderr).toBe(0)
      return Number(stdout.trim())
    }
    const flushFromNode = async (url: string) => {
      const proc = Bun.spawn(["node", "-e", `fetch(process.argv[1], { method: "POST" }).then((r) => { console.log(r.status) }, (e) => { console.error(e); process.exit(1) })`, url], { stdout: "pipe", stderr: "pipe" })
      const [exitCode, stdout, stderr] = await Promise.all([proc.exited, new Response(proc.stdout).text(), new Response(proc.stderr).text()])
      expect(exitCode, stderr).toBe(0)
      return Number(stdout.trim())
    }
    const roundTrip = async (host: string, postHost: string, comment: string) => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-wait-host-"))
      const info = await startServer(root, ["--annotate", "--host", host], { CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "80" })
      expect(info.host).toBe(host)
      await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Pin me</h1>")
      const waiting = runServerCommand(["wait", "--root", root])
      await new Promise((resolve) => setTimeout(resolve, 80))
      expect(await postFromNode(`http://${postHost}:${info.port}/annotation?token=${info.token}`, comment)).toBe(200)
      expect(await flushFromNode(`http://${postHost}:${info.port}/session/flush?token=${info.token}`)).toBe(200)
      const result = await waiting
      expect(result.exitCode, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout.trim())[0].comment).toBe(comment)
    }

    // Wildcard bind: wait talks to 127.0.0.1, which the server answers on.
    await roundTrip("0.0.0.0", "127.0.0.1", "reach me on loopback")

    // A loopback alias is bindable on Linux but not on default macOS; probe before relying on it.
    const aliasBindable = await new Promise<boolean>((resolve) => {
      const probe = net.createServer()
      probe.once("error", () => resolve(false))
      probe.listen(0, "127.0.0.2", () => probe.close(() => resolve(true)))
    })
    if (!aliasBindable) {
      console.log("skip: 127.0.0.2 is not bindable on this host; the specific-interface branch was not exercised")
      return
    }
    await roundTrip("127.0.0.2", "127.0.0.2", "reach me on the alias")
  })

  test("wait prints a flushed batch and session end unblocks the next wait", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-wait-"))
    const info = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "200" })
    const origin = `http://localhost:${info.port}`
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Pin me</h1>")
    const record = {
      comment: "more padding above this heading",
      selector: "h1",
      textSnippet: "Pin me",
      rect: { x: 12, y: 8, width: 40, height: 20 },
    }

    const posted = await postAnnotation(origin, info.token, record)
    expect(posted.status).toBe(200)
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)

    const waiting = runServerCommand(["wait", "--root", root])
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect((await flushAnnotations(origin, info.token)).status).toBe(200)

    const result = await waiting
    expect(result.exitCode, result.stderr).toBe(0)
    const payload = JSON.parse(result.stdout.trim())
    expect(Array.isArray(payload)).toBe(true)
    expect(payload).toHaveLength(1)
    expect(Object.keys(payload[0])).toEqual(["id", "screen", "comment", "selector", "textSnippet", "rect"])
    expect(payload[0].screen).toBe("001-screen.html")
    expect(payload[0].comment).toBe(record.comment)
    expect(payload[0].selector).toBe(record.selector)
    expect(payload[0].textSnippet).toBe(record.textSnippet)
    expect(payload[0].rect).toEqual(record.rect)

    const ending = runServerCommand(["wait", "--root", root])
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect((await fetch(`${origin}/session/end?token=${info.token}`, { method: "POST" })).status).toBe(200)
    const ended = await ending
    expect(ended.exitCode, ended.stderr).toBe(1)
    expect(JSON.parse(ended.stdout.trim()).status).toBe("session-ended")
  })

  test("wait reports an unreadable live info file as an error, not session-ended", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-wait-bad-info-"))
    await startServer(root, ["--annotate"])
    await fs.writeFile(path.join(root, "state", "display-info.json"), "{")
    const result = await runServerCommand(["wait", "--root", root])
    expect(result.exitCode, result.stderr).toBe(2)
    expect(result.stdout).toBe("")
  })

  test("unexpected wait failures exit 2 rather than session-ended", async () => {
    expect(await fs.readFile(serverScript, "utf8")).toMatch(
      /process.exit\(\(command \?\? process.argv\[2\]\) === "wait" \? 2 : 1\)/,
    )
  })

  test("an annotation whose body is still arriving when the session ends is refused, not queued", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-late-body-"))
    const info = await startServer(root, ["--annotate"])
    const body = JSON.stringify({ comment: "late", selector: "h1" })
    const half = Math.floor(body.length / 2)

    const socket = net.connect(Number(info.port), "127.0.0.1")
    await new Promise<void>((resolve, reject) => {
      socket.once("connect", () => resolve())
      socket.once("error", reject)
    })
    let response = ""
    socket.on("data", (chunk) => {
      response += chunk.toString("utf8")
    })
    socket.write(
      `POST /annotation?token=${info.token} HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/json\r\nContent-Length: ${body.length}\r\nConnection: close\r\n\r\n${body.slice(0, half)}`,
    )
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(response).toBe("")

    expect((await fetch(`http://localhost:${info.port}/session/end?token=${info.token}`, { method: "POST" })).status).toBe(200)

    socket.write(body.slice(half))
    await new Promise<void>((resolve) => socket.once("close", () => resolve()))
    expect(response).toMatch(/^HTTP\/1\.1 410 /)
    expect(response).toContain('"status":"session-ended"')

    const waited = await runServerCommand(["wait", "--root", root])
    expect(waited.exitCode, waited.stderr).toBe(1)
    expect(JSON.parse(waited.stdout.trim())).toEqual({ status: "session-ended" })
  })

  test("held annotations wait for flush and arrive as one batch", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-queue-"))
    const info = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "200" })
    const origin = `http://localhost:${info.port}`
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Queue</h1>")
    expect((await postAnnotation(origin, info.token, { comment: "first", selector: "h1" })).status).toBe(200)
    expect((await postAnnotation(origin, info.token, { comment: "second", selector: "h2" })).status).toBe(200)
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)

    expect((await flushAnnotations(origin, info.token)).status).toBe(200)
    const first = await runServerCommand(["wait", "--root", root])
    expect(first.exitCode, first.stderr).toBe(0)
    const batch = JSON.parse(first.stdout.trim())
    expect(batch.map((item: { comment: string }) => item.comment)).toEqual(["first", "second"])

    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)
  })

  test("session end flushes held pins as one batch before session-ended", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-end-queue-"))
    const info = await startServer(root, ["--annotate"])
    const origin = `http://localhost:${info.port}`
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Queue</h1>")
    const first = await (await postAnnotation(origin, info.token, { comment: "first", selector: "h1" })).json()
    const second = await (await postAnnotation(origin, info.token, { comment: "second", selector: "h2" })).json()
    const stream = await fetch(`${origin}/events?token=${info.token}`)
    expect((await fetch(`${origin}/session/end?token=${info.token}`, { method: "POST" })).status).toBe(200)
    const text = await stream.text()
    const frames = [...text.matchAll(/event: annotations\ndata: (\{[^\n]*\})\n/g)].map((match) => JSON.parse(match[1]))
    const last = frames.at(-1)
    expect(last[first.id]).toBe("queued")
    expect(last[second.id]).toBe("queued")
    expect(last[first.id]).not.toBe("done")

    const delivered = await runServerCommand(["wait", "--root", root])
    expect(delivered.exitCode, delivered.stderr).toBe(0)
    expect(JSON.parse(delivered.stdout.trim()).map((item: { comment: string }) => item.comment)).toEqual(["first", "second"])

    const ended = await runServerCommand(["wait", "--root", root])
    expect(ended.exitCode, ended.stderr).toBe(1)
    expect(JSON.parse(ended.stdout.trim()).status).toBe("session-ended")
  })

  test("annotation lifecycle follows POST, flush, wait, and re-entering wait, and is streamed to the overlay", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-lifecycle-"))
    const info = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40" })
    const origin = `http://localhost:${info.port}`
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Lifecycle</h1>")
    const post = async (comment: string) => {
      const response = await postAnnotation(origin, info.token, { comment, selector: "h1" })
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toMatch(/^[0-9a-f-]{36}$/)
      return body.id as string
    }
    const wait = async () => {
      const response = await fetch(`${origin}/wait?token=${info.token}`)
      return response.status === 200 ? await response.json() : null
    }
    const lifecycle = async () => {
      const controller = new AbortController()
      const stream = await fetch(`${origin}/events?token=${info.token}`, { signal: controller.signal })
      const reader = stream.body!.getReader()
      let text = ""
      while (!/event: annotations\ndata: .*\n\n/.test(text)) {
        const chunk = await reader.read()
        if (chunk.done) break
        text += new TextDecoder().decode(chunk.value)
      }
      controller.abort()
      return JSON.parse(text.match(/event: annotations\ndata: (.*)\n\n/)![1])
    }

    const first = await post("first")
    const second = await post("second")
    expect(await lifecycle()).toEqual({ [first]: "held", [second]: "held" })
    expect(await wait()).toBeNull()

    expect((await flushAnnotations(origin, info.token)).status).toBe(200)
    const served = await wait()
    expect(served.map((item: { id: string }) => item.id)).toEqual([first, second])
    expect(served[0].comment).toBe("first")
    expect(await lifecycle()).toEqual({ [first]: "working", [second]: "working" })

    expect(await wait()).toBeNull()
    expect(await lifecycle()).toEqual({ [first]: "done", [second]: "done" })

    const third = await post("third")
    expect(await lifecycle()).toEqual({ [first]: "done", [second]: "done", [third]: "held" })
    await fetch(`${origin}/session/end?token=${info.token}`, { method: "POST" })
    expect((await wait()).map((item: { id: string }) => item.id)).toEqual([third])
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("wait drains a multi-megabyte batch through a backpressured stdout pipe", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-output-drain-"))
    const info = await startServer(root, ["--annotate"])
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Batch</h1>")
    const comments = Array.from({ length: 100 }, (_, i) => `${i}:` + "한🙂".repeat(7000))
    for (const comment of comments) {
      expect((await postAnnotation(String(info.url), info.token, { comment, selector: "h1" })).status).toBe(200)
    }
    expect((await flushAnnotations(String(info.url), info.token)).status).toBe(200)
    const proc = Bun.spawn(["node", serverScript, "wait", "--root", root], { stdout: "pipe", stderr: "pipe" })
    // Let the producer fill its pipe before attaching the consumer.
    await new Promise((resolve) => setTimeout(resolve, 100))
    const [exitCode, stdout, stderr] = await Promise.all([
      proc.exited, new Response(proc.stdout).text(), new Response(proc.stderr).text(),
    ])
    expect(exitCode, stderr).toBe(0)
    expect(Buffer.byteLength(stdout)).toBeGreaterThan(4_000_000)
    expect(stdout.endsWith("\n")).toBe(true)
    const records = JSON.parse(stdout)
    expect(records).toHaveLength(100)
    expect(records.map((record: { comment: string }) => record.comment)).toEqual(comments)
  })

  test("a closed wait-output pipe reports an error, not session-ended or success", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-output-closed-"))
    const info = await startServer(root, ["--annotate"])
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Batch</h1>")
    for (let i = 0; i < 8; i++) {
      expect((await postAnnotation(String(info.url), info.token, { comment: "x".repeat(50_000), selector: "h1" })).status).toBe(200)
    }
    expect((await flushAnnotations(String(info.url), info.token)).status).toBe(200)
    // Use Node's pipe semantics, independent of Bun's ReadableStream cancellation.
    const program = `
      const { spawn } = require("node:child_process");
      const child = spawn(process.execPath, [process.argv[1], "wait", "--root", process.argv[2]], { stdio: ["ignore", "pipe", "pipe"] });
      child.stdout.destroy();
      child.stderr.pipe(process.stderr);
      child.once("error", (error) => { console.error(error); process.exitCode = 99; });
      child.once("close", (code) => console.log(code));
    `
    const proc = Bun.spawn(["node", "-e", program, serverScript, root], { stdout: "pipe", stderr: "pipe" })
    const [exitCode, stdout, stderr] = await Promise.all([
      proc.exited, new Response(proc.stdout).text(), new Response(proc.stderr).text(),
    ])
    expect(exitCode, stderr).toBe(0)
    expect(stdout.trim()).toBe("2")
    expect(stderr).toContain("Failed to write wait output")
  })
})
