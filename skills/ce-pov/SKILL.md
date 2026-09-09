---
name: ce-pov
description: "Judge a supplied subject against the project's evidence and constraints, returning a supported position, tradeoffs, and conditions. Use when assessing an external-adoption question, a holistic take on a document, or a supplied approach set. Use for an oracle panel to consult other models and reconcile their opinions. Use ce-explain for understanding and ce-doc-review for findings review. Use ce-bakeoff to develop competing solutions to a defined brief, ce-ideate to explore opportunities, or ce-brainstorm to establish goals."
argument-hint: "[question, document, or approaches] [cross-check] — or bare"
---

# Form a Point of View

Produce a decisive, project-grounded point of view in the subject's own shape: a **graded verdict** on an external-adoption question, a **holistic take** on a document, or a **position** on a supplied approach set. The subject is whatever this skill was invoked with, in the prompt or the conversation. Stay read-only while forming and reconciling the POV. You are done when the POV is delivered with its attribution and required disclosure, or when an explicit blocker is returned. **The year is 2026**, for source recency.


## The moat

**Never issue a POV you did not earn against the project's own context.** Every subject must clear the **project floor** in `references/method.md`. An external-adoption verdict must also clear the full external floor. A document or approach-set POV must externally verify any external claim that is load-bearing to its bottom line. Nothing the conversation asserts substitutes for grounding.

## Consumer and interaction

Deliver a supported position in the form the intended consumer can use. Lead with the decision and preserve the evidence, material tradeoffs, uncertainty, and conditions that determine it. Make identifiers understandable without requiring the reader to reopen the subject. A person's request may need a brief answer or a shareable document; another workflow may need a decision embedded in its own work.

When contributing to an ongoing workflow, return the result and leave continuation to its owner. Do not add follow-up or panel offers to that return. An explicit oracle or named-peer request still runs the panel, including when it comes from a calling workflow.

Resolve the question from the request and context, and investigate discoverable facts before asking. Ask only when missing information materially changes the judgment and cannot be resolved from evidence. If interaction is unavailable, return the missing framing or evidence and why it blocks the judgment rather than waiting or choosing the caller's requirements.

When a question is necessary, use the host's question capability already in the current tool list; never call a user-facing question tool to discover whether it exists. If no tool is available, ask in chat only when a person is participating. Do not turn framing into an interview.

## Artifact Root

Resolve `<root>` the first time you compose a `<root>/` path; a read of `<root>/solutions/` counts as composing one. Pass the resolved path to scouts, never the config. A non-git project has no `<root>`, so its prior-decision scan uses local ADRs and design docs instead.

<!-- ce-docs-root:start -->
**Resolve the CE artifact root `<root>` before composing any artifact path.**

- **Read** `docs_root` from `<repo-root>/.compound-engineering/config.yaml` only (`<repo-root>` = `git rev-parse --show-toplevel`). Do not read it from `config.local.yaml`. Unset -> `<root>` is `docs`, exactly as before.
- **Validate** a set value: a repo-relative directory whose real, symlink-resolved path stays inside the repo and is neither the repo root nor under `.git/`. Otherwise stop with an error naming `docs_root` and the value -- never fall back to `docs`.
- **Use** `<root>` as the sole artifact location: create it if absent, compose each path as `<root>/<subdir>` with this skill's own subdirectory, and never also read `docs`.
<!-- ce-docs-root:end -->

### Phase 0: Frame and Classify

**Read `references/intake.md` now, before any grounding.** It owns the output mode, the warm-invocation contract, orientation and framing, sizing, and the unbounded-field escape hatch. Settle the subject and the POV intent there (adopt / migrate / compare / is-this-our-problem / Document-take / Approach-set / explainer); an intent that routes out finishes at intake, and one that continues settles a reversibility tier. Read `references/boundaries.md` when this skill's fit is in doubt.

### Phase 1: Ground

**Read `references/grounding.md` now, before grounding by either path.** It owns the model tiers (the POV reasoning itself is never dispatched), the scratch fence, the scout payload and fleet, capability gating, and the provenance buckets that keep grounded facts apart from unconfirmed ones.

Send scouts directly to candidate-specific current evidence, never a generic repo profile. They search in their own context and return a dossier path plus a gist, which you read on demand. Where the load-bearing facts are already located, confirm them with bounded reads of the authoritative source instead of dispatching scouts; unscoped or noisy grounding still dispatches. A claim made in the conversation is a pointer to check, never self-verifying. The prior-decision scan (`<root>/solutions/`, ADRs, design docs) stays mandatory on either path.

When the judgment requires an explanation of unresolved behavior or design rationale, invoke `ce-explain`. Pass the question, its scope, and the decision it informs. Use adequate current evidence instead of repeating an investigation. Treat its cited findings as evidence to assess under the same grounding gate, not as authority for the recommendation. Keep ownership of the judgment here. If `ce-explain` is unavailable, gather the evidence directly or report what is missing.

### Phase 2: Verify Grounding

**Read `references/method.md` now**, before reasoning about the POV. It owns the Verify and POV steps, the skeptic stance, tiering, and the gate. Apply that gate over the grounded evidence. A failed floor forbids a confident result in any subject shape; that reference names the failure result each shape returns instead.

### Phase 3: Point of View

First form ce-pov's own independent POV under the active subject-shape contract in `references/method.md`, but do not emit it. Freeze that position. Keep it out of an independent peer's initial context; expose it only when the task is to critique that position, or in a later reconciliation round.

A summons is an affirmative request to consult or reconcile peers — a panel, a cross-check, `oracle` — anywhere in the invocation context. Declining one, or merely recounting one, is not a summons. On a summons, or when a cold POV may qualify for a proactive offer, read `references/cross-model-panel.md` before resolving participation or deciding whether to offer. Finish the panel branch before composing the result. A POV that follows a summons states which peers ran, or that none did and why. A POV with no summons carries no panel note.

Only then deliver the position with the content required by `references/method.md`. Adapt its presentation to the intended use; cite supporting evidence rather than reprinting dossiers or raw peer output.

### Phase 4: Deliver and return

The judgment is the deliverable; implementation is not. A calling workflow receives the result and control back. For a requested write-up or continuation, read `references/followup.md`; it owns artifact delivery and the authority gate for downstream actions. Do not require a next-step choice to complete a POV.
