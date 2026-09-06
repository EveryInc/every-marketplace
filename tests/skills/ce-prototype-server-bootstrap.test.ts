import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { createHash } from "node:crypto"
import { runInNewContext } from "node:vm"
import { createServerHarness, annotateBootFrom, NAVIGATE } from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer } = createServerHarness()

function selectDestination(authorizeUrl: unknown, next: string): URL {
  const url = new URL(String(authorizeUrl))
  url.searchParams.set("next", next)
  return url
}

async function bootstrapDestination(response: Response, token: unknown): Promise<string> {
  expect(response.status).toBe(200)
  expect(response.headers.get("cache-control")).toBe("no-store")
  expect(response.headers.get("referrer-policy")).toBe("no-referrer")
  const html = await response.text()
  expect(html).not.toContain(String(token))
  const scripts = [...html.matchAll(/<script>([^<]+)<\/script>/g)]
  expect(scripts).toHaveLength(1)
  const script = scripts[0]![1]!
  const hash = createHash("sha256").update(script).digest("base64")
  expect(response.headers.get("content-security-policy")).toBe(
    `default-src 'none'; script-src 'sha256-${hash}'; base-uri 'none'; frame-ancestors 'none'`,
  )
  const destinations: string[] = []
  runInNewContext(script, { window: { location: { replace: (url: string) => destinations.push(url) } } }, { timeout: 1000 })
  expect(destinations).toHaveLength(1)
  return destinations[0]!
}

describe("ce-prototype light-webserver.js / bootstrap destination", () => {
  test("preserves a nested screen and its query/hash state through authorization", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-bootstrap-screen-"))
    const info = await startServer(root, ["--annotate"])
    const origin = String(info.url)
    const screenDir = String(info.screen_dir)
    await fs.mkdir(path.join(screenDir, "nested"))
    await fs.writeFile(path.join(screenDir, "001-home.html"), "<h1>Home</h1>")
    await fs.writeFile(path.join(screenDir, "nested", "checkout.html"), "<h1>Selected checkout</h1>")
    const next = "/nested/checkout.html?variant=b&token=demo&search=a%20b~&item=1&item=2#/details?panel=2"
    const bootstrap = await fetch(selectDestination(info.authorize_url, next))
    const cookie = (bootstrap.headers.get("set-cookie") ?? "").split(";")[0]!
    expect(cookie).toBe(`ce-light-web-${info.port}=${info.token}`)
    const destination = await bootstrapDestination(bootstrap, info.token)
    expect(destination).toBe(next)
    const page = await fetch(new URL(destination, origin), { headers: { ...NAVIGATE, cookie } })
    expect(page.status).toBe(200)
    const html = await page.text()
    expect(html).toContain("Selected checkout")
    expect(html).not.toContain("<h1>Home</h1>")
    expect(html).toContain(annotateBootFrom(html, origin, "/nested/checkout.html"))
    expect(html).not.toContain(String(info.token))
    const post = await fetch(`${origin}/annotation`, {
      method: "POST", headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ page: "/nested/checkout.html", comment: "Selected state", selector: "h1" }),
    })
    expect(post.status).toBe(200)
    expect((await fetch(`${origin}/session/flush`, { method: "POST", headers: { cookie } })).status).toBe(200)
    const waited = await fetch(`${origin}/wait`, { headers: { cookie } })
    expect(waited.status).toBe(200)
    expect((await waited.json())[0].screen).toBe("nested/checkout.html")
  })

  test("preserves root state, encoded delimiters, duplicate parameters, and empty query/hash markers", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-bootstrap-state-"))
    const info = await startServer(root, ["--annotate"])
    for (const next of [
      "/?token=app-value&next=app-next#panel",
      "/nested/a%23b.html?space=a%20b&plus=a+b&plus=%2B&tilde=~#tab%2Ftwo",
      "/?", "/#", "/?#",
    ]) {
      const response = await fetch(selectDestination(info.authorize_url, next))
      expect(await bootstrapDestination(response, info.token)).toBe(next)
    }
  })

  test("rejects nonlocal or ambiguous destinations without issuing a cookie", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-bootstrap-invalid-"))
    const info = await startServer(root, ["--annotate"])
    for (const next of [
      "", "nested/page.html", "https://example.invalid/", String(info.url),
      "//example.invalid/", "///example.invalid/", "/\\example.invalid/",
      "/a/..//example.invalid/", "/%2e//example.invalid/",
      "/?q=\nignored", "javascript:alert(1)", "data:text/html,example",
    ]) {
      const response = await fetch(selectDestination(info.authorize_url, next))
      expect(response.status, JSON.stringify(next)).toBe(400)
      expect(response.headers.get("set-cookie")).toBeNull()
      expect(await response.text()).not.toContain(String(info.token))
    }
    // A destination is not a credential. It cannot authorize a public visitor.
    const publicLink = selectDestination(info.authorize_url, "/?token=demo#panel")
    publicLink.searchParams.delete("token")
    const refused = await fetch(publicLink)
    expect(refused.status).toBe(401)
    expect(refused.headers.get("set-cookie")).toBeNull()
    expect(await bootstrapDestination(await fetch(String(info.authorize_url)), info.token)).toBe("/")
  })

  test("serializes script-like destination text as URL data under the matching CSP", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-bootstrap-encoding-"))
    const info = await startServer(root, ["--annotate"])
    const next = '/?q=";throw new Error(1);//&markup=</script><script>throw 2</script>#<!--<script>'
    const response = await fetch(selectDestination(info.authorize_url, next))
    const destination = await bootstrapDestination(response, info.token)
    const expected = new URL(next, String(info.url)).href.slice(String(info.url).length)
    expect(destination).toBe(expected)
    expect(new URL(destination, String(info.url)).origin).toBe(String(info.url))
  })
})
