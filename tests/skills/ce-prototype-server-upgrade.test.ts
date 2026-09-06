import { test } from "bun:test"
import assert from "node:assert/strict"
import { execFile, spawn } from "node:child_process"
import { once } from "node:events"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"

const exec = promisify(execFile)
const sourcePath = path.resolve(import.meta.dir, "../../skills/ce-prototype/scripts/light-webserver.js")
const navigation = { "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate", Accept: "text/html" }

async function exerciseUpgrade(metadata: "legacy" | "unversioned" | "missing-link" | "current" | "plain") {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ce-prototype-upgrade-"))
  const script = path.join(directory, "light-webserver.mjs")
  const root = path.join(directory, "run")
  const source = await readFile(sourcePath, "utf8")
  // Model older published capabilities in a live process, then replace the
  // script at that exact path. Editing only display-info.json misses upgrades.
  let previous = source
  if (metadata === "legacy" || metadata === "unversioned") {
    previous = previous.replace(/^.*annotate_protocol:.*\n/m, "")
  }
  if (metadata === "legacy" || metadata === "missing-link") {
    previous = previous.replace(/^.*authorize_url:.*\n/m, "")
  }
  const annotate = metadata !== "plain"
  let server: ReturnType<typeof spawn> | undefined
  let stopped: Promise<unknown> | undefined
  try {
    await mkdir(path.join(root, "screens"), { recursive: true })
    await writeFile(path.join(root, "screens/index.html"), "<h1>Upgrade fixture</h1>")
    await writeFile(script, previous)
    server = spawn("node", [script, "serve", "--root", root, "--port", "0", ...(annotate ? ["--annotate"] : [])], {
      stdio: ["ignore", "pipe", "pipe"],
    })
    stopped = once(server, "exit")
    const before = await new Promise<Record<string, unknown>>((resolve, reject) => {
      let output = ""
      const timer = setTimeout(() => reject(new Error("Server did not publish metadata")), 3000)
      server!.once("error", (error) => { clearTimeout(timer); reject(error) })
      server!.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited early: ${code}`)) })
      server!.stdout!.on("data", (chunk) => {
        output += chunk.toString()
        if (!output.includes("\n")) return
        clearTimeout(timer)
        try { resolve(JSON.parse(output.split("\n")[0])) } catch (error) { reject(error) }
      })
    })
    if (metadata === "legacy" || metadata === "unversioned") assert.equal(before.annotate_protocol, undefined)
    if (metadata === "legacy" || metadata === "missing-link") assert.equal(before.authorize_url, undefined)
    await writeFile(script, source)
    const { stdout } = await exec("node", [script, "start", "--root", root, "--port", "0", ...(annotate ? ["--annotate"] : [])], { timeout: 4000 })
    const after = JSON.parse(stdout)
    if (metadata === "current" || metadata === "plain") {
      assert.equal(after.status, "running")
      assert.equal(after.pid, before.pid)
      assert.equal(after.token, before.token)
      if (!annotate) assert.equal(after.authorize_url, undefined)
      return
    }
    assert.equal(after.status, "started")
    assert.notEqual(after.pid, before.pid)
    assert.notEqual(after.token, before.token)
    assert.equal(after.annotate_protocol, 1)
    assert.equal(new URL(after.authorize_url).searchParams.get("token"), after.token)
    const origin = `http://127.0.0.1:${after.port}`
    const publicPage = await fetch(origin, { headers: navigation })
    assert.equal(publicPage.status, 200)
    assert.equal(publicPage.headers.get("set-cookie"), null)
    assert.ok(!(await publicPage.text()).includes("/__ce-annotate/annotate.js"))
    const stale = await fetch(`${origin}/session/end`, { method: "POST", headers: { Authorization: `Bearer ${before.token}` } })
    assert.equal(stale.status, 401)
    await stale.text()
    const link = new URL(after.authorize_url)
    link.hostname = "127.0.0.1"
    const authorization = await fetch(link)
    assert.equal(authorization.status, 200)
    assert.ok(authorization.headers.get("set-cookie")?.includes(after.token))
    await authorization.text()
    const reused = JSON.parse((await exec("node", [script, "start", "--root", root, "--annotate"], { timeout: 4000 })).stdout)
    assert.equal(reused.pid, after.pid)
    assert.equal(reused.token, after.token)
  } finally {
    // stop uses the same script/root identity even after the in-place upgrade.
    await exec("node", [script, "stop", "--root", root], { timeout: 4000 }).catch(() => {})
    if (server && server.exitCode === null && server.signalCode === null) server.kill("SIGKILL")
    if (stopped) await stopped
    await rm(directory, { recursive: true, force: true })
  }
}

for (const metadata of ["legacy", "unversioned", "missing-link"] as const) {
  test(`ce-prototype upgrades live annotate servers with ${metadata} handoff metadata`, () => exerciseUpgrade(metadata))
}
test("ce-prototype reuses a compatible annotate server without rotating its token", () => exerciseUpgrade("current"))
test("ce-prototype still reuses a display-only server without annotation metadata", () => exerciseUpgrade("plain"))
