# Establish the Frame Before Grounding

Every Phase 0 loads this, because every run has to settle a frame before spending the scout fan-out. What happens after that follows from the frame.

An intent that routes out of this skill — an explainer, or anything `references/boundaries.md` sends elsewhere — finishes here: say where the request belongs, and stop. No tier, no hatch, no grounding.

Every invocation whose settled frame is a POV takes the **reversibility tier and the selection escape hatch** (in *Tier, sizing, and the selection hatch* at the end), including one whose subject and intent were obvious from the start. The orienting and proposing steps (Steps 1-3) are the path for an input that does not already say what POV the user wants — a bare link, a bare topic, a warm invocation with no stated question; on a clear frame, state it in one line and go straight to the tier and the hatch. Resolve a supported frame; return essential missing framing rather than guessing or interviewing.

## Output mode and warm invocations

By default this skill writes no document. The POV is a compact chat block, and a write-up or a `ce-compound` capture requires an explicit request at Phase 4. Do not resolve an output format or load a rendering reference up front.

A **warm** invocation is a mid-session second opinion, with the question sitting in the conversation or absent. On one, read `references/invocation.md`, and take only the *question and claims-to-verify* from the conversation, never grounding.

## Why this gate exists

The same subject supports very different verdicts. A link to a new sign-in method could mean "should we **adopt** it?", "should we **migrate** to it, and how costly?", "how does it **compare** to what we have?", or "I just have a **question** about it." Guessing "migrate" sends all three scouts after migration cost and answers a question the user never asked. The frame determines what the scouts even look for, so settle it first.

## Step 1 — Orient on what was provided (cheap, pre-grounding)

- **A bare link** → fetch it lightly (one fetch) to learn what the thing *is*; name it. If you cannot fetch it (no web tool, paywalled), return the missing subject context rather than assuming.
- **A bare topic or name** → recognize it from your own knowledge; a single search only if you genuinely can't place it.
- **A document path** → read its headings to learn its purpose and shape; do not review it for findings yet.
- **An approach set** → identify the options already on the table; do not invent additional options during orientation.
- **A paste or provided context** → read it.

This is orientation, not grounding — keep it to one read/fetch. The project and external grounding (the scouts) come *after* the frame is set.

## Step 2 — Determine the POV intent

The subject is usually recoverable; the **intent** is the ambiguous part. Classify it:

- **Adopt** — use this new capability (net-new, or no incumbent)?
- **Migrate / replace** — switch *from an incumbent* to this?
- **Compare** — how does it stack up vs. what we have or the alternatives (no switch implied)?
- **Exposure** — is this (a CVE, deprecation, or ecosystem change) *our problem*?
- **Document-take** — what is the holistic take on this document: its strengths, risks, and bottom line, rather than a findings review?
- **Approach-set** — which of the supplied approaches fits this project, and why, or are the options honestly viable either way?
- **Explainer** — they just want to understand it. This is **not** a verdict — handle it as a general research question (or a dedicated deep-research-style tool, *if the environment has one*), rather than forcing one.

## Step 3 — Resolve the frame or return what is missing

Resolve conversational shorthand from the active context when one referent fits. When the subject and intent are clear, state the frame and proceed without confirmation. If competing readings would materially change the POV and available context cannot decide between them, return **Blocked — missing framing** with those readings and the information needed to distinguish them. Do not launch grounding or peers on an invented frame.

For a clear question, investigate discoverable decision criteria in grounding. Return missing essential criteria if the evidence cannot establish them; do not choose a product preference merely to avoid blocking. An explainer routes to a normal research answer rather than a manufactured verdict.

## Warm invocations

The conversation supplies the question and claims to verify. Resolve them under the same frame boundary, then return the position or missing framing to the invoking caller. See `references/invocation.md` for guest output and provenance.

## Tier, sizing, and the selection hatch

These two decide **every** invocation, however clear the frame already was.

**Apply the selection escape hatch.** If the input is a *selection* over a field ("what should we use for auth?"), it belongs here only when the realistic field is bounded (roughly five or fewer real candidates) and the criteria are knowable. If the field can't be bounded without inventing options, or the criteria are unclear, **stop**: return a Hold and route to `ce-ideate` (to enumerate) or `ce-brainstorm` (to surface criteria), then offer to re-run.

**Classify the reversibility tier — three levels.** Infer it from project signals:

- **Tier 1 — two-way door:** a dependency, lint rule, or config; trivially reversible.
- **Tier 2 — one-way but bounded:** a data store, an internal API/contract, or a migration whose blast radius stays inside this codebase.
- **Tier 3 — one-way and high-stakes:** a security, legal, or privacy surface; a public API/contract; or an irreversible data migration.

State the tier in the verdict and let the user override. The tier sizes the rest of the run (Phase 1 scout count, Phase 2 depth, Phase 3 reversal trigger): Tier 1 stays a one-screen verdict off a single combined grounding pass; Tier 2 adds the full scout fleet and an alternatives pass; Tier 3 adds deep external research, a precedent search, and a durable-record offer. Do not run a Tier-3 workup on a trivially reversible `npm i`, or hand a security-surface decision the moderate Tier-2 treatment.
