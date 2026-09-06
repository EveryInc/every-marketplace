import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import {
  createServerHarness, runServerCommand, overlaySessionId, annotateBootFrom, postAnnotation, flushAnnotations, navigationHeaders,
} from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer } = createServerHarness()

describe("ce-prototype light-webserver.js / documents", () => {
  test("annotate start writes an origin URL and injects overlay only at serve time", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-annotate-"))
    const info = await startServer(root, ["--annotate"])
    const token = String(info.token)
    expect(token).toMatch(/^[0-9a-f-]{36}$/)
    expect(info.url).toBe(`http://localhost:${info.port}`)
    const displayInfo = JSON.parse(await fs.readFile(path.join(root, "state", "display-info.json"), "utf8"))
    expect(displayInfo.token).toBe(token)
    expect(displayInfo.url).toBe(info.url)

    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1 id=\"heading\">Pin me</h1>")
    const origin = `http://localhost:${info.port}`

    const page = await fetch(`${origin}/`, { headers: navigationHeaders(info) })
    expect(page.status).toBe(200)
    expect(page.headers.get("referrer-policy")).toBe("no-referrer")
    expect(page.headers.get("set-cookie")).toBeNull()
    expect(displayInfo.authorize_url).toBe(`${origin}/__ce-annotate/authorize?token=${token}`)
    const html = await page.text()
    expect(html).toContain("Pin me")
    // Deferred overlay creates its own host and stylesheet at runtime, so the
    // served document names neither.
    const boot = annotateBootFrom(html, origin, "/001-screen.html")
    expect(html.split(boot).length).toBe(2)
    expect(html).toMatch(new RegExp(`<head>[\\s\\S]*${boot.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}[\\s\\S]*</head>`))
    expect(boot).not.toContain(token)
    expect(html).not.toContain("ce-annotate-host")
    expect(html).not.toContain("annotate.css")
    expect(html).not.toContain(token)

    // The overlay lives in a reserved namespace, ungated and never cached; a
    // screen's own /annotate.js is served from screens/ untouched.
    const overlayJs = await fetch(`${origin}/__ce-annotate/annotate.js`)
    expect(overlayJs.status).toBe(200)
    expect(overlayJs.headers.get("cache-control")).toBe("no-store")
    expect(await overlayJs.text()).toContain("ce-annotate-host")
    expect((await fetch(`${origin}/__ce-annotate/annotate.css`)).status).toBe(200)
    await fs.writeFile(path.join(String(info.screen_dir), "annotate.js"), "window.prototypeOwned = true")
    const screenJs = await fetch(`${origin}/annotate.js`)
    expect(screenJs.status).toBe(200)
    expect(await screenJs.text()).toBe("window.prototypeOwned = true")
    expect(html).not.toContain("WebSocket")
    expect(html).not.toContain('fetch("/version"')
    expect(await fs.readFile(path.join(String(info.screen_dir), "001-screen.html"), "utf8")).not.toContain("ce-annotate-host")

    await fs.writeFile(
      path.join(String(info.screen_dir), "001-screen.html"),
      "<!DOCTYPE html><html><head></head><body><main><h1 id=\"heading\">Pin me</h1></main></body></html>",
    )
    const full = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    expect(full).toMatch(/<body[^>]*>\s*<main>/)
    expect(full).not.toContain("ce-prototype-root")
    expect(full).not.toContain("CE local web")
    const session = overlaySessionId(html)
    expect(session).not.toBe(token)
    expect(html).toContain(`data-ce-session="${session}"`)
  })

  test("overlay session id is unique per server start and is not the auth token", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-session-key-"))
    const first = await startServer(root, ["--annotate"])
    const html1 = await (await fetch(String(first.url), { headers: navigationHeaders(first) })).text()
    const session1 = overlaySessionId(html1)
    expect(session1).not.toBe(String(first.token))
    expect(html1).not.toContain(String(first.token))
    await runServerCommand(["stop", "--root", root])
    const second = await startServer(root, ["--annotate"])
    const html2 = await (await fetch(String(second.url), { headers: navigationHeaders(second) })).text()
    const session2 = overlaySessionId(html2)
    expect(session2).not.toBe(session1)
    expect(session2).not.toBe(String(second.token))
    expect(html2).not.toContain(String(second.token))
  })

  test("stamped screen pathname percent-encodes URL-significant characters", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-page-encode-"))
    const info = await startServer(root, ["--annotate"])
    await fs.writeFile(path.join(String(info.screen_dir), "001 special#view.html"), "<h1>Hash name</h1>")
    const html = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    expect(html).toContain('data-ce-page="/001%20special%23view.html"')
    expect(html).not.toContain('data-ce-page="/001 special#view.html"')
    expect((await postAnnotation(String(info.url), info.token, {
      comment: "rename",
      selector: "h1",
      page: "/001%20special%23view.html",
    })).status).toBe(200)
    expect((await flushAnnotations(String(info.url), info.token)).status).toBe(200)
    const waited = await fetch(`http://localhost:${info.port}/wait?token=${info.token}`)
    expect(waited.status).toBe(200)
    expect((await waited.json())[0].screen).toBe("001 special#view.html")
  })

  test("the record names the screen file the annotated page resolves to; a page that does not is refused", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-screen-"))
    const info = await startServer(root, ["--annotate"])
    const origin = `http://localhost:${info.port}`
    const screens = String(info.screen_dir)
    await fs.mkdir(path.join(screens, "pages"))
    await fs.writeFile(path.join(screens, "details.html"), "<h1>Details</h1>")
    await fs.writeFile(path.join(screens, "pages", "part.html"), "<h2>Part</h2>")
    await fs.writeFile(path.join(screens, "styles.css"), "h1 {}")
    await fs.mkdir(path.join(root, "outside"))
    await fs.writeFile(path.join(root, "outside", "leak.html"), "<h1>Leak</h1>")
    await fs.symlink(path.join(root, "outside"), path.join(screens, "escape"))
    await new Promise((resolve) => setTimeout(resolve, 20))
    await fs.writeFile(path.join(screens, "002-home.html"), "<h1>Home</h1>")

    const post = (body: Record<string, unknown>) =>
      postAnnotation(origin, info.token, { comment: "c", selector: "h1", ...body })
    const nextRecord = async () => {
      expect((await flushAnnotations(origin, info.token)).status).toBe(200)
      const waited = await fetch(`${origin}/wait?token=${info.token}`)
      expect(waited.status).toBe(200)
      const batch = await waited.json()
      expect(Array.isArray(batch)).toBe(true)
      expect(batch).toHaveLength(1)
      return batch[0]
    }

    expect((await post({ page: "/details.html" })).status).toBe(200)
    const details = await nextRecord()
    expect(Object.keys(details)).toEqual(["id", "screen", "comment", "selector", "textSnippet", "rect"])
    expect(details.screen).toBe("details.html")
    expect(details).not.toHaveProperty("page")

    expect((await post({ page: "/pages/part.html" })).status).toBe(200)
    expect((await nextRecord()).screen).toBe("pages/part.html")

    // "/" and a missing page (an older overlay) are the newest screen at that moment.
    expect((await post({ page: "/" })).status).toBe(200)
    expect((await nextRecord()).screen).toBe("002-home.html")
    expect((await post({})).status).toBe(200)
    expect((await nextRecord()).screen).toBe("002-home.html")
    const rootHtml = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    expect(rootHtml).toContain('data-ce-page="/002-home.html"')
    await new Promise((resolve) => setTimeout(resolve, 20))
    await fs.writeFile(path.join(screens, "003-next.html"), "<h1>Next</h1>")
    expect((await post({ page: "/002-home.html" })).status).toBe(200)
    expect((await nextRecord()).screen).toBe("002-home.html")
    expect((await post({ page: "/" })).status).toBe(200)
    expect((await nextRecord()).screen).toBe("003-next.html")

    // Anything that is not an HTML file under screens/ is refused, not guessed.
    for (const page of ["/nope.html", "../x", "/../outside/leak.html", "/styles.css", "/pages", "/escape/leak.html", "details.html", "/details.html?token=x", "/%ZZ", 5, null, ["/details.html"]]) {
      expect((await post({ page })).status, JSON.stringify(page)).toBe(400)
    }
  })

  test("annotate mode serves every HTML page the authenticated browser navigates to under screens/ with the overlay; fetches and assets stay raw; default mode is untouched", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-linked-"))
    const info = await startServer(root, ["--annotate"])
    const origin = `http://localhost:${info.port}`
    // Public files stay readable; authenticated navigations carry the overlay across pages.
    const details = '<!DOCTYPE html><html><head><link rel="stylesheet" href="/styles.css"></head><body><h1 id="detail">Details</h1></body></html>'
    await fs.mkdir(path.join(String(info.screen_dir), "pages"))
    await fs.writeFile(path.join(String(info.screen_dir), "details.html"), details)
    await fs.writeFile(path.join(String(info.screen_dir), "pages", "part.html"), "<h2>Part</h2>")
    const generated = "<!-- generated --><!DOCTYPE html><html><body><h1>Generated</h1></body></html>"
    await fs.writeFile(path.join(String(info.screen_dir), "generated.html"), generated)
    // Newest top-level .html is what / serves, unchanged: the home screen is written last.
    await new Promise((resolve) => setTimeout(resolve, 20))
    await fs.writeFile(path.join(String(info.screen_dir), "001-home.html"), '<a href="/details.html">details</a>')
    await fs.writeFile(path.join(String(info.screen_dir), "styles.css"), "h1 { color: red }")

    const page = await fetch(`${origin}/details.html`, { headers: navigationHeaders(info) })
    expect(page.status).toBe(200)
    expect(page.headers.get("content-type")).toBe("text/html; charset=utf-8")
    expect(page.headers.get("cache-control")).toBe("no-store")
    expect(page.headers.get("referrer-policy")).toBe("no-referrer")
    const pageHtml = await page.text()
    expect(pageHtml).toBe(`<!doctype html>\n${annotateBootFrom(pageHtml, origin, "/details.html")}\n${details}`)
    // A browser that sends no fetch metadata still navigates: it accepts HTML and states no mode.
    const noMeta = await (await fetch(`${origin}/details.html`, { headers: { cookie: navigationHeaders(info).cookie, Accept: "text/html,application/xhtml+xml" } })).text()
    expect(noMeta).toBe(`<!doctype html>\n${annotateBootFrom(noMeta, origin, "/details.html")}\n${details}`)
    const demoToken = await (await fetch(`${origin}/details.html?token=demo`, { headers: navigationHeaders(info) })).text()
    expect(demoToken).toBe(`<!doctype html>\n${annotateBootFrom(demoToken, origin, "/details.html")}\n${details}`)
    // Even a valid cookie must not expose the bearer in an authored document URL.
    const sessionDetails = await fetch(`${origin}/details.html?token=${info.token}`, { headers: navigationHeaders(info) })
    expect(sessionDetails.status).toBe(400)
    expect(await sessionDetails.text()).not.toContain(details)
    // A comment before the doctype is still a complete document, not a fragment.
    const generatedPage = await (await fetch(`${origin}/generated.html`, { headers: navigationHeaders(info) })).text()
    expect(generatedPage).toBe(`<!doctype html>\n${annotateBootFrom(generatedPage, origin, "/generated.html")}\n${generated}`)
    expect(generatedPage).not.toContain("CE local web")
    const homeHtml = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    expect(homeHtml).toContain(annotateBootFrom(homeHtml, origin, "/001-home.html"))

    // A fragment page gets the same shell as a fragment root screen.
    const part = await (await fetch(`${origin}/pages/part.html`, { headers: navigationHeaders(info) })).text()
    expect(part).toContain("<h2>Part</h2>")
    expect(part).toContain("CE local web")
    expect(part).toMatch(/<head>[\s\S]*<script defer src="[^"]+\/__ce-annotate\/annotate\.js" data-ce-session="[0-9a-f-]{36}" data-ce-document="[0-9a-f-]{36}" data-ce-page="\/pages\/part\.html"><\/script>[\s\S]*<\/head>/)
    await fs.writeFile(path.join(String(info.screen_dir), "pages", "note.html"), "<!-- note --><h2>Note</h2>")
    const note = await (await fetch(`${origin}/pages/note.html`, { headers: navigationHeaders(info) })).text()
    expect(note).toContain("<h2>Note</h2>")
    expect(note).toContain("CE local web")

    // A script fetching the same files gets them raw: a partial is not a screen.
    for (const headers of [
      { "Sec-Fetch-Dest": "empty", "Sec-Fetch-Mode": "cors", Accept: "*/*" },
      { "Sec-Fetch-Dest": "iframe", "Sec-Fetch-Mode": "navigate", Accept: "text/html" },
      { Accept: "*/*" },
      {},
    ]) {
      const raw = await fetch(`${origin}/pages/part.html`, { headers })
      expect(raw.headers.get("cache-control"), JSON.stringify(headers)).toBe("no-store")
      expect(await raw.text(), JSON.stringify(headers)).toBe("<h2>Part</h2>")
    }
    expect(await (await fetch(`${origin}/details.html`)).text()).toBe(details)
    const rootAsFetch = await (await fetch(String(info.url), { headers: { Accept: "*/*", "Sec-Fetch-Dest": "empty" } })).text()
    expect(rootAsFetch).toBe('<a href="/details.html">details</a>')
    expect(rootAsFetch).not.toContain("__ce-annotate")

    const css = await fetch(`${origin}/styles.css`)
    expect(css.headers.get("content-type")).toBe("text/css; charset=utf-8")
    expect(css.headers.get("cache-control")).toBe("no-store")
    expect(await css.text()).toBe("h1 { color: red }")

    // The root still serves the newest screen, not the linked page.
    const home = await (await fetch(String(info.url))).text()
    expect(home).toContain('<a href="/details.html">details</a>')
    expect(home).not.toContain("Details</h1>")

    const plainRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-linked-plain-"))
    const plain = await startServer(plainRoot)
    await fs.writeFile(path.join(String(plain.screen_dir), "details.html"), details)
    const raw = await fetch(`http://localhost:${plain.port}/details.html`)
    expect(raw.headers.get("cache-control")).toBeNull()
    expect(await raw.text()).toBe(details)
  })

  test("annotate pushes a screen-changed event for screen and asset edits without writing overlay into screens", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-change-"))
    const info = await startServer(root, ["--annotate"])
    const screenPath = path.join(String(info.screen_dir), "001-screen.html")
    const cssPath = path.join(String(info.screen_dir), "styles.css")
    await fs.writeFile(cssPath, "#heading{color:red}")
    await fs.writeFile(screenPath, "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"/styles.css\"></head><body><h1 id=\"heading\">Original</h1></body></html>")
    const origin = `http://localhost:${info.port}`
    const page = await fetch(String(info.url), { headers: navigationHeaders(info) })
    expect(page.status).toBe(200)
    // A reload must fetch the revised screen and assets, never a cached copy.
    expect(page.headers.get("cache-control")).toBe("no-store")
    const asset = await fetch(`${origin}/styles.css`)
    expect(asset.status).toBe(200)
    expect(asset.headers.get("cache-control")).toBe("no-store")
    const stream = await fetch(`${origin}/events?token=${info.token}`)
    expect(stream.status).toBe(200)
    const reader = stream.body!.getReader()
    const decoder = new TextDecoder()
    let text = ""
    const timedOut = Symbol("timed out")
    let pendingRead: Promise<ReadableStreamReadResult<Uint8Array>> | null = null
    const readUntil = async (predicate: () => boolean, ms: number) => {
      const deadline = Date.now() + ms
      while (Date.now() < deadline && !predicate()) {
        pendingRead ??= reader.read()
        const chunk = await Promise.race([
          pendingRead,
          new Promise<typeof timedOut>((resolve) => setTimeout(() => resolve(timedOut), Math.max(1, deadline - Date.now()))),
        ])
        if (chunk === timedOut) break
        pendingRead = null
        if (chunk.done) break
        text += decoder.decode(chunk.value, { stream: true })
      }
    }

    const events = () => text.split("event: screen-changed").length - 1

    // A stream opened right after the page was served must not announce the
    // screen it already shows; that reloaded (earlier: re-ran) the page on load.
    await readUntil(() => events() > 0, 700)
    expect(text).toContain(":ok")
    expect(events()).toBe(0)

    await fs.writeFile(screenPath, "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"/styles.css\"></head><body><h1 id=\"heading\">Revised</h1></body></html>")
    await readUntil(() => events() >= 1, 2000)
    expect(events()).toBe(1)
    // The client reloads on the event; the payload names the version only.
    expect(text).toMatch(/event: screen-changed\ndata: \{"version":"[0-9a-f]{40}"\}\n\n/)
    expect(text).not.toContain("Revised")
    expect(text).not.toContain("<h1")
    expect(await fs.readFile(screenPath, "utf8")).not.toContain("ce-annotate-host")

    // An asset the screen links changed while the screen file did not.
    await new Promise((resolve) => setTimeout(resolve, 20))
    await fs.writeFile(cssPath, "#heading{color:blue}")
    await readUntil(() => events() >= 2, 2000)
    expect(events()).toBe(2)
    const versions = [...text.matchAll(/"version":"([0-9a-f]{40})"/g)].map((match) => match[1])
    expect(new Set(versions).size).toBe(2)
    await reader.cancel()
  })

  test("a document serve records the rendered snapshot so a later rewrite still emits screen-changed", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-snapshot-key-"))
    const info = await startServer(root, ["--annotate"])
    const screenPath = path.join(String(info.screen_dir), "001-screen.html")
    await fs.writeFile(screenPath, "<h1>Original</h1>")
    const origin = `http://localhost:${info.port}`
    expect((await fetch(String(info.url), { headers: navigationHeaders(info) })).status).toBe(200)
    const open = await fetch(`${origin}/events?token=${info.token}`)
    expect(open.status).toBe(200)
    const reader = open.body!.getReader()
    const decoder = new TextDecoder()
    let text = ""
    const timedOut = Symbol("timed out")
    let pendingRead: Promise<ReadableStreamReadResult<Uint8Array>> | null = null
    const readUntil = async (predicate: () => boolean, ms: number) => {
      const deadline = Date.now() + ms
      while (Date.now() < deadline && !predicate()) {
        pendingRead ??= reader.read()
        const chunk = await Promise.race([
          pendingRead,
          new Promise<typeof timedOut>((resolve) => setTimeout(() => resolve(timedOut), Math.max(1, deadline - Date.now()))),
        ])
        if (chunk === timedOut) break
        pendingRead = null
        if (chunk.done) break
        text += decoder.decode(chunk.value, { stream: true })
      }
    }
    const events = () => text.split("event: screen-changed").length - 1
    await readUntil(() => text.includes(":ok"), 700)
    expect(events()).toBe(0)

    await fs.writeFile(screenPath, "<h1>Served</h1>")
    const page = await fetch(String(info.url), { headers: navigationHeaders(info) })
    expect(page.status).toBe(200)
    expect(await page.text()).toContain("<h1>Served</h1>")
    await readUntil(() => events() >= 1, 2000)
    expect(events()).toBe(1)

    await reader.cancel()
    const followUp = await fetch(`${origin}/events?token=${info.token}`)
    expect(followUp.status).toBe(200)
    const followReader = followUp.body!.getReader()
    let followText = ""
    let followPending: Promise<ReadableStreamReadResult<Uint8Array>> | null = null
    const followUntil = async (predicate: () => boolean, ms: number) => {
      const deadline = Date.now() + ms
      while (Date.now() < deadline && !predicate()) {
        followPending ??= followReader.read()
        const chunk = await Promise.race([
          followPending,
          new Promise<typeof timedOut>((resolve) => setTimeout(() => resolve(timedOut), Math.max(1, deadline - Date.now()))),
        ])
        if (chunk === timedOut) break
        followPending = null
        if (chunk.done) break
        followText += decoder.decode(chunk.value, { stream: true })
      }
    }
    const followEvents = () => followText.split("event: screen-changed").length - 1
    await followUntil(() => followEvents() > 0, 700)
    expect(followText).toContain(":ok")
    expect(followEvents()).toBe(0)

    await fs.writeFile(screenPath, "<h1>After serve</h1>")
    await followUntil(() => followEvents() >= 1, 2000)
    expect(followEvents()).toBe(1)
    await followReader.cancel()
  })

  test("overlay asset URLs are absolute on the request origin so a screen's <base> cannot redirect them", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-base-"))
    const info = await startServer(root, ["--annotate"])
    const origin = `http://localhost:${info.port}`
    const authored = '<!DOCTYPE html><html><head><base href="https://example.invalid/"></head><body><h1>Based</h1></body></html>'
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), authored)
    const html = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    // A full document is served verbatim behind our doctype and the deferred
    // boot; nothing in the authored text is located or rewritten.
    expect(html).toBe(`<!doctype html>\n${annotateBootFrom(html, origin, "/001-screen.html")}\n${authored}`)
    expect(html).not.toContain('src="/__ce-annotate')

    // So a "</body>" literal in a script string or a trailing comment, or a
    // leading BOM, cannot mislead the boot.
    const literalDoc = '<!DOCTYPE html><html><body><script>const closing = "</body>"</script><h1>Literal</h1></body></html><!-- marker: </body> -->'
    // The root serves the newest mtime; a write in the same filesystem tick as the previous screen ties.
    await new Promise((resolve) => setTimeout(resolve, 20))
    await fs.writeFile(path.join(String(info.screen_dir), "002-screen.html"), `\uFEFF${literalDoc}`)
    const literal = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    expect(literal).toBe(`<!doctype html>\n${annotateBootFrom(literal, origin, "/002-screen.html")}\n${literalDoc}`)

    await new Promise((resolve) => setTimeout(resolve, 20))
    const prologued = "<!-- generated -->\n<!DOCTYPE html><html><body><h1>Prologued</h1></body></html>"
    await fs.writeFile(path.join(String(info.screen_dir), "003-screen.html"), prologued)
    const prologuedHtml = await (await fetch(String(info.url), { headers: navigationHeaders(info) })).text()
    expect(prologuedHtml).toBe(`<!doctype html>\n${annotateBootFrom(prologuedHtml, origin, "/003-screen.html")}\n${prologued}`)
    expect(prologuedHtml).not.toContain("CE local web")

    // A Host header that cannot be reflected safely falls back to the listen address.
    const odd = await fetch(String(info.url), { headers: { ...navigationHeaders(info), host: 'evil"><script>' } })
    expect(odd.status).toBe(200)
    const oddHtml = await odd.text()
    expect(oddHtml).toContain(annotateBootFrom(oddHtml, `http://localhost:${info.port}`, "/003-screen.html"))
    expect(oddHtml).not.toContain('evil"')

    const overlay = await fs.readFile(path.join(import.meta.dir, "..", "..", "skills", "ce-prototype", "assets", "annotate.js"), "utf8")
    expect(overlay).toContain('new URL("/__ce-annotate/annotate.css", document.currentScript?.src || window.location.origin)')
    expect(overlay).toContain('document.createElement("ce-annotate-host")')
    expect(overlay).not.toContain("getRandomValues")
  })
})
