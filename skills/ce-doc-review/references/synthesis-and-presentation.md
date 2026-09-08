# Phases 3-5: Synthesis, Presentation, and Next Action

## Phase 3: Synthesize Findings

Process findings from all agents through this pipeline. Order matters — each step depends on the previous. The pipeline implements the finding-lifecycle state machine: **Raised → (Confidence Gate | FYI-eligible | Dropped) → Deduplicated → Classified → SafeAuto | GatedAuto | Manual | FYI**. Re-evaluate state at each step boundary; do not carry forward assumptions from earlier steps as prose-level shortcuts.

### 3.1 Validate

Check each agent's returned JSON against the findings schema:

- Drop findings missing any required field defined in the schema
- Drop findings with invalid enum values (including the pre-rename `auto` / `present` values from older personas — treat those as malformed until all persona output has been regenerated)
- Note the agent name for any malformed output in the Coverage section

**Do not narrate remap / validation diagnostics to the user.** Schema-drift notes ("persona X returned unknown enum Y, remapped to Z"), persona-prompt-drift commentary, and other validator-internal diagnostics are maintainer-facing information. They do not belong in the Phase 4 output the user reads. If a persona's output is malformed, the only user-visible consequence is a Coverage-row annotation (e.g., the persona shows fewer findings or a `malformed` marker). Everything else stays internal.

### 3.1b Admit Findings by Consequence

Check reviewer claims against the document's purpose and the work it is meant to guide before assigning confidence. Keep a finding only if the evidence shows a specific problem with correctness or execution, or an improvement worth the disruption. Look up facts available within the review scope instead of asking the author for them.

Drop preferences, possible problems without evidence, and demands for more detail that offer no worthwhile benefit. If an existing rule already covers the case, asking for more explicit wording does not establish a defect. Every retained item, including FYI, needs a current reason to matter. An earlier label, recommendation, high confidence score, or reviewer agreement is not enough. Rejected findings must not return as open questions. Zero findings is valid. Improvements to maintenance or clarity can qualify without a runtime bug, but explain their actual benefit.

### 3.2 Confidence Gate (Anchor-Based)

Gate findings by their `confidence` anchor value. Anchors are discrete integers (`0`, `25`, `50`, `75`, `100`) with behavioral definitions documented in `references/findings-schema.json` and embedded in the persona rubric (`references/subagent-template.md`). This replaces the prior continuous 0.0-1.0 scale with per-severity gates — doc-review economics do not warrant threshold gradation by severity, and coarse anchors prevent false-precision gaming.

| Anchor | Meaning | Route |
|--------|---------|-------|
| `0`    | False positive or pre-existing issue | Drop silently |
| `25`   | Might be real but could not verify | Drop silently |
| `50`   | Verified, useful advisory concern below the actionable bar | Surface in FYI subsection |
| `75`   | Double-checked, will hit in practice, directly impacts correctness | Enter actionable tier (classify by `autofix_class`) |
| `100`  | Evidence directly confirms; will happen frequently | Enter actionable tier (classify by `autofix_class`) |

- **Dropped silently** (anchors `0` and `25`): these do not surface in any output bucket — not as findings, not as FYI observations, not as residual concerns. Record the total drop count as a Coverage footnote line when non-zero: `Dropped: N (anchors 0/25 suppressed)`. The footnote appears below the Coverage table. This is the canonical location for drop-count reporting — not the summary line and not a per-persona Coverage column. Omit the footnote when N is zero.
- **FYI-subsection** (anchor `50`): surface in the presentation layer's FYI subsection regardless of `autofix_class`. These do not enter the walk-through or any bulk action — observational value without forcing a decision. Only useful advisory observations that passed 3.1b land here; FYI is not a destination for rejected nits.
- **Actionable** (anchors `75` and `100`): enter the classification pipeline. Route by `autofix_class` (see 3.7).

**Why the surfacing floor sits at `50` while the actionable floor stays at `75`:** a planning document has no linter behind it, so this review is its only automated check, and premise-level concerns (product-lens, adversarial) cap at 50-75 because "is the motivation valid?" cannot be verified against the document. A `50` costs the reader one line in an observational subsection and never becomes a question, while missed-and-shipped derails implementation. That asymmetry justifies filtering low (`≥ 50`), and it holds **only** because `50` stays out of the pipeline — not because a menu makes dismissal cheap. The cost of a surfaced finding is the reader holding one more open question, not the keystroke that dismisses it; nothing downstream absorbs volume on its behalf.

### 3.3 Merge Duplicate Findings

Two findings are duplicates when **one fix would resolve both**. Decide that by reading them — `title`, `section`, `why_it_matters`, `evidence`, and `suggested_fix` — not by comparing strings. Reviewers describe the same problem in different words as a matter of course, so wording similarity is not the test and matching titles are not required.

Apply the test across personas and across sections:

- **A shared section is evidence, never a requirement.** Two reviewers commonly attach the same problem to different sections, and just as commonly attach different problems to the same one. Neither settles it — the fix does.
- **Fail closed.** When you cannot tell whether one fix resolves both, do not merge. A surviving duplicate costs the user one extra line. A wrong merge buries a real concern inside an unrelated finding, where nothing signals that it went missing.
- **Opposing recommendations never merge.** If one finding says cut and the other says keep, preserve both for contradiction resolution in 3.5 — that is a disagreement, not a duplicate.

When findings merge:

- Keep the highest severity and the highest confidence anchor. If anchors tie, keep the finding appearing first in document order — deterministic, not probabilistic.
- Union the evidence arrays and note every contributing reviewer (e.g., "coherence, feasibility").
- **Retain each constituent finding as a record**, with its own `section`, `title`, and `evidence` intact. Round-to-round memory — R29, R30, the decision primer, and the open-questions dedup key — matches on a single finding's section, title, and evidence overlap. A merged group has none of those, so collapsing the constituents away would make every finding the user settled re-raise on the next round.
- **Coverage attribution:** attribute the merged finding to the persona with the highest confidence anchor; on a tie, to the persona appearing first in document order. Decrement the losing persona's Findings count and its route bucket so totals stay exact.

**Merging never drops.** A merge regroups findings; it never removes one from the review. Every finding that survives the lead agent’s review reaches the user — as its own entry or inside the merged finding that carries its concern. Rejected claims are recorded internally, not lost through merging.

**Cross-model returns.** A `<reviewer-name>-<provider>` return merges with its in-process twin under the same one-fix test. Whether that merge counts as *independent corroboration* is decided in 3.4 by the return's `independence_verified` flag — not here.

**The authoritative snapshot.** The merged finding set produced by this step is the single source of truth for both Coverage counts and rendered output. Each finding appears in exactly one place in the output — counted once in its route bucket, rendered once at its own position.

### 3.4 Cross-Persona Agreement Promotion

Agreement can strengthen the evidence but does not make an issue important. Raise confidence by at most **one anchor step** only when the combined evidence meets the next level's definition. Several reviewers noticing a nit does not make it worth fixing. A significant defect needs no second vote to be retained.

For local personas, independence requires separate dispatched contexts; an inline fallback cannot trigger anchor promotion. Cross-model corroboration requires `independence_verified: true`, at least one in-process contributor, and an independence-verified peer. A missing or false flag cannot trigger anchor promotion. Cursor default/Auto is not verified independence without a receipt. Peer-only agreement never promotes, and additional peers never stack the promotion.

Record any justified promotion in the Reviewer column as `(+1 anchor)`, naming the cross-model reviewer and its verified model or route legibly. Keep the stored reviewer identities. Findings dropped at anchors 0/25 do not return through agreement. Corroboration never grants permission to apply fixes: the peer caps in 3.6 and 3.7 still apply.

### 3.5 Resolve Contradictions

Check conflicting claims against the document, project evidence, and requested outcome before asking the user to decide. Drop a disproven claim or a preference with no significant benefit. Disagreement alone does not prove a defect. Record the reason internally so the rejected claim does not return when findings are combined or actions are chosen.

If several fixes remain possible and choosing one needs an unresolved user preference, a scope decision, or permission, keep one combined `manual` finding. Include both views and the decision needed. Set `finding_type` from the document's actual defect, not the disagreement. Keep opposing fixes together even when they affect different sections; never schedule both as separate edits.

### 3.5b Lead Recommended Action

Give every retained finding one `recommended_action`: Apply, Defer, or Skip. The lead agent chooses it using the verified problem, benefit of the fix, agreed scope, and existing decisions. Reviewer votes and classifications inform this choice but do not decide it.

Recommend Apply for a justified, concrete fix. Recommend Defer when essential evidence or a user decision is missing, or no specific edit can yet be made. Skip a claim that fails review; do not keep it as an FYI or open question just because a reviewer raised it. Recommendations do not change the permission rules in 3.7: changes to meaning still need approval as a group, and unresolved choices for the user remain `manual`.

When reviewers recommended different actions, keep one line explaining the lead agent's choice and its evidence. The walk-through and bulk preview use that `recommended_action` without recalculating it. After 3.6 and 3.7, check that each Apply still has a specific edit in `suggested_fix`; otherwise recommend Defer.

### 3.6 Resolve Who Can Choose the Fix

Check each retained finding against the document, project evidence, and permission already granted. Choose technical fixes within that permission, even when several approaches would work. Recommend the smallest fix that solves the problem and state the supporting evidence. A reviewer's `manual` label, uncertainty, or missing suggested fix does not replace this investigation.

Use project evidence to decide how to implement or verify the agreed outcome. Adding detail or changing a method does not by itself create a new commitment for the user. Keep `manual` only when a fix needs the user to decide the outcome or its constraints, permission beyond the existing request, or essential information you cannot obtain. State what is missing and how different answers would change the result. Calling something a product decision or tradeoff is not enough. Preserve agreed decisions. If evidence shows a chosen method cannot work, choose a replacement within scope unless the user reserved that choice.

Use `gated_auto` for a chosen fix that changes the document's meaning. Only a mechanical correction with one right answer qualifies for `safe_auto`. If another workable correction exists, do not apply it silently. Choosing a fix does not give permission to apply it.

**Fixes found only by another model.** These never qualify for `safe_auto`. The lead agent may change a `manual` finding to `gated_auto` after verifying the evidence and choosing a fix within existing permission. Keep the original reviewer attribution: the lead agent's investigation is not another independent review. Silent application still requires an in-process reviewer to have independently raised the same issue (R18), along with the normal confidence and mechanical-correction requirements.

### 3.7 Route by Autofix Class

**Severity and autofix_class are independent.** A P1 finding can be `safe_auto` if the correct fix is obvious. Importance does not establish who can choose the fix or permission to edit.

**Anchor and autofix_class are also independent.** Anchor gates the finding into a surface (FYI vs actionable); `autofix_class` decides what the actionable surface does with it. Both are consulted in this step.

Findings reaching 3.7 have already been gated to anchors `50`, `75`, or `100` by 3.2 (anchors `0` and `25` were dropped).

**Check obligations before autofix routing.** A finding is an **obligation** when the question that resolves it is already answered elsewhere in the document under review. The document made the decision; the finding reports only that some part of the document has not caught up. Entailed contradictions, a missing owner for behavior the document already requires, and a callsite implied by the document's own decision are obligations.

A finding is **not** an obligation if its fix adds a commitment the document has not made. A technical fix independently justified by project evidence may still enter **Proposed fixes** after 3.6; do not describe it as already required by the document. If the user must decide a new commitment, keep it `manual`.

An obligation that changes meaning uses `gated_auto` and must include a specific `suggested_fix`. A mechanical `safe_auto` correction keeps its class, subject to the restriction on findings raised only by another model. If investigation still leaves no specific edit to apply, exclude it from the group and return the missing information to the calling agent.

This is a per-finding test against one document. It needs no comparison to other findings and is independent of the merging in 3.3.

Route the obligations carrying a fix to the part of the document they affect instead of the per-finding walk-through: the implementation unit when the document has units, the owning section when it does not — a requirements-shaped document has none, and an obligation can arise there just as easily. They render as one grouped list under that unit or section and are confirmed together, so the user makes a single decision about work the document already settled. **Render the group in full before the confirmation fires** — a batch confirmation with nothing visible above it is a rubber stamp, not a decision.

Obligation grouping governs what the user is asked about, never what applies silently. An obligation at anchor `100` with `autofix_class: safe_auto` still applies silently under the table below.

**Evidence, choosing a fix, and permission to edit are separate checks.** Confidence describes support for the finding. Step 3.6 decides whether the agent can choose the fix. This step decides whether and how the reader must approve the edit.

Show the concrete fixes the agent has chosen together for one approval. Ask separate questions only for essential missing information or choices the user still needs to make. If permission remains unclear after investigation, keep `manual` and explain what is missing. Another reasonable implementation is not, by itself, missing permission.

| Anchor | Autofix Class | Route |
|--------|---------------|-------|
| `100`  | `safe_auto`   | Apply. Report in the change list. Mechanical corrections only — evidence directly confirms and there is one right answer. Requires `suggested_fix`; demote to `gated_auto` if missing. |
| `100`  | `gated_auto`  | Grouped confirmation. A concrete fix that touches meaning, so the reader sees it before it lands — but batched, not asked one at a time. Requires `suggested_fix`; demote to `manual` if missing. |
| `100`  | `manual`      | A decision — the reader chooses, never a question about whether to proceed with something already settled. Ask **which remedy** only when the finding carries competing ones; see below. |
| `75`   | `safe_auto`   | Grouped confirmation. Unattended apply stays reserved for anchor `100`, where the evidence directly confirms the fix. Requires `suggested_fix`; demote to `manual` if missing. |
| `75`   | `gated_auto`  | Grouped confirmation. Requires `suggested_fix`; demote to `manual` if missing. |
| `75`   | `manual`      | A decision. Same treatment. |
| `50`   | any           | Surface in the FYI subsection regardless of `autofix_class`. Do not enter the decision surface or any batch action. These are observations. |

**Nothing that touches document meaning applies unattended.** Only `safe_auto` at anchor `100` applies without the reader seeing it first. Other actionable findings with a concrete, resolved remedy go to the grouped confirmation: one question covering the whole batch, rendered in full before it fires.

This is a deliberate retreat from a stricter rule, and the reason is measured. Routing `gated_auto` straight to Apply was evaluated across four rounds on a real review. It reported far more corrections — 7 to 9 of 9, against 2 to 4 when Apply was gated harder — but it also applied a genuine product fork in most runs, because the model cannot reliably tell which findings carry a real choice. Asking it to route its own uncertainty to a safer bucket did not help: it never used that route, since it does not experience the uncertainty as uncertainty. It simply decides, and is sometimes wrong.

So the volume problem and the authority problem get separated. **The grouped confirmation solves volume** — one question for a batch is not eleven prompts, which is the complaint this work started from. **Attended review solves authority** — a wrong classification costs the reader a glance rather than an unrequested change to their document. What `autofix_class` still decides is *how* the reader meets a finding: batched with everything else settled, or as a fork with its own question.

Present three groups: **applied** mechanical corrections, **proposed fixes** shown together for approval, and **decisions** that the user must still make. Proposed fixes include requirements already decided elsewhere in the document and eligible findings raised only by another model. Follow the shared rendering rules so the reader can distinguish these groups.

**Where competing remedies come from — and where they do not.** The reviewer contract commits `suggested_fix` to a single recommendation and forbids alternative menus (`references/subagent-template.md`), so an ordinary `manual` finding reaches the decision surface with one fix or none. It has no menu to offer, and the walk-through gives it the regular four-option question. The case that genuinely carries two is 3.5's contradiction resolution: two personas disagreeing on the same section become one combined finding holding both perspectives, framed as a tradeoff. Ask which-remedy there. Do not invent a second option elsewhere to make the fork appear — the finding is still a decision when it carries one remedy; the reader is choosing whether that remedy is what they want, which is not the same as being asked to rubber-stamp something settled.

**No silent fixes from another model alone.** Findings raised only by another model never go directly to Apply, regardless of confidence or class (R18). Show a verified, chosen fix for approval with the others. Keep `manual` when a user decision or essential information is still missing. The source of a finding limits silent application, not the lead agent's ability to investigate and recommend.

**Check the proposed edit before applying it.** A concrete `suggested_fix` does not grant permission. Confirm that each fix preserves agreed commitments and does not decide something reserved for the user. Keep an unresolved user choice as `manual`. A `safe_auto` fix that changes meaning or has more than one correct answer can become `gated_auto` only after the agent has resolved the choice. Mechanical corrections must follow directly from the document's authoritative content. A visual aid may be updated to fix an inconsistency, but not deleted merely because it repeats prose.

### 3.8 Sort

Sort findings for presentation: P0 → P1 → P2 → P3, then by finding type (errors before omissions), then by confidence anchor (descending: `100` first, then `75`, then `50`), then by document order (section position) as the deterministic final tiebreak.

### 3.9 Suppress Restatements in Residual Concerns and Deferred Questions

Apply 3.1b to each reviewer's `residual_risks` and `deferred_questions`, not just its findings. Keep an uncertain concern only when project evidence shows why it matters to the requested outcome. Rejected preferences and unsupported possibilities do not return through another output field.

Compare the remaining risks and questions with the final findings, including FYI. Omit any that repeat a concern already covered by a finding or its recommended fix. Keep distinct, relevant uncertainty; similar wording alone does not prove duplication.

Run this pass on the merged set across all personas. Record the count suppressed as duplicates as a Coverage footnote line when non-zero: `Restated: N (residual/deferred items suppressed as duplicates of actionable findings)`. Ordering: footnotes appear in the sequence `Dropped:`, `Restated:` below the Coverage table, each on its own line. Omit any footnote whose count is zero.

## Phase 4: Apply and Present

**Rendering floor (applies to every finding, every mode — read before rendering anything).** Read
`references/rendering-floor.md` now. It is the single source of truth for the decision-first field
order (Recommendation → Consequence-if-unchanged → Change → Basis → Trace-on-request), the
domain-agnostic opaque-token policy (navigation anchors, provenance anchors, mechanism symbols; at
most two anchors per block), and the code-span budget. Every surface below — the non-interactive envelope,
the interactive template, and the bulk preview — maps its own layout onto that floor. Do not restate
a weaker per-surface rule; the floor is authoritative.

**User-facing vocabulary rule (applies to ALL user-visible output in Phase 4, not just the rendered template).** Internal enum values — `safe_auto`, `gated_auto`, `manual`, `FYI` — stay inside the schema and synthesis prose. Every word the user sees in Phase 4 output, including free-text narration between sections, transition preambles, status lines, and confirmation messages, MUST use user-facing vocabulary, named by the surface 3.7 routed the finding to: "applied changes" or "fixes" (what 3.7 routed to Apply), "proposed fixes" (the grouped confirmation), "decisions" (the decision surface), "FYI observations" (anchor `50`). The only exception is the `Tier` column in rendered tables, which is explicitly documented as surfacing the internal enum for transparency. Do NOT emit narration like "safe_auto fixes applied" or "N gated_auto findings" — write "fixes applied" or "N proposed fixes" instead.

### Apply the findings 3.7 routed to Apply

Apply, in a single pass, every finding 3.7 routed to Apply — **anchor `100` with `safe_auto`, and nothing else**. Evidence directly confirms the problem and there is one right answer, so the reader loses nothing by seeing it as a reported change rather than a question. Everything else with a concrete fix goes to the grouped confirmation, where the reader sees it before it lands.

Apply each edit in the document's native format and preserve its existing structure. Never insert markdown syntax into HTML, and for an ID-bearing HTML item mirror the nearest sibling's structure, preserving both its anchor convention and its visible ID text.

- Edit the document inline using the platform's edit tool
- Track what was changed for the "Applied changes" section in the rendered output
- Do not ask for approval — 3.7 already established there is no choice to offer
- Do **not** apply anything 3.7 routed elsewhere. Obligations and peer-only findings diverted out of Apply join the grouped confirmation; anchor `50` routes to FYI; `manual` at any anchor is a decision. If a finding reaches this step from any of those routes, 3.7 was not applied correctly — re-run it for that finding before continuing.
- Do **not** apply a finding whose only reviewers are cross-model peers, at any anchor or class. 3.7 diverts those to the grouped confirmation when the table would have applied them, and keeps choices that only the user can make in the separate Decisions section after the ownership check in 3.6.
- An applied fix must never remove or reword a `session-settled:` annotation. If a `suggested_fix`'s text would touch one, do not apply it — send the finding to the grouped confirmation so the user answers before the annotation changes.

List every applied fix in the output summary so the user can see what changed. Use enough detail to convey the substance of each fix (section, what was changed, reviewer attribution). This is especially important for fixes that add content — the user should not have to diff the document to understand what the review did.

### Route Remaining Findings

After the applied changes land, the rest split by the route 3.7 assigned — not by `autofix_class`:

- **Grouped confirmation** — every finding 3.7 sent there, obligations and Apply-diverted peer-only findings among them. One confirmation covering the batch, rendered in full first. In interactive mode this fires as its own step before the routing question (see `references/walkthrough.md`); it is never folded into the routing question, and a run that reaches routing without asking it leaves the batch unapplied. In non-interactive mode the batch is returned unapplied for the caller to confirm.
- **Decisions** — `manual` findings at anchor `75` or `100`. These enter the routing question and the walk-through (see `references/walkthrough.md`), and carry a which-remedy sub-question only when the finding holds competing remedies — in practice a 3.5 contradiction, per the note under the routing table.
- **FYI** — anchor `50`, presentation only, no routing.
- **No remaining user decisions** → skip the routing question. In Interactive mode, still get approval for any proposed fixes, then emit the completion report and return through Phase 5. Applied fixes and answered approvals belong in that report. In Non-interactive mode, return only the structured result above; an extra interactive report would break the caller's expected format. No remaining decisions does not waive approval for proposed edits or mean those edits are complete.

**Self-contained rendered lines (both modes, including the Applied-fixes list).** Every rendered line —
an applied fix, proposed fix, decision, FYI observation, residual concern, or deferred question —
obeys the shared rendering floor's (`references/rendering-floor.md`) opaque-token policy across **all
three** token classes, not document IDs alone. A requirement or unit ID (`R6`, `U3`) is a navigation
anchor (keep the ID, gloss at first mention); a ticket or PR number (`ESP-3373`, `PR #1776`) is a
provenance anchor (gloss only when the event changes the decision, else move to trace); a function,
file, variable, or line reference the document names (`clearMuxStatus`, `codebookTranscriptMode.ts:46`)
is a mechanism symbol (translate to its role; keep the exact symbol only when precise scope drives the
decision). At most two anchors per finding — counted across all its rendered lines, matching the floor's
per-block budget — each resolved at render time against the document in context so it stays accurate
after an Apply renumbers the item. The floor's full decision-first field order
(Recommendation → Consequence → Change → Basis) applies to **actionable findings** — proposed fixes and
decisions. FYI observations, residual concerns, deferred questions, and obligations carry no
recommendation, so they render as a single line under the token policy, not the full field order — a
consequence / concern / question, and for an obligation the consequence plus its change as intent. A line whose only description of a referenced item is a bare identifier — of any class — is
not acceptable rendered output.

**Non-interactive mode:** Do not use interactive question tools. Output all findings as a structured text envelope the caller can parse. Internal enum values (`safe_auto`, `gated_auto`, `manual`, `FYI`) stay in the schema and synthesis prose; the envelope below uses user-facing vocabulary — "fixes", "Proposed fixes", "Decisions", "FYI observations" — so non-interactive output reads the same way interactive output does.

Two things about the template that follows. **Nothing in the batch has been confirmed here** — this mode asks no questions, so the obligations and proposed fixes are returned *awaiting* a confirmation the caller must obtain. Wording that reports them as already confirmed invites a caller, or a user reading over its shoulder, to treat unapplied and unapproved changes as accepted. And **the fence is the output**: on a document with no implementation units, title the obligations section "Entailed corrections" and use the section name as each group heading — do not emit that instruction, or any other bracketed note, into the envelope the caller parses.

```
Document review complete (non-interactive mode).

Applied N fixes:
- <section>: <what was changed> (<reviewer>)
- <section>: <what was changed> (<reviewer>)

Implementation obligations (already entailed by the document; awaiting one grouped confirmation):

<unit or section name>
  - <consequence, no opaque identifier> — <change as intent language>
  - <consequence, no opaque identifier> — <change as intent language>

<unit or section name>
  - <consequence, no opaque identifier> — <change as intent language>

Proposed fixes (nothing here has landed; awaiting the same grouped confirmation):

[P0] Section: <section> — <consequence-first title> (<reviewer>, confidence <anchor>)
  Recommendation: <Apply | Defer | Skip>
  Consequence if unchanged: <one sentence, no opaque identifier>
  Change: <suggested_fix as intent language>
  Basis: <at most two sentences of mechanism, opaque tokens glossed, at most two anchors>

Decisions (requires user judgment):

[P1] Section: <section> — <consequence-first title> (<reviewer>, confidence <anchor>)
  Recommendation: <Apply | Defer | Skip>
  Consequence if unchanged: <one sentence, no opaque identifier>
  Change: <suggested_fix as intent language, or "none">
  Basis: <at most two sentences of mechanism, opaque tokens glossed, at most two anchors>

FYI observations (anchor 50, no decision required):

[P3] Section: <section> — <consequence-first title> (<reviewer>, confidence <anchor>)
  Consequence if unchanged: <one sentence, no opaque identifier>

Residual concerns:
- <concern> (<source>)

Deferred questions:
- <question> (<source>)

Dropped: N (anchors 0/25 suppressed)
Restated: N (residual/deferred items suppressed as duplicates of actionable findings)

Review complete
```

Omit any section with zero items. The bucket names are the user-facing vocabulary for the routes 3.7 assigned: "Applied N fixes" reports what already changed, the obligations block and "Proposed fixes" together render the grouped confirmation (obligations first, then the rest of the batch, each shaped by the floor's "Presenting a batch" rule — the caller re-narrates this envelope to a reader who has seen none of it, so a flat list here becomes a flat list there), "Decisions" carries the decision surface, and "FYI observations" carries anchor `50`. End with "Review complete" as the terminal signal so callers can detect completion.

**Obligations count as proposed fixes.** They render as a group rather than item by item — grouping changes presentation, not the count. So obligations are included in the proposed-fixes count a caller parses, and the caller's actionable-items gate keeps its meaning. Do **not** export a separate obligation count: a review whose findings are all obligations must still report actionable items, or a caller gating on that sum would hide the confirmation step and the user would never see work the review found.

**Compact rendering for FYI observations, residual concerns, and deferred questions (high-count mode).** When the combined count of these three buckets is 5 or more, collapse each to a one-line count followed by a tight bullet list — FYI observations use their consequence line, residual concerns and deferred questions their concern or question text — with no per-item elaboration. Actionable buckets (Proposed fixes / Decisions) remain fully rendered regardless. This mirrors the interactive-mode rule in `references/review-output-template.md` so both modes produce the same shape.

**Interactive mode:**

Present findings using the review output template (read `references/review-output-template.md`). This presentation must appear as user-visible assistant text in the same turn immediately before the routing question in `references/walkthrough.md` fires — a prior-turn non-interactive envelope or a one-line count does not satisfy that invariant. Within each severity level, separate findings by type:

- Errors (design tensions, contradictions, incorrect statements) first — these need resolution
- Omissions (missing steps, absent details, forgotten entries) second — these need additions

Brief summary at the top, in the shape the template's summary-line rule defines — changes made and choices requested counted separately, never merged into one "needs attention" number.

Include the Coverage table, applied fixes, FYI observations (as a distinct subsection), residual concerns, and deferred questions.

**All tables MUST be pipe-delimited markdown (`| col | col |`). Do NOT use ASCII box-drawing characters (`┌ ┬ ┐ ├ ┼ ┤ └ ┴ ┘ │ ─`) under any circumstances, including for the Coverage table.** This rule restates the template's formatting requirement at the point of rendering so it cannot drift. Pipe-delimited tables render correctly across all target harnesses; box-drawing characters break rendering in some and violate the repo convention documented in root `AGENTS.md`.

### R29 Rejected-Finding Suppression (Round 2+)

When the orchestrator is running round 2+ on the same document in the same session, the decision primer (see `references/dispatch.md` — Decision primer) carries forward every prior-round Skipped, Deferred, Acknowledged, and user-settled Withdrawn finding. Synthesis suppresses re-raised rejected findings rather than re-surfacing them to the user. Acknowledged is treated as a rejected-class decision here: the user saw the finding, chose not to act on it (no Apply, no Defer append), and wants it on record — equivalent to Skip for suppression purposes. Only user-settled withdrawals (retired by a Skip/Defer premise or a user-asserted fact) reach this primer; an Apply-triggered withdrawal is provisional and never carried here, so a staged fix that failed or landed ineffectively is re-checked by fresh synthesis rather than suppressed by R29.

For each current-round finding, compare against the primer's rejected list:

- **Matching predicate:** same as R30 — `normalize(section) + normalize(title)` fingerprint augmented with evidence-substring overlap check (>50%). If a current-round finding matches a prior-round rejected finding on fingerprint AND evidence overlap, drop the current-round finding.
- **Materially-different exception:** if the current document state has changed around the finding's section since the prior round (e.g., the section was edited and the evidence quote no longer appears in the current text), treat the finding as new — the underlying context shifted and the concern may be genuinely different now. The persona's evidence itself reveals this: a quote that doesn't appear in the current document is a signal the prior-round rejection no longer applies.
- **On suppression:** record the drop in Coverage with a "previously rejected, re-raised this round" note so the user can see what was suppressed. The user can explicitly escalate by invoking the review again on a different context if they believe the suppression was wrong.

This rule runs at synthesis time, not at the persona level. Personas have a soft instruction via the subagent template's `{decision_primer}` variable to avoid re-raising rejected findings, but the orchestrator is the authoritative gate — if a persona re-raises despite the primer, synthesis drops the finding.

### R30 Fix-Landed Matching Predicate

When the orchestrator is running round 2+ on the same document (see Unit 7 multi-round memory), synthesis verifies that prior-round Applied findings actually landed. For each current-round finding whose `normalize(section) + normalize(title)` fingerprint matches a prior-round Applied finding, branch by evidence overlap. This fingerprint is round-to-round memory's own key — 3.3 merges by reasoning and has no fingerprint to share — and it works here because both rounds' findings are stored records with stable section and title fields:

- **Strong match — evidence overlap >50% with the prior-round evidence: fix-landed regression.** The current-round finding is quoting the same problematic text the prior-round fix was supposed to remove. Flag as "fix did not land" in the report rather than surfacing as a new finding. Include the prior-round finding's title and the current-round persona's evidence so the user can see why the verification flagged it.

- **Weak match — evidence overlap ≤50%: not a fix-landed regression.** Low evidence overlap means the prior problematic text is no longer being quoted, so do not flag "fix did not land." Do not suppress solely on fingerprint match. If the current-round item is explicitly a non-actionable verification observation (for example, its title or `why_it_matters` says the prior finding landed correctly and asks for no change), suppress it and record `Verified: round-{N} '{title}' landed correctly` in Coverage. Otherwise, treat the finding as new and let it flow through dedup and routing normally.

  **Materially-different exception.** If the current-round finding's `why_it_matters` describes a substantively different concern than the prior-round finding — even though the section/title fingerprint matches — treat it as a new finding rather than a fix-verified suppression. The section may have been edited for an unrelated reason and the new edit introduced a different issue. The persona's substance, not just the fingerprint, is the signal.

- **Section renames count as different locations.** If the section name has changed between rounds (edit introduced a heading rename), treat the new section as a different location and the current-round finding as new — neither branch fires.

- **No fingerprint match:** not a verification candidate; the finding flows through normally to 3.3 dedup and onward routing.

This rule prevents two failure modes: (1) regressions where a fix didn't actually land, and (2) persona over-emission where a round-{N+1} reviewer correctly observes a prior-round resolution and emits a non-actionable "already addressed" finding. The persona-side guidance in `subagent-template.md` ("Do not emit findings to note prior-round resolutions") is the primary defense; this rule is the synthesis backstop.

### Protected Artifacts

During synthesis, discard any finding that recommends deleting or removing a CE pipeline artifact: any file **under** a `plans/`, `solutions/`, `ideation/`, `explainers/`, `pulse-reports/`, `dogfood-reports/`, `feedback-sweep/`, or `personas/` directory (or the legacy `brainstorms/` one) **whose immediate parent is the artifact root**. The artifact root is a directory named `docs` — the default, and where unmigrated legacy artifacts stay even after a project sets `docs_root` — or the configured `docs_root` when this run resolved it. Matching by that parent covers nested category files (`solutions/<category>/foo.md`) while leaving a same-named directory elsewhere — a skill's own `references/personas/` prompt assets, whose parent is `references` — as ordinary code whose deletion finding stands. A review that never resolved a configured root still protects the `docs`-parented tree (default and legacy); a configured-root artifact seen by such a run is the one honest gap.

## Phase 5: Return to the Caller

Return "Review complete" with the completion report or non-interactive envelope. A finished review does not need a terminal question. When nested, return control to the caller; do not start a nested planning or execution workflow merely because the review is complete.

For standalone use, a useful next step may be named without a blocking menu. A requirements-only unified plan or legacy standalone requirements doc routes to `ce-plan`; an implementation-ready unified plan or legacy implementation plan routes to `ce-work`. Invoke that next skill only when the user's existing request authorizes it. Review completion alone does not authorize new work.

### Iteration limit

After 2 refinement passes, recommend completion. An explicit request for another pass is honored with prior decisions preserved. Handling unchanged findings uses the intake reuse condition rather than starting a new pass.

## What NOT to Do

- Do not rewrite the entire document
- Do not add new sections or requirements the user didn't discuss
- Do not over-engineer or add complexity
- Do not create separate review files or add metadata sections
- Do not modify caller skills (ce-brainstorm, ce-plan, or external plugin skills that invoke ce-doc-review)

## Iteration Guidance

On genuinely new review passes, re-dispatch personas with the multi-round decision primer (see Unit 7) and re-synthesize. Fixed findings self-suppress because their evidence is gone from the current doc; rejected findings are handled by the R29 pattern-match suppression rule; applied-fix verification uses the R30 matching predicate above. If findings are repetitive across passes after these mechanisms run, recommend completion.
