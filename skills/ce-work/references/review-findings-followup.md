# Apply Code Review Findings (after `ce-code-review`)

Load this reference when `ce-code-review` has finished and **ce-work** (or another caller) should apply fixes before the Residual Work Gate.

`ce-code-review` is invoked here with `mode:agent`, so it is **review-only** in this context — it reports findings and writes artifacts and does not mutate the checkout, commit, push, or file tickets. **The caller owns apply/fix policy.** Standalone review is also report-only unless local apply was explicitly authorized.

## Consume the completed review (do not re-run it)

This reference loads **after** review has run. In the ce-work shipping flow, step 3a already invoked `ce-code-review`; this apply step **consumes that output** — do not start a second review, which would waste reviewer dispatches and risk overwriting the artifact the Residual Work Gate reconciles.

Reuse the review output already in hand:

- Parsed JSON (`status`, `actionable_findings`, `findings`, `artifact_path`, `run_id`) **or** the markdown Actionable Findings summary captured by the caller
- Run artifact dir: `<artifact-path>/` (`review.json`, per-reviewer JSON for `why_it_matters`)

If `status` is `failed`, stop shipping and surface `reason`. If `degraded`, note partial reviewer coverage before applying anything.

### Fallback — invoke `ce-code-review` only for cold callers

Only when the caller reached this file **without** already running review (no review output in hand): invoke `ce-code-review` once, then proceed to apply. Do not invoke when the caller already ran review (e.g., ce-work shipping step 3a).

Invoke the skill explicitly — do not treat a casual "review my changes" prompt as a substitute unless the harness routed it to `ce-code-review`.

```
ce-code-review mode:agent plan:<plan-path> base:<merge-base-or-ref>
```

- `mode:agent` — JSON output (`review.json` + primary JSON response) for programmatic parsing; same review pipeline as default.
- `plan:` — when Phase 1 used a plan file (requirements completeness).
- `base:` — when the diff base is already resolved on the current checkout; omit when reviewing a PR number/URL or standalone current branch.
- Do **not** pass deprecated `mode:autofix`.

For human-facing shipping, invoke `ce-code-review` without `mode:agent` if markdown tables are preferred. It still reports only unless the invocation explicitly authorizes local apply. Capture the Actionable Findings and artifact dir before caller-owned apply.

## Inputs for apply

- `actionable_findings` from JSON, or the Actionable Findings section from markdown
- Full finding detail when needed: `review.json` / artifact `findings`, or `{reviewer}.json` for `why_it_matters` and `evidence`
- Stable finding `#` — reuse in commits, residual sinks, and subagent prompts

## Adjudicate before applying

The caller owns judgment as well as apply authority. Review output is a set of claims, not a work queue. Verify the relevant evidence and decide whether the remedy materially improves the authorized outcome. Reject disproven claims, unsupported hypotheticals, and preferences whose benefit does not justify the disruption. Record why; rejected claims are not residual work.

Apply warranted, reversible fixes within the existing scope. Resolve bounded engineering choices from the project's evidence and conventions; a design choice does not inherently need a human decision. Neither `confidence`, `autofix_class`, nor a concrete `suggested_fix` grants permission or proves benefit. A missing suggestion is a reason to investigate a material problem, not automatically defer it.

Defer when essential evidence is unavailable or the right remedy depends on an unsettled product preference, expanded scope, or authority the caller lacks. Passing tests do not resolve unverified safety or authorize a changed contract. Surface the remaining decision and its consequence together at the Residual Work Gate.

Use targeted source reads or a bounded investigation subagent to resolve uncertainty. Invoke `ce-pov` only when a consequential, bounded choice warrants an independently grounded position beyond ordinary inspection; reviewer disagreement alone does not warrant it. Pass the subject, known constraints, and evidence pointers. Consume its position or missing framing as input to the caller's decision, not as edit authority or a reason to start a panel automatically.

## Execution — orchestrator adjudicates and batches, subagents apply

The orchestrator owns final disposition, batch scope, diff review, tests, and the Residual Work Gate. It may investigate directly when the evidence is bounded; delegate broader investigation rather than loading every cited file. Fix subagents confirm current evidence and apply within that same scope, returning unresolved decisions with their evidence.


### Default: batched fix subagents

After adjudication, **dispatch subagents for all remaining applicable findings** unless the optional inline shortcut below applies. Do not classify findings by complexity in the parent thread.

**Batching (primary rule — group by file):**

1. Sort applicable findings by severity (P0 first).
2. **Group by `file`.** All eligible findings on the same file → **one subagent** (it loads the file once and works through its `#` list in severity order).
3. **Parallel waves:** batches with **disjoint file sets** may run in parallel (same worktree / shared-directory rules as Phase 1 Step 4 in `ce-work` SKILL.md).
4. **Same file, many findings:** keep one subagent per file. If the prompt would exceed a comfortable size (~8 findings), split into **serial** subagent passes on that file (first batch highest severity, then next batch after merge or after the prior agent returns).
5. **Cross-file coupling:** do not merge unrelated files into one subagent just to reduce agent count — file grouping is the default. Only co-batch multiple files when findings explicitly reference the same small edit surface (rare); when in doubt, separate by file.

**Subagent prompt (per batch):** the assigned findings only (`#`, severity, file, line, title, `suggested_fix`, `requires_verification`; add `why_it_matters` from `{reviewer}.json` in the run artifact when useful), plus:
- Work through assigned `#` in severity order; at each `file:line`, skip with a one-line reason if evidence no longer matches
- Apply the adjudication and authority boundary above; resolve grounded engineering choices and return essential missing decisions to the caller
- Do not re-run `ce-code-review`
- Shared-directory fallback: do not stage or commit — return which `#` were applied or skipped and which files changed

**After each wave:** orchestrator reviews diffs (scope = assigned `#` only), runs tests (`requires_verification: true` on any applied finding → at least targeted tests; multi-file → broader suite), commits (`fix(review): apply findings #…`) unless worktree-isolated subagents merge per Phase 1. Repeat until all batches complete.

### Optional inline shortcut (skip subagent spawn)

Use **only** when **all** of the following hold:

- Exactly **one** applicable finding after adjudication, **and**
- The orchestrator **already** has that file's relevant region in context from Phase 2 work this session (no new Read/Grep expedition)

Otherwise dispatch a subagent — even for a single finding. When unsure, dispatch.

### Summary (required)

Report: batches dispatched, `#` applied vs skipped (with reasons from subagents), artifact path, tests run.

## Handoff to Residual Work Gate

Any warranted finding still unresolved after this pass is **residual work** — proceed to the Residual Work Gate with an updated count. Do not re-invoke `ce-code-review` solely to re-apply the same findings unless the diff changed materially after fixes.
