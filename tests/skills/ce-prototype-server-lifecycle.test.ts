import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import {
  createServerHarness, runServerCommand, postAnnotation,
} from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer } = createServerHarness()

describe("ce-prototype light-webserver.js / lifecycle", () => {
  test("/version polling does not keep an otherwise idle server alive", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-idle-"))
    const info = await startServer(root, [], {
      // listen() starts idle before startServer() returns; 250ms lost the
      // page GET to ConnectionRefused under parallel CI (never reached /version).
      CE_LIGHT_WEB_IDLE_TIMEOUT_MS: "2000",
      CE_LIGHT_WEB_LIFECYCLE_CHECK_MS: "50",
    })

    await fs.writeFile(path.join(String(info.screen_dir), "001-first.html"), "<h1>First slice</h1>")
    await fetch(String(info.url))

    const deadline = Date.now() + 4500
    while (Date.now() < deadline) {
      try {
        await fetch(`${String(info.url)}/version`)
      } catch {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    const result = await runServerCommand(["status", "--root", root])
    expect(result.exitCode, result.stderr).toBe(0)
    const status = JSON.parse(result.stdout.trim())
    expect(status.status).toBe("stopped")
  })

  test("server exits when its owner process exits", async () => {
    const owner = Bun.spawn(["node", "-e", "setInterval(() => {}, 1000)"], {
      stdout: "ignore",
      stderr: "ignore",
    })
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-owner-"))

    try {
      const info = await startServer(root, ["--owner-pid", String(owner.pid)], {
        CE_LIGHT_WEB_IDLE_TIMEOUT_MS: "5000",
        CE_LIGHT_WEB_LIFECYCLE_CHECK_MS: "50",
      })
      expect(info.owner_pid).toBe(owner.pid)

      owner.kill()
      await owner.exited

      let status = { status: "running" }
      for (let i = 0; i < 20; i++) {
        const result = await runServerCommand(["status", "--root", root])
        expect(result.exitCode, result.stderr).toBe(0)
        status = JSON.parse(result.stdout.trim())
        if (status.status === "stopped") break
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      expect(status.status).toBe("stopped")
    } finally {
      owner.kill()
    }
  })

  test("idle shutdown ends the session instead of hanging on an open change stream", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-idle-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_IDLE_TIMEOUT_MS: "250",
      CE_LIGHT_WEB_LIFECYCLE_CHECK_MS: "50",
    })
    const origin = `http://localhost:${info.port}`
    const stream = await fetch(`${origin}/events?token=${info.token}`)
    expect(stream.status).toBe(200)
    const text = await stream.text()
    expect(text).toContain("event: session-ended")

    let status = { status: "running" }
    for (let i = 0; i < 20; i++) {
      status = JSON.parse((await runServerCommand(["status", "--root", root])).stdout.trim())
      if (status.status === "stopped") break
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    expect(status.status).toBe("stopped")
  })

  test("idle shutdown flushes a parked wait as session-ended", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-wait-idle-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_IDLE_TIMEOUT_MS: "400",
      CE_LIGHT_WEB_LIFECYCLE_CHECK_MS: "30",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "5000",
    })
    const origin = `http://localhost:${info.port}`
    // Root GET is activity, so idle is measured from a parked waiter rather
    // than from listen() racing a separate Node `wait` process.
    await fetch(String(info.url))
    const parked = fetch(`${origin}/wait?token=${info.token}`)
    const ended = await parked
    expect(ended.status).toBe(410)
    expect(await ended.json()).toEqual({ status: "session-ended" })
  })

  test("stop flushes a parked wait as session-ended", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-wait-stop-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "8000",
    })
    const waiting = runServerCommand(["wait", "--root", root])
    await fetch(String(info.url))
    const stopped = await runServerCommand(["stop", "--root", root])
    expect(stopped.exitCode, stopped.stderr).toBe(0)
    const ended = await waiting
    expect(ended.exitCode, ended.stderr).toBe(1)
    expect(JSON.parse(ended.stdout.trim()).status).toBe("session-ended")
  })

  test("wait reports session-ended after idle already stopped the process", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-wait-after-idle-"))
    await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_IDLE_TIMEOUT_MS: "80",
      CE_LIGHT_WEB_LIFECYCLE_CHECK_MS: "20",
    })
    let status = { status: "running" }
    for (let i = 0; i < 40; i++) {
      status = JSON.parse((await runServerCommand(["status", "--root", root])).stdout.trim())
      if (status.status === "stopped") break
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    expect(status.status).toBe("stopped")
    const ended = await runServerCommand(["wait", "--root", root])
    expect(ended.exitCode, ended.stderr).toBe(1)
    expect(JSON.parse(ended.stdout.trim()).status).toBe("session-ended")
  })

  test("annotation POST resets idle timeout while wait and /version do not", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-annotate-idle-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_IDLE_TIMEOUT_MS: "600",
      CE_LIGHT_WEB_LIFECYCLE_CHECK_MS: "50",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "80",
    })
    const origin = `http://localhost:${info.port}`
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Idle</h1>")
    await fetch(String(info.url))

    await new Promise((resolve) => setTimeout(resolve, 400))
    await postAnnotation(origin, info.token, { comment: "keep alive", selector: "h1" })

    // Past the original idle budget, so only the POST can explain a live server.
    // /version is not activity, so probing with it cannot extend the budget.
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect((await fetch(`${origin}/version`)).status).toBe(200)

    const deadline = Date.now() + 1500
    while (Date.now() < deadline) {
      try {
        await fetch(`${origin}/version`)
        await fetch(`${origin}/wait?token=${info.token}`)
      } catch {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    const status = JSON.parse((await runServerCommand(["status", "--root", root])).stdout.trim())
    expect(status.status).toBe("stopped")
  })
})
