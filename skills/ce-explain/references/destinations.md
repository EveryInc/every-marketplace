# Requested Destinations

Load only when delivery to a destination was requested. Use the available capability for that destination and verify the resulting file, URL, or document reference. A calling workflow that owns the surrounding artifact also owns placement and publication; return the explanation to it instead.

Resolve only the destination information needed to complete the request. Do not require a menu or offer to rewrite or improve the explanation. Adapt the content for its intended reader before asking for any required consent to publish it. On a delivery failure, preserve the canonical local artifact and report what did not complete. Do not substitute another publisher without authorization.

## Claude Artifact

Available for HTML output when the session is Claude Code and its Artifact tool is present. Give the tool the canonical `$RUN_DIR/explainer.html`, follow its current contract, and confirm the returned URL or reference to the user. The tool owns any adaptation needed for its artifact runtime; do not pre-process the HTML for it.

## Publish publicly to ht-ml.app

This is the preferred HTML publisher when the Claude Artifact adapter is not selected. ht-ml.app accepts the complete standalone HTML document and works through ordinary HTTP, independent of the agent harness.

Before publishing, state that **the page is public and may be indexed, crawled, copied, or archived** and obtain explicit confirmation after that warning for the actual artifact being sent. The initial request itself does not count as confirmation. Confirmation given after the warning covers the same artifact. If the artifact changes materially, obtain confirmation for the changed content. If confirmation cannot be obtained, do not publish; preserve the canonical `$RUN_DIR/explainer.html` and report its local path. Never publish headlessly. If the content is sensitive, keep it local.

After the user selects the warned option or explicitly confirms after the warning:

1. Prefer any ht-ml.app or general HTML-publishing capability detected in the current session. When it is a skill, invoke it through the platform's skill-invocation primitive with the canonical `$RUN_DIR/explainer.html` and the user's public-publishing confirmation; otherwise call the detected tool, connector, or browser capability directly. Follow that capability's current contract. Do not assume a particular skill name or installation path.
2. When no publisher is installed, use a reachable web or HTTP interface to follow ht-ml.app's agent-facing instructions at `https://ht-ml.app/llms.txt` (or its linked API help) and publish the complete canonical HTML. The explainer is already composed; do not select a template or redesign it.
3. Surface the returned URL. Treat any returned update credential as a secret: do not print it in chat or embed it in the page. On failure, retry once after a short wait, then report the error and fall back to the canonical local-file path.

## Local file

1. Ask nothing extra if the user already named a path; otherwise ask for the missing path under the skill body's interaction rule.
2. Copy the artifact out of the run dir to that path (`cp "$RUN_DIR/explainer.html" <path>` — or `explainer.md` for a markdown run), creating parent directories if needed.
3. Report the absolute path. Open it when requested and the host supports that action.

## Publish to Proof (markdown output only)

Proof ingests markdown, so this option renders only when the run resolved `output:md`. Invoke the `ce-proof` skill via the platform's skill-invocation primitive when it is installed, passing the artifact path, a title (`Explainer: <subject>`), and identity `ai:compound-engineering` / `Compound Engineering`; surface the returned share URL. When the skill is not installed but the Proof web API is reachable, POST the markdown per that API. On failure: retry once after a short wait, then report plainly that the upload didn't succeed and why, and fall back to the local-file path. One-way publish; the run-dir file stays canonical.

## Send to Thinkroom

Offered only when a Thinkroom capability is detected — a Thinkroom skill in the session's skill list, a reachable MCP tool, or a documented CLI that responds. Use whatever interface that capability exposes to create/share a document from the explainer content, following that interface's own contract for title and body format. Surface the returned document reference. When the send fails, report it and fall back to the local-file path. Never guess at a Thinkroom API shape when no capability is detectable — the option simply doesn't render.
