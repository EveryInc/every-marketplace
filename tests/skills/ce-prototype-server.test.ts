import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import {
  createServerHarness, serverScript, readJsonLine, runServerCommand, postAnnotation, flushAnnotations,
} from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer, rootsToStop } = createServerHarness()

describe("ce-prototype light-webserver.js", () => {
  test("start writes display-info and serves the newest screen", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-server-"))
    const info = await startServer(root)

    expect(info.status).toBe("started")
    expect(info.url).toMatch(/^http:\/\/localhost:\d+$/)
    expect(info.screen_dir).toBe(path.join(root, "screens"))
    expect(info.state_dir).toBe(path.join(root, "state"))

    const screenDir = String(info.screen_dir)
    await fs.writeFile(path.join(screenDir, "001-first.html"), "<h1>First slice</h1>")
    let response = await fetch(String(info.url))
    let html = await response.text()
    expect(html).toContain("First slice")
    expect(html).toContain("CE local web")
    expect(html).toContain('fetch("/version"')
    expect(html).not.toContain("WebSocket")
    expect(html).not.toContain("events")
    expect(html).not.toContain("EventSource")
    expect(html).not.toContain("annotate.js")
    expect(html).not.toContain("ce-annotate-host")

    response = await fetch(`${String(info.url)}/version`)
    let version = await response.json()
    expect(version.screen).toBe("001-first.html")

    await new Promise((resolve) => setTimeout(resolve, 20))
    await fs.writeFile(path.join(screenDir, "002-second.html"), "<h1>Second slice</h1>")
    response = await fetch(String(info.url))
    html = await response.text()
    expect(html).toContain("Second slice")
    expect(html).not.toContain("First slice")

    response = await fetch(`${String(info.url)}/version`)
    version = await response.json()
    expect(version.screen).toBe("002-second.html")
  })

  test("serves interactive fixture HTML that can show relevant state after an action", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-state-"))
    const info = await startServer(root)

    await fs.writeFile(
      path.join(String(info.screen_dir), "001-state.html"),
      [
        "<!doctype html><html><body>",
        '<button id="act">Do it</button>',
        '<p id="state">idle</p>',
        "<script>",
        'document.getElementById("act").onclick = function () {',
        '  document.getElementById("state").textContent = "done";',
        "};",
        "</script>",
        "</body></html>",
      ].join(""),
    )

    const html = await (await fetch(String(info.url))).text()
    expect(html).toContain('id="state">idle')
    expect(html).toContain('textContent = "done"')
    expect(html).toContain('fetch("/version"')
    expect(html.indexOf('fetch("/version"')).toBeLessThan(html.indexOf("</body>"))
  })

  test("missing --root fails closed", async () => {
    const result = await runServerCommand(["start"])
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain("--root is required")
  })

  test("status and stop use the root state directory", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-status-"))
    await startServer(root)

    let result = await runServerCommand(["status", "--root", root])
    expect(result.exitCode, result.stderr).toBe(0)
    let status = JSON.parse(result.stdout.trim())
    expect(status.status).toBe("running")
    expect(status.root).toBe(root)

    result = await runServerCommand(["stop", "--root", root])
    expect(result.exitCode, result.stderr).toBe(0)
    status = JSON.parse(result.stdout.trim())
    expect(status.status).toBe("stopped")

    result = await runServerCommand(["status", "--root", root])
    expect(result.exitCode, result.stderr).toBe(0)
    status = JSON.parse(result.stdout.trim())
    expect(status.status).toBe("stopped")
  })

  test("foreground start serves until stopped", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-foreground-"))
    const proc = Bun.spawn(["node", serverScript, "start", "--root", root, "--port", "0", "--foreground"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    rootsToStop.push(root)

    const info = await readJsonLine(proc.stdout)
    expect(info.status).toBe("running")
    expect(info.url).toMatch(/^http:\/\/localhost:\d+$/)

    await fs.writeFile(path.join(String(info.screen_dir), "001-foreground.html"), "<h1>Foreground</h1>")
    const response = await fetch(String(info.url))
    expect(await response.text()).toContain("Foreground")

    const result = await runServerCommand(["stop", "--root", root])
    expect(result.exitCode, result.stderr).toBe(0)
    await proc.exited
  })

  test("wait reaches a foreground annotate server", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-fg-wait-"))
    const proc = Bun.spawn(
      ["node", serverScript, "start", "--root", root, "--port", "0", "--foreground", "--annotate"],
      { stdout: "pipe", stderr: "pipe" },
    )
    rootsToStop.push(root)
    const info = await readJsonLine(proc.stdout)
    expect(info.status).toBe("running")
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Pin me</h1>")
    const waiting = runServerCommand(["wait", "--root", root])
    await new Promise((resolve) => setTimeout(resolve, 80))
    const posted = await postAnnotation(`http://localhost:${info.port}`, info.token, {
      comment: "from foreground",
      selector: "h1",
    })
    expect(posted.status).toBe(200)
    expect((await flushAnnotations(`http://localhost:${info.port}`, info.token)).status).toBe(200)
    const result = await waiting
    expect(result.exitCode, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout.trim())[0].comment).toBe("from foreground")
  })

  test("start in the other mode replaces the running server instead of reusing it", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-mode-"))
    const plain = await startServer(root)
    expect(plain.status).toBe("started")
    expect(plain.token).toBeUndefined()
    expect(plain.authorize_url).toBeUndefined()

    const annotated = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "200" })
    expect(annotated.status).toBe("started")
    expect(annotated.pid).not.toBe(plain.pid)
    expect(String(annotated.token)).toMatch(/^[0-9a-f-]{36}$/)
    expect(String(annotated.url)).toBe(`http://localhost:${annotated.port}`)
    const waited = await fetch(`http://localhost:${annotated.port}/wait?token=${annotated.token}`)
    expect(waited.status).toBe(204)
    await expect(fetch(`http://localhost:${plain.port}/version`)).rejects.toThrow()

    const reused = await startServer(root, ["--annotate"])
    expect(reused.status).toBe("running")
    expect(reused.pid).toBe(annotated.pid)

    expect((await fetch(`http://localhost:${annotated.port}/session/end?token=${annotated.token}`, { method: "POST" })).status).toBe(200)
    const restarted = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "200" })
    expect(restarted.status).toBe("started")
    expect(restarted.pid).not.toBe(annotated.pid)
    expect(String(restarted.token)).toMatch(/^[0-9a-f-]{36}$/)
    expect((await fetch(`http://localhost:${restarted.port}/wait?token=${restarted.token}`)).status).toBe(204)

    const back = await startServer(root)
    expect(back.status).toBe("started")
    expect(back.pid).not.toBe(annotated.pid)
    expect(back.token).toBeUndefined()
    expect(back.authorize_url).toBeUndefined()
    expect(String(back.url)).toMatch(/^http:\/\/localhost:\d+$/)
    expect((await fetch(String(back.url))).status).toBe(200)
    await expect(fetch(`http://localhost:${annotated.port}/version`)).rejects.toThrow()
  })
})
