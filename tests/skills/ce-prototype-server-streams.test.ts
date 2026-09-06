import { describe, expect, setDefaultTimeout, test } from "bun:test"
import { promises as fs } from "fs"
import http from "http"
import os from "os"
import path from "path"
import {
  createServerHarness, runServerCommand, overlayDocumentId, eventsUrl, fetchDocumentClosingConnection, fetchDocumentKeepAlive, navigationHeaders,
} from "./helpers/ce-prototype-server-harness"

setDefaultTimeout(20_000)
const { startServer } = createServerHarness()

describe("ce-prototype light-webserver.js / streams", () => {
  test("closing the last change stream ends the session after a reconnect grace", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-end-"))
    const info = await startServer(root, ["--annotate"], { CE_LIGHT_WEB_SSE_GRACE_MS: "80" })
    const origin = `http://localhost:${info.port}`
    const controller = new AbortController()
    const stream = await fetch(`${origin}/events?token=${info.token}`, { signal: controller.signal })
    expect(stream.status).toBe(200)
    controller.abort()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const result = await runServerCommand(["wait", "--root", root])
    expect(result.exitCode, result.stderr).toBe(1)
    expect(JSON.parse(result.stdout.trim()).status).toBe("session-ended")
  })

  test("a page load during the reconnect grace keeps the session live until the overlay reconnects", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-reload-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "400",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const controller = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: controller.signal })).status).toBe(200)
    controller.abort()
    await new Promise((resolve) => setTimeout(resolve, 200))
    const page = await fetch(String(info.url), { headers: navigationHeaders(info.token) })
    expect(page.status).toBe(200)
    const documentId = overlayDocumentId(await page.text())

    // Past the original grace and past a restarted elapsed grace: the
    // replacement document stays live until /events connects again.
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)

    const reconnect = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, documentId), { signal: reconnect.signal })).status).toBe(200)
    reconnect.abort()
    await new Promise((resolve) => setTimeout(resolve, 550))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("a replacement document arriving before the old stream closes keeps the session live", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-doc-first-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "400",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const controller = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: controller.signal })).status).toBe(200)
    const page = await fetch(String(info.url), { headers: navigationHeaders(info.token) })
    expect(page.status).toBe(200)
    const documentId = overlayDocumentId(await page.text())
    controller.abort()

    // Past a grace that the old-stream close would have started if the
    // replacement document had not suppressed it.
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)

    const reconnect = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, documentId), { signal: reconnect.signal })).status).toBe(200)
    reconnect.abort()
    await new Promise((resolve) => setTimeout(resolve, 550))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("a second overlay reconnect does not end the session while another document is still pending", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-two-docs-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "400",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const first = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: first.signal })).status).toBe(200)

    // Two replacement documents outstanding; only one overlay reconnects.
    const firstPage = await fetch(String(info.url), { headers: navigationHeaders(info.token) })
    const secondPage = await fetch(String(info.url), { headers: navigationHeaders(info.token) })
    expect(firstPage.status).toBe(200)
    expect(secondPage.status).toBe(200)
    const firstDocument = overlayDocumentId(await firstPage.text())
    const secondDocument = overlayDocumentId(await secondPage.text())
    const second = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, firstDocument), { signal: second.signal })).status).toBe(200)
    first.abort()
    second.abort()

    await new Promise((resolve) => setTimeout(resolve, 700))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)

    const reconnect = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, secondDocument), { signal: reconnect.signal })).status).toBe(200)
    reconnect.abort()
    await new Promise((resolve) => setTimeout(resolve, 550))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("an overlay reconnect does not release a different document's pending load", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-bind-doc-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "400",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const loadedPage = await fetch(String(info.url), { headers: navigationHeaders(info.token) })
    expect(loadedPage.status).toBe(200)
    const loadedDocument = overlayDocumentId(await loadedPage.text())
    const loaded = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, loadedDocument), { signal: loaded.signal })).status).toBe(200)

    const pendingPage = await fetch(String(info.url), { headers: navigationHeaders(info.token) })
    expect(pendingPage.status).toBe(200)
    const pendingDocument = overlayDocumentId(await pendingPage.text())
    expect(pendingDocument).not.toBe(loadedDocument)

    const unrelated = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, loadedDocument), { signal: unrelated.signal })).status).toBe(200)
    loaded.abort()
    unrelated.abort()

    await new Promise((resolve) => setTimeout(resolve, 700))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)

    const complete = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, pendingDocument), { signal: complete.signal })).status).toBe(200)
    complete.abort()
    await new Promise((resolve) => setTimeout(resolve, 550))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("a close-delimited replacement document stays live until the overlay connects", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-close-delimited-doc-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "100",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const controller = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: controller.signal })).status).toBe(200)

    const html = await fetchDocumentClosingConnection(String(info.url), info.token)
    const documentId = overlayDocumentId(html)
    controller.abort()

    await new Promise((resolve) => setTimeout(resolve, 250))
    const reconnect = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, documentId), { signal: reconnect.signal })).status).toBe(200)
    reconnect.abort()
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("a script fetch of the root does not keep the session live after the stream closes", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-script-root-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "80",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const controller = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: controller.signal })).status).toBe(200)
    const page = await fetch(String(info.url), { headers: { Accept: "*/*", "Sec-Fetch-Dest": "empty" } })
    expect(page.status).toBe(200)
    expect(await page.text()).not.toContain("__ce-annotate")
    controller.abort()
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(410)
  })

  test("two keep-alive document navigations keep both pending handshakes", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-prototype-sse-keepalive-"))
    const info = await startServer(root, ["--annotate"], {
      CE_LIGHT_WEB_SSE_GRACE_MS: "400",
      CE_LIGHT_WEB_WAIT_TIMEOUT_MS: "40",
    })
    const origin = `http://localhost:${info.port}`
    const agent = new http.Agent({ keepAlive: true, maxSockets: 1 })
    const controller = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token), { signal: controller.signal })).status).toBe(200)
    const firstHtml = await fetchDocumentKeepAlive(String(info.url), agent, info.token)
    const secondHtml = await fetchDocumentKeepAlive(String(info.url), agent, info.token)
    const firstDocument = overlayDocumentId(firstHtml)
    const secondDocument = overlayDocumentId(secondHtml)
    expect(firstDocument).not.toBe(secondDocument)
    const second = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, secondDocument), { signal: second.signal })).status).toBe(200)
    controller.abort()
    second.abort()
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect((await fetch(`${origin}/wait?token=${info.token}`)).status).toBe(204)
    const first = new AbortController()
    expect((await fetch(eventsUrl(origin, info.token, firstDocument), { signal: first.signal })).status).toBe(200)
    first.abort()
    agent.destroy()
  })
})
