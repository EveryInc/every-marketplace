import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { createHash } from "node:crypto"
import {
  createServerHarness, serverScript, runServerCommand, annotateBootFrom, eventsUrl, NAVIGATE,
} from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer } = createServerHarness()

describe("ce-prototype light-webserver.js / auth", () => {
  test("annotate routes require the token and reject a bad annotation body", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-annotate-auth-"))
    const info = await startServer(root, ["--annotate"])
    const origin = `http://localhost:${info.port}`
    const headers = { "Content-Type": "application/json" }

    expect((await fetch(`${origin}/wait`)).status).toBe(401)
    expect((await fetch(`${origin}/events`)).status).toBe(401)
    expect((await fetch(`${origin}/annotation`, { method: "POST", headers, body: "{}" })).status).toBe(401)
    expect((await fetch(`${origin}/session/flush`, { method: "POST" })).status).toBe(401)
    const sameLength = `${String(info.token).slice(0, -1)}${String(info.token).endsWith("0") ? "1" : "0"}`
    expect((await fetch(`${origin}/wait?token=${sameLength}`)).status).toBe(401)
    expect((await fetch(`${origin}/wait?token=${String(info.token).slice(0, 8)}`)).status).toBe(401)
    expect(/timingSafeEqual\(/.test(await fs.readFile(serverScript, "utf8"))).toBe(false)

    const authed = `${origin}/annotation?token=${info.token}`
    expect((await fetch(authed, { method: "POST", headers, body: "" })).status).toBe(400)
    expect((await fetch(authed, { method: "POST", headers, body: "not-json" })).status).toBe(400)
    expect((await fetch(authed, { method: "POST", headers, body: "{}" })).status).toBe(400)
    expect((await fetch(authed, { method: "POST", headers, body: JSON.stringify({ comment: "x" }) })).status).toBe(400)
    expect((await fetch(authed, { method: "POST", headers, body: JSON.stringify({ selector: "h1" }) })).status).toBe(400)
  })

  test("only the private bootstrap issues a cookie for gated overlay routes", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-cookie-"))
    const info = await startServer(root, ["--annotate"])
    const origin = String(info.url)
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), "<h1>Variant home</h1>")

    const bootstrap = await fetch(String(info.authorize_url))
    expect(bootstrap.status).toBe(200)
    expect(bootstrap.headers.get("cache-control")).toBe("no-store")
    expect(bootstrap.headers.get("referrer-policy")).toBe("no-referrer")
    const body = await bootstrap.text()
    expect(body).not.toContain(String(info.token))
    expect(body).not.toContain("Variant home")
    // A helper-owned document starts a same-site navigation, rather than an
    // HTTP redirect that can withhold a Strict cookie after a cross-site click.
    const script = body.match(/<script>([^<]+)<\/script>/)![1]
    expect(script).toBe('window.location.replace("/")')
    const hash = createHash("sha256").update(script).digest("base64")
    expect(bootstrap.headers.get("content-security-policy")).toBe(
      `default-src 'none'; script-src 'sha256-${hash}'; base-uri 'none'; frame-ancestors 'none'`,
    )
    const cookie = bootstrap.headers.get("set-cookie") ?? ""
    expect(cookie).toMatch(
      new RegExp(`^ce-light-web-${info.port}=${info.token}; HttpOnly; SameSite=Strict; Path=/$`),
    )
    const pair = cookie.split(";")[0]
    const page = await fetch(`${origin}/?variant=a&token=demo`, { headers: { ...NAVIGATE, cookie: pair } })
    expect(page.status).toBe(200)
    expect(page.headers.get("set-cookie")).toBeNull()
    const html = await page.text()
    expect(html).toContain("Variant home")
    expect(html).toContain(annotateBootFrom(html, origin, "/001-screen.html"))
    expect(html).not.toContain(String(info.token))

    const posted = await fetch(`${origin}/annotation`, {
      method: "POST", headers: { cookie: pair, "Content-Type": "application/json" },
      body: JSON.stringify({ comment: "authorized note", selector: "h1" }),
    })
    expect(posted.status).toBe(200)
    expect((await fetch(`${origin}/session/flush`, { method: "POST", headers: { cookie: pair } })).status).toBe(200)
    const waited = await fetch(`${origin}/wait`, { headers: { cookie: pair } })
    expect(waited.status).toBe(200)
    expect((await waited.json())[0].comment).toBe("authorized note")
    const controller = new AbortController()
    expect((await fetch(`${origin}/events`, { headers: { cookie: pair }, signal: controller.signal })).status).toBe(200)
    controller.abort()
    expect((await fetch(`${origin}/events`)).status).toBe(401)
    expect((await fetch(`${origin}/wait`)).status).toBe(401)
    expect((await fetch(`${origin}/session/end`, { method: "POST", headers: { cookie: pair } })).status).toBe(200)
    const ended = await fetch(String(info.authorize_url))
    expect(ended.status).toBe(410)
    expect(ended.headers.get("set-cookie")).toBeNull()
  })

  test("overlay arms comments only when the tool is on and Send to agent flushes a batch", async () => {
    const overlay = await fs.readFile(path.join(import.meta.dir, "..", "..", "skills", "ce-prototype", "assets", "annotate.js"), "utf8")
    expect(overlay).toContain("let commentToolOn = false")
    expect(overlay).toContain("ce-annotate-catcher")
    expect(overlay).toContain("elementsFromPoint")
    expect(overlay).toContain("catcher.hidden = !on")
    const overlayCss = await fs.readFile(path.join(import.meta.dir, "..", "..", "skills", "ce-prototype", "assets", "annotate.css"), "utf8")
    expect(overlayCss).toContain("cursor: crosshair")
    expect(overlay).toMatch(/if \(!commentToolOn \|\| sessionEnded \|\| agentHasBatch\(\)\) return/)
    expect(overlay).not.toMatch(/document\.addEventListener\("click", \(event\)/)
    expect(overlay).toContain('tokenUrl(sending ? "/session/flush" : "/session/end")')
    expect(overlay).toMatch(/while \(inFlight && !sessionEnded\)/)
    expect(overlay).toContain("unflushedCount")
    expect(overlay).toContain('held: "pending"')
    expect(overlay).toContain("target-gone")
    expect(overlay).toContain("EventSource")
    expect(overlay).toContain("ce-prototype-root")
    expect(overlay).toContain('if (el === document.body) return "body"')
    expect(overlay).toContain(">Annotate</span>")
    expect(overlay).toContain(">Ctrl+A</kbd>")
    expect(overlay).toContain("freezeRootFrom")
    expect(overlay).toContain("shouldFreezeProp")
    expect(overlay).toContain("webkit-text-fill")
    expect(overlay).toContain("window.innerWidth * window.innerHeight")
    expect(overlay).toContain("background: transparent")
    expect(overlay).toMatch(/if \(!shouldFreezeProp\(prop\)\) continue/)
    expect(overlay).toContain("el.style.setProperty(prop, cs.getPropertyValue(prop))")
    expect(overlay).toContain("item.el.style.removeProperty(prop)")
    expect(overlay).toContain("ce-annotate-hotkey")
    expect(overlay).toContain("freezeHoverThenAnnotate")
    expect(overlay).toContain("aria-keyshortcuts=\"Control+A Escape\"")
    expect(overlay).toContain('event.key === "Escape"')
    expect(overlay).toMatch(/if \(commentToolOn\) \{\n\s+setCommentTool\(false\)/)
    expect(overlay).toContain(">End session</button>")
    expect(overlay).toContain("Send to agent")
    expect(overlay).toContain("ce-annotate-count")
    expect(overlay).toContain("toggle.hidden = true")
    expect(overlay).toContain("stop.hidden = true")
    expect(overlay).toContain("agentHasBatch")
    expect(overlay).toContain('setStatus("Sent to agent")')
    // display:inline-flex on the chips otherwise beats the UA [hidden] rule.
    expect(overlayCss).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important;/)
    expect(overlay).not.toContain("<svg")
    expect(overlay).not.toContain(">End preview</button>")
    expect(overlay).not.toContain(">Send to agent</button>")
    expect(overlay).not.toContain(">Comment</button>")
    expect(overlay).not.toContain(">Done</button>")
    expect(overlay).not.toContain(">Stop</button>")
    expect(overlay).toContain("Could not send to agent — retry")
    expect(overlay).toContain("Could not end session — retry")
    expect(overlay).toContain('pin.status === "pending" || pin.status === "working"')
    expect(overlay).toContain('addEventListener("scroll", reattachPins')
    expect(overlay).toContain("new ResizeObserver(reattachPins)")
    expect(overlay).toContain("new MutationObserver(reattachPins)")
    expect(overlay).toContain("EventSource.CLOSED")
    // Every screen change reloads the document with the pins carried across;
    // the overlay never reconciles DOM, head, or scripts itself.
    expect(overlay).toContain('addEventListener("screen-changed"')
    expect(overlay).toContain("sessionStorage.setItem(STATE_KEY")
    expect(overlay).toContain('addEventListener("pagehide"')
    expect(overlay).toContain("pinOnThisPage")
    expect(overlay).toContain("event.persisted")
    expect(overlay).not.toContain("sessionStorage.removeItem")
    expect(overlay).toContain("window.location.replace(`${servedPage}${window.location.search}${window.location.hash}`)")
    expect(overlay).not.toContain("window.location.reload()")
    // Pin status follows the helper's annotation lifecycle, never a reload;
    // an open draft survives a reload; a reload waits for an in-flight POST.
    expect(overlay).toContain('addEventListener("annotations"')
    expect(overlay).toContain('{ held: "pending", queued: "pending", working: "working", done: "attached" }')
    expect(overlay).not.toContain("advancePinsAfterRevision")
    expect(overlay).toMatch(/draft: draft\n\s+\? \{ \.\.\.draft, page: servedPage, text: commentField\.value/)
    expect(overlay).toMatch(/if \(inFlight\) \{\n\s+reloadPending = true/)
    expect(overlay).toContain("if (reloadPending && !sessionEnded) requestReload()")
    // Cancel or toggling the tool off during an in-flight POST must not break
    // the pending submission: it is snapshotted before the await, Cancel is
    // disabled, and closing the composer does not reset inFlight.
    expect(overlay).toContain("cancel.disabled = inFlight")
    const submitHandler = overlay.slice(overlay.indexOf('composer.addEventListener("submit"'), overlay.indexOf('stop.addEventListener("click"'))
    expect(submitHandler).toContain("await fetch(")
    expect(submitHandler.slice(submitHandler.indexOf("await "))).not.toMatch(/\bdraft\b/)
    expect(submitHandler).toMatch(/catch \{\n\s+if \(!sessionEnded\) \{/)
    expect(submitHandler).toContain('error.textContent = "Could not send — retry"')
    const closeComposer = overlay.slice(overlay.indexOf("function closeComposer("), overlay.indexOf("function renderPins()"))
    expect(closeComposer).not.toContain("inFlight = false")
    expect(overlay).toContain("closeComposer(inFlight)")
    expect(overlay).toContain('addEventListener("click", () => closeComposer())')
    expect(overlay).toContain("composer.hidden = false")
    expect(overlay).toContain('document.createElement("ce-annotate-host")')
    expect(overlay).not.toContain("getRandomValues")
    expect(overlay).not.toContain("randomUUID")
    expect(overlay).not.toMatch(/host\.(id|className) =/)
    expect(overlay).toContain("Math.max(0, Math.min(x + 12, window.innerWidth - width))")
    // Parented on <html>, fixed and click-through, so it is outside every
    // body-scoped selector, document.body.children, and the authored layout.
    expect(overlay).toContain("document.documentElement.appendChild(host)")
    expect(overlay).not.toContain("document.body.appendChild(")
    expect(overlay).toMatch(/host\.style\.cssText =\s*"display: block; position: fixed; inset: 0; width: auto; height: auto; overflow: visible; color: inherit; background: transparent; pointer-events: none; z-index: \d+;/)
    // z-index cannot beat dialog.showModal(); a manual popover is the top layer.
    expect(overlay).toContain('setAttribute("popover", "manual")')
    expect(overlay).toContain("showPopover")
    expect(overlay).toContain("hidePopover")
    expect(overlay).toContain('nodeName === "DIALOG"')
    // The pin and the reload name the screen the helper served, not a History API pathname.
    expect(overlay).toContain('document.currentScript?.getAttribute("data-ce-page") || "/"')
    expect(overlay).toContain('document.currentScript?.getAttribute("data-ce-document") || ""')
    expect(overlay).toContain('document.currentScript?.getAttribute("data-ce-session") || ""')
    expect(overlay).toContain("`ce-annotate-state:${overlaySession}`")
    expect(overlay).toContain('tokenUrl("/events", { document: servedDocument })')
    expect(overlay).toContain("page: servedPage,")
    expect(overlay).toContain("window.location.replace(`${servedPage}${window.location.search}${window.location.hash}`)")
    expect(overlay).not.toContain("window.location.pathname")
    const css = await fs.readFile(path.join(import.meta.dir, "..", "..", "skills", "ce-prototype", "assets", "annotate.css"), "utf8")
    expect(css).toMatch(/:host \{\n  position: fixed;\n  inset: 0;\n  width: auto;\n  height: auto;\n  overflow: visible;\n  color: inherit;\n  background: transparent;\n  pointer-events: none;/)
    expect(css).toMatch(/\.ce-annotate-chrome \{[^}]*pointer-events: auto;/)
    expect(css).toMatch(/\.ce-annotate-chrome \{[^}]*background: #fff;/)
    expect(css).toMatch(/\.ce-annotate-chrome \{[^}]*box-shadow:/)
    expect(css).toMatch(/\.ce-annotate-composer \{[^}]*pointer-events: auto;/)
    expect(css).toMatch(/\.ce-annotate-composer \{[^}]*box-sizing: border-box;/)
    expect(css).toMatch(/\.ce-annotate-composer \{[^}]*max-width: 100vw;/)
    expect(overlay).not.toContain("getElementById(\"ce-annotate-host\")")
    expect(overlay).not.toContain("#ce-annotate-host")
    expect(overlay).toContain("el === host || host.contains(el)")
    expect(overlay).not.toContain("DOMParser")
    expect(overlay).not.toContain("adoptNode")
    expect(overlay).not.toMatch(/\bmorph\b/i)
    expect(overlay).not.toMatch(/WebSocket/)
  })

  test("public navigation cannot obtain annotation credentials even on a wildcard listener", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-public-auth-"))
    const info = await startServer(root, ["--annotate", "--host", "0.0.0.0"])
    const origin = `http://localhost:${info.port}`
    const html = "<h1>Public view</h1>"
    await fs.writeFile(path.join(String(info.screen_dir), "001-screen.html"), html)
    for (const pathname of ["/", "/001-screen.html", "/001-screen.html?token=demo"]) {
      for (const headers of [NAVIGATE, { Accept: "text/html" }, {}]) {
        const response = await fetch(`${origin}${pathname}`, { headers })
        expect(response.status).toBe(200)
        expect(response.headers.get("set-cookie")).toBeNull()
        expect(await response.text()).toBe(html)
      }
    }
    for (const token of ["", "demo", String(info.token).slice(0, 8), `${String(info.token).slice(0, -1)}x`]) {
      const response = await fetch(`${origin}/__ce-annotate/authorize?token=${token}`, { headers: NAVIGATE })
      expect(response.status).toBe(401)
      expect(response.headers.get("set-cookie")).toBeNull()
      expect(await response.text()).not.toContain(String(info.token))
    }
    for (const endpoint of ["/annotation", "/session/flush", "/session/end"]) {
      const response = await fetch(`${origin}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json", cookie: `ce-light-web-${info.port}=demo` },
        body: JSON.stringify({ comment: "not authorized", selector: "h1" }),
      })
      expect(response.status).toBe(401)
    }
    expect((await fetch(`${origin}/events`)).status).toBe(401)
    expect((await fetch(`${origin}/wait`)).status).toBe(401)
  })

  test("a public document does not hold an annotation session open", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-public-lifetime-"))
    const info = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_SSE_GRACE_MS: "80" })
    const origin = String(info.url)
    const controller = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: controller.signal })).status).toBe(200)
    const page = await fetch(`${origin}/`, { headers: NAVIGATE })
    expect(page.status).toBe(200)
    expect(page.headers.get("set-cookie")).toBeNull()
    expect(await page.text()).not.toContain("data-ce-document")
    controller.abort()
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("restart rejects the previous bootstrap token and cookie", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-bootstrap-restart-"))
    const first = await startServer(root, ["--annotate"])
    const issued = await fetch(String(first.authorize_url))
    const cookie = (issued.headers.get("set-cookie") ?? "").split(";")[0]
    expect(issued.status).toBe(200)
    await issued.text()
    await runServerCommand(["stop", "--root", root])
    const second = await startServer(root, ["--annotate"])
    expect(second.token).not.toBe(first.token)
    const oldLink = new URL(String(second.authorize_url))
    oldLink.searchParams.set("token", String(first.token))
    const refused = await fetch(oldLink, { headers: { cookie } })
    expect(refused.status).toBe(401)
    expect(refused.headers.get("set-cookie")).toBeNull()
    const oldCookieOnNewPort = `ce-light-web-${second.port}=${first.token}`
    expect((await fetch(`${second.url}/events`, { headers: { cookie: oldCookieOnNewPort } })).status).toBe(401)
    const current = await fetch(String(second.authorize_url))
    expect(current.status).toBe(200)
    expect(current.headers.get("set-cookie")).toContain(String(second.token))
  })
})
