import { setDefaultTimeout, test } from "bun:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

setDefaultTimeout(20_000)
const scriptPath = path.resolve(import.meta.dir, "../../skills/ce-prototype/scripts/light-webserver.js")
const navigation = { "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate", Accept: "text/html" }
const authored = '<!doctype html><html><body><script>window.authoredSearch = location.search</script><h1>Screen</h1></body></html>'

async function withServer(check: (info: any, origin: string) => Promise<void>) {
  const root = await mkdtemp(path.join(os.tmpdir(), "ce-credential-boundary-"))
  let child: ReturnType<typeof spawn> | undefined
  let exited: Promise<unknown> | undefined
  try {
    await mkdir(path.join(root, "screens", "nested"), { recursive: true })
    await writeFile(path.join(root, "screens", "index.html"), authored)
    await writeFile(path.join(root, "screens", "nested", "screen.html"), authored)
    child = spawn("node", [scriptPath, "serve", "--root", root, "--port", "0", "--annotate", "--owner-pid", String(process.pid)], {
      stdio: ["ignore", "pipe", "pipe"],
    })
    exited = once(child, "exit")
    child.stderr!.resume()
    const info = await new Promise<any>((resolve, reject) => {
      let output = ""
      const timer = setTimeout(() => reject(new Error("Server did not start")), 3000)
      child!.once("error", (error) => { clearTimeout(timer); reject(error) })
      child!.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Early server exit: ${code}`)) })
      child!.stdout!.on("data", (chunk) => {
        output += chunk.toString()
        if (!output.includes("\n")) return
        clearTimeout(timer)
        try { resolve(JSON.parse(output.split("\n")[0]!)) } catch (error) { reject(error) }
      })
    })
    await check(info, `http://127.0.0.1:${info.port}`)
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM")
      const timer = setTimeout(() => child!.kill("SIGKILL"), 3000)
      try { await exited } finally { clearTimeout(timer) }
    }
    await rm(root, { recursive: true, force: true })
  }
}

async function browserCookie(info: any, origin: string): Promise<string> {
  const link = new URL(info.authorize_url)
  link.host = new URL(origin).host
  const response = await fetch(link)
  assert.equal(response.status, 200)
  const cookie = response.headers.get("set-cookie")?.split(";")[0]
  assert.ok(cookie)
  assert.ok(!(await response.text()).includes(info.token))
  return cookie
}

async function assertRefused(response: Response, token: string) {
  assert.equal(response.status, 400)
  assert.equal(response.headers.get("set-cookie"), null)
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal(response.headers.get("referrer-policy"), "no-referrer")
  const body = await response.text()
  assert.ok(!body.includes("authoredSearch"))
  assert.ok(!body.includes("/__ce-annotate/annotate.js"))
  assert.ok(!body.includes(token))
}

test("screen query credentials never reach authored HTML, with or without a valid cookie", () => withServer(async (info, origin) => {
  const cookie = await browserCookie(info, origin)
  for (const screen of ["/", "/nested/screen.html"]) {
    for (const query of [`token=${info.token}`, `token=demo&token=${info.token}`, `to%6ben=${info.token}`]) {
      for (const headers of [navigation, { ...navigation, cookie }, { "Sec-Fetch-Dest": "iframe", Accept: "text/html" }, {}]) {
        await assertRefused(await fetch(`${origin}${screen}?${query}`, { headers }), info.token)
      }
    }
  }
}))

test("header credentials cannot substitute for a browser document cookie", () => withServer(async (info, origin) => {
  for (const screen of ["/", "/nested/screen.html"]) {
    for (const credential of [{ Authorization: `Bearer ${info.token}` }, { "x-session-token": info.token }]) {
      for (const cookie of [undefined, `ce-light-web-${info.port}=wrong`]) {
        const response = await fetch(`${origin}${screen}?token=application`, {
          headers: { ...navigation, ...credential, ...(cookie ? { cookie } : {}) },
        })
        assert.equal(response.status, 200)
        assert.equal(response.headers.get("set-cookie"), null)
        assert.equal(await response.text(), authored)
      }
    }
  }
}))

test("private bootstrap cookies enable root and nested documents without reserving application token state", () => withServer(async (info, origin) => {
  const cookie = await browserCookie(info, origin)
  for (const screen of ["/", "/nested/screen.html"]) {
    const response = await fetch(`${origin}${screen}?token=app&token=demo&variant=b`, { headers: { ...navigation, cookie } })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get("set-cookie"), null)
    const body = await response.text()
    assert.ok(body.includes("authoredSearch"))
    assert.ok(body.includes("/__ce-annotate/annotate.js"))
    assert.ok(!body.includes(info.token))
  }
}))

test("a nested bootstrap destination cannot copy the live query credential into authored code", () => withServer(async (info, origin) => {
  for (const next of [`/?token=${info.token}`, `/nested/screen.html?token=demo&token=${info.token}#details`]) {
    const link = new URL(info.authorize_url)
    link.host = new URL(origin).host
    link.searchParams.set("next", next)
    await assertRefused(await fetch(link), info.token)
  }
}))

test("control endpoints retain query, header, and cookie credentials", () => withServer(async (info, origin) => {
  const cookie = await browserCookie(info, origin)
  for (const [suffix, credential] of [
    [`?token=${info.token}`, {}],
    ["", { Authorization: `Bearer ${info.token}` }],
    ["", { "x-session-token": info.token }],
    ["", { cookie }],
  ] as [string, Record<string, string>][]) {
    const posted = await fetch(`${origin}/annotation${suffix}`, {
      method: "POST", headers: { ...credential, "Content-Type": "application/json" },
      body: JSON.stringify({ page: "/nested/screen.html", selector: "h1", comment: "Control credential" }),
    })
    assert.equal(posted.status, 200)
    await posted.text()
    const flushed = await fetch(`${origin}/session/flush${suffix}`, { method: "POST", headers: credential })
    assert.equal(flushed.status, 200)
    await flushed.text()
    const waited = await fetch(`${origin}/wait${suffix}`, { headers: credential })
    assert.equal(waited.status, 200)
    assert.equal((await waited.json())[0].comment, "Control credential")
    const controller = new AbortController()
    const events = await fetch(`${origin}/events${suffix}`, { headers: credential, signal: controller.signal })
    assert.equal(events.status, 200)
    controller.abort()
  }
  assert.equal((await fetch(`${origin}/session/end?token=${info.token}`, { method: "POST" })).status, 200)
}))
