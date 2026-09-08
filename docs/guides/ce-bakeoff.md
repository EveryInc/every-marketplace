# `ce-bakeoff`

> Develop competing solutions to a defined brief and bring back the strongest coherent approach.

Bake-off is experimental. It creates independent candidate artifacts before choosing, then selects a base, incorporates useful contributions, and checks the final result. It owns the winner; a calling skill owns adopting that result and continuing its workflow.

## When to use it

Use it when a consequential choice needs more than names and pros and cons: architectural shapes, product mechanisms, or rough supplied options that need development. Use `ce-pov` when the material is already developed and needs judgment. Use `ce-ideate` to discover opportunities and `ce-brainstorm` when the goal itself is unsettled.

It produces non-executable artifacts. Runtime experiments belong to `ce-optimize`; questions decided through human experience belong to `ce-prototype`.

## Examples

These examples use slash invocation. On Codex, use the corresponding dollar-prefixed skill name.

```text
/ce-bakeoff develop competing retry-ownership approaches under these requirements and choose one
/ce-plan plan the migration; run a Bake-off for the unresolved sequencing decision
/ce-brainstorm run a Bake-off for the onboarding mechanism after we settle the goals
```

## What happens

The agent announces a Bake-off to explore multiple approaches and choose the strongest. By default it launches three fresh contexts named Baker A, Baker B, and Baker C from a common brief. Bakers develop candidate solutions. Progress updates explain what was learned, what changed, or what happens next. Waiting updates add useful information rather than repeating the waiting status; operational bookkeeping stays in the run record unless it changes expectations or explains a limitation. Candidates do not see one another's output or the coordinator's preferred answer. Limited concurrency can make them run sequentially without sacrificing independence.

The coordinator compares actual artifacts against the same constraints, selects a base, and verifies useful adaptations. The default permits one recovery candidate, with no automatic time cutoff. The coordinator gives workers room to work and uses available progress signals to intervene when work is blocked, repetitive, or outside the brief; silence alone does not establish a stall. Explicit user budgets remain authoritative. These are agent-managed bounds, not a provider spending cap. At least two usable independent candidates are necessary to claim a completed comparison. Missing capability, insufficient evidence, and unresolved preferences remain visible rather than being turned into a fabricated winner.

The coordinator challenges the final synthesized mechanism with concrete cases at the requested fidelity, including changes introduced after judging, and reports the decisive check. A selected result requires inspected evidence for premises that determine feasibility, required guarantees, or the winner. Existing code depending on a platform guarantee does not verify that guarantee. If the necessary support remains unavailable, the result is unresolved; it may include a provisional preference, but cannot declare a verified winner.

The return includes the winning artifact, actual comparison, rationale, incorporated contributions, meaningful rejections, verification limits, participation, and available cost/usage evidence. Chat highlights the decision and why; the full record reaches the caller or a retained document before scratch is cleared.

## Models and independent judgment

Direct use inherits the session model unless the user selects a supported candidate mix. Requested planning and brainstorming Bake-offs use their existing `plan_model` and `brainstorm_model` choices for candidate authors. The session agent orchestrates; elevated authors remain read-only. Inline fallback is not independent generation.

A fresh subagent running `ce-pov` as a guest is required before selection. A different model family is preferred: use native host model access when suitable, otherwise an available authorized model CLI or adapter. A fresh same-family judge is a disclosed fallback; no independent judge means incomplete. The coordinator reconciles the assessment with its own comparison and verifies consequential premises against source evidence before returning the winner. An explicitly requested oracle, or a consequential disagreement that survives source checking and warrants consultation within budget, uses `ce-pov`'s existing panel. All judging and verification fit within the Bake-off budget.

## Position in the workflow

- **Planning trial:** explicitly requested, after research and before fixing a consequential unresolved HOW on Standard/Deep Durable plans. The selected approach informs the normal plan; final authoring, confidence, review, and handoff remain in planning.
- **Brainstorming trial:** explicitly requested, after goals are clear, replacing Phase 2 generation for the selected product mechanism. Options precede the recommendation and user confirmation remains authoritative.
- **Direct use:** a standalone solution and decision record without implementation.

Ordinary caller behavior remains unchanged without a request. Automatic integration depends on trials comparing current behavior, a cheaper same-agent two-sketch comparison, and independent Bake-off. Implementation availability alone does not establish that automatic integration improves results.
