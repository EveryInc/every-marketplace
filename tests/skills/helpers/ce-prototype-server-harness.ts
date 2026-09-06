import { afterEach, expect } from "bun:test"

import http from "http"
import path from "path"

export const serverScript = path.join(
  import.meta.dir,
  "..",
  "..",
  "..",
  "skills",
  "ce-prototype",
  "scripts",
  "light-webserver.js",
)

type RunResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export async function readJsonLine(stream: ReadableStream<Uint8Array> | null): Promise<Record<string, string | number | null>> {
  expect(stream).not.toBeNull()
  const reader = stream!.getReader()
  const decoder = new TextDecoder()
  let text = ""
  const deadline = Date.now() + 3000
  while (Date.now() < deadline) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
    const newline = text.indexOf("\n")
    if (newline !== -1) {
      return JSON.parse(text.slice(0, newline))
    }
  }
  throw new Error(`Timed out waiting for server JSON. Received: ${text}`)
}

export async function runServerCommand(args: string[]): Promise<RunResult> {
  const proc = Bun.spawn(["node", serverScript, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  return { exitCode, stdout, stderr }
}

export function overlayDocumentId(html: string): string {
  const match = html.match(/data-ce-document="([0-9a-f-]{36})"/)
  expect(match, html.slice(0, 400)).toBeTruthy()
  return match![1]
}
export function overlaySessionId(html: string): string {
  const match = html.match(/data-ce-session="([0-9a-f-]{36})"/)
  expect(match, html.slice(0, 400)).toBeTruthy()
  return match![1]
}
export function annotateBoot(origin: string, page = "/", documentId?: string, sessionId?: string): string {
  const sessionAttr = sessionId ? ` data-ce-session="${sessionId}"` : ""
  const documentAttr = documentId ? ` data-ce-document="${documentId}"` : ""
  return `<script defer src="${origin}/__ce-annotate/annotate.js"${sessionAttr}${documentAttr} data-ce-page="${page}"></script>`
}
export function annotateBootFrom(html: string, origin: string, page = "/"): string {
  return annotateBoot(origin, page, overlayDocumentId(html), overlaySessionId(html))
}
export function eventsUrl(origin: string, token: unknown, documentId?: string): string {
  const url = new URL("/events", origin)
  url.searchParams.set("token", String(token))
  if (documentId) url.searchParams.set("document", documentId)
  return url.href
}
// What a browser sends when it navigates to a page, as opposed to a script's fetch.
export const NAVIGATE = { "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate", Accept: "text/html,*/*;q=0.8" }

export function postAnnotation(origin: string, token: unknown, body: object) {
  return fetch(`${origin}/annotation?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export function flushAnnotations(origin: string, token: unknown) {
  return fetch(`${origin}/session/flush?token=${token}`, { method: "POST" })
}

// Connection: close after a completed body, then destroy the socket. The
// overlay still has to open /events on a new connection.
export function fetchDocumentClosingConnection(url: string, token: unknown): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { agent: false, headers: { ...navigationHeaders(token), Connection: "close" } }, (res) => {
      const chunks: Buffer[] = []
      res.on("data", (chunk) => {
        chunks.push(chunk)
      })
      res.on("end", () => {
        const sock = req.socket || res.socket
        req.destroy()
        sock?.destroy()
        resolve(Buffer.concat(chunks).toString("utf8"))
      })
    })
    req.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ECONNRESET") return
      reject(err)
    })
  })
}

export function fetchDocumentKeepAlive(url: string, agent: http.Agent, token: unknown): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { agent, headers: navigationHeaders(token) }, (res) => {
      const chunks: Buffer[] = []
      res.on("data", (chunk) => {
        chunks.push(chunk)
      })
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    })
    req.on("error", reject)
  })
}

export function navigationHeaders(token: unknown) {
  return { ...NAVIGATE, Authorization: `Bearer ${token}` }
}

// Each test file owns its roots, even in a non-isolated serial Bun run.
export function createServerHarness() {
  const rootsToStop: string[] = []
  async function startServer(
    root: string,
    extraArgs: string[] = [],
    env: Record<string, string> = {},
  ): Promise<Record<string, string | number | null>> {
    const proc = Bun.spawn(["node", serverScript, "start", "--root", root, "--port", "0", ...extraArgs], {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, ...env },
    })
    const [exitCode, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ])
    const result = { exitCode, stdout, stderr }
    expect(result.exitCode, result.stderr).toBe(0)
    rootsToStop.push(root)
    return JSON.parse(result.stdout.trim())
  }

  afterEach(async () => {
    while (rootsToStop.length > 0) {
      const root = rootsToStop.pop()!
      await runServerCommand(["stop", "--root", root])
    }
  })

  return { startServer, rootsToStop }
}
