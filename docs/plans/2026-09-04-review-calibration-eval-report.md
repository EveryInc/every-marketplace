# Review Calibration - Implementation and Evaluation

CE reviewers now have to establish a practical consequence or worthwhile maintenance benefit before surfacing a claim. The lead adjudicates disagreements from evidence; confidence, reviewer votes, and suggested fixes do not establish importance or edit authority. The same admission bar covers residual risks and deferred questions.

## Changed contracts

| Owning surface | New decision rule | Preserved boundary |
|---|---|---|
| `ce-doc-review` synthesis and reviewer template | Reject low-value claims; corroboration promotes only when combined evidence meets the higher anchor; lead chooses the recommendation | Only confidence-100 mechanical `safe_auto` edits apply silently. Semantic corrections retain grouped confirmation; real forks stay manual |
| `ce-doc-review` intake and interaction | Reuse complete, current review evidence for unchanged findings; honor an already requested interaction route; return without a terminal menu | Summary-only state cannot resume; material changes require review; bulk previews and genuine decisions remain |
| `ce-code-review` synthesis and reviewer template | Adjudicate claims and residual fields before reporting; do not launder rejected claims into advisory output | Existing report-only default, validator requirements, scoped standards, and settled-decision handling |
| `ce-work` followup and residual gate | Resolve grounded engineering choices; continue independent authorized work; block only when missing evidence or decisions prevent the required outcome | No invented product preference or authority; warranted residuals remain disclosed |
| `ce-pov` intake, grounding, followup | Investigate discoverable context; return essential missing framing to the invoking caller; no framing or continuation interview | Read-only judgment, grounding floors, panel recipient authority, four-part downstream handoff gate |
| `ce-plan` and `ce-brainstorm` seams | Retain complete review state for reuse; reserve questions for unresolved user-owned decisions | Planning and product-scope boundaries |

`ce-pov` is selective: the work caller uses it for consequential bounded judgments beyond ordinary inspection, not every finding or disagreement. A delegated agent can own the POV; no new mode or universal orchestration protocol was added.

## Provenance and review decisions

- The old automatic confidence bump, contradiction-to-user rule, and conservative action vote were policy choices pinned by contract tests. They now yield to consequence-based lead adjudication; independent-provider receipt checks and peer apply caps remain.
- The prior semantic-edit experiment in `2026-08-12-003-fix-doc-review-decision-clustering-plan.md` (U14, shipped narrowed, target not met) showed false applications of actual product forks. This implementation deliberately preserves that confirmation boundary rather than treating confidence as authority.
- The removed POV question requirement protected framing. Its replacement returns essential missing framing, while source verification still owns discoverable uncertainty. Terminal menus are replaced by returning the deliverable and preserving downstream authority.
- The code-followup ban on investigation and mechanical-only fixer instruction conflicted with caller-owned judgment. The caller now owns evidence-based disposition; batching and shared-file isolation remain.
- Fresh-reader feedback found a real residual-field bypass; synthesis now applies the same admission bar to all returned concerns. A proposed stale-decision exception was rejected because R29 already rechecks materially changed evidence. Preserving the decision record does not unconditionally suppress a new concern.
- The shared authoring standard records the calibration rule. No separate learning capture is needed: the reasoning and evidence are retained here and in that standard.

## Evaluation method

Seven decision scenarios are registered in `tests/skill-eval-cell/calibration-scenarios.ts`. Each injects current on-disk skill content into a fresh Claude or Codex CLI session against a throwaway fixture. The baseline is `988eb4008e24e7c5cde2fc4a6141c6baf9e8f560`. Host defaults were used; no claim about a specific served model or reasoning tier is made.

```bash
bun run test:skill-eval-pack -- --id <scenario-id> --arm ab --hosts claude,codex --out <output-directory>
```

Grades check fixture reads and action/delegation trailers. All 14 final post cells passed those checks and independent semantic review. Semantic outcomes were read from transcripts; keyword grades alone are insufficient.

| Scenario | Observed baseline | Final post outcome |
|---|---|---|
| `ce-doc-review/calibration-adjudication` | Initial Claude promoted the duplicate wording nit into grouped confirmation; Codex retained it as FYI. Both refuted the false ownership objection | Both rejected F1/F2/F4 and residual noise; F3 stayed behind grouped confirmation; neither chose retention |
| `ce-doc-review/calibration-resume` | Not rerun on baseline | Both hosts reused complete unchanged evidence without another reviewer pass |
| `ce-pov/calibration-missing-framing` | Claude invented a provisional seven-day default; Codex returned Hold | Both returned essential missing product criteria without choosing retention or interviewing |
| `ce-pov/calibration-grounded-position` | Not rerun on baseline | Both chose the existing ownership helper from verified requirements and source |
| `ce-work/calibration-followup` | Both allowed helper reuse and deferred retention; old residual policy led to an interactive menu | Both allowed helper reuse and kept unapproved retention outside the independent authorized outcome |
| `ce-work/calibration-required-decision` | Not rerun on baseline | Both blocked when automatic deletion became a required outcome but its retention period remained unapproved |
| `ce-code-review/calibration-lead` | Not rerun on baseline | Both rejected the disproven ownership claim and hypothetical class hierarchy, including residual/deferred variants |

Final document-review output differed on the already-recorded retention fork: Claude declined to re-raise it because it did not block this plan; Codex retained one manual Defer item. Both preserved the unresolved choice and made no edit. This is presentation variation, not evidence of identical decision counts.

An intermediate Codex work run passed the keyword grade but incorrectly treated unrelated retention as a shipping blocker. The final residual gate was restated around the required outcome, then tested on both the nonblocking and required-decision cases. Both hosts distinguished those cases in the final runs. The work fixture was also corrected to include an actual duplicated condition in `src/endpoint.js`; the original task could be interpreted as editing plan wording instead of code. The corrected fixture was run on both baseline and post arms.

## Validation and limits

- Full `bun run test`: 3,726 passed, zero failed. The first run caught three contract/catalog mismatches, which were corrected before the passing full run.
- After final residual-gate and schema-description edits: 237 targeted tests passed, zero failed.
- `bun run release:validate`, `bun run plugin:validate`, and `git diff --check` passed.
- `ce-simplify-code`: three independent code reviewers completed. Shared fixture-read checks and parallel test-file reads were adopted; no unnecessary evaluation selector was added. New rows use the existing catalog and completed cohort. No separate lint or typecheck command is configured in package scripts.
- These are decision and routing cells, not live reviewer fanout, interactive UI, mutation, or shipping tests. They do not prove end-to-end interruption counts, false-apply rates, or equivalence with Pstack. No activation behavior changed. Existing LFG-specific apply policy and unrelated legacy reviewer protocols remain outside this change.

Raw local evidence is under `/var/folders/yr/rc1_m71d72zcl3zxwsdd75400000gn/T/ce-calibration-eval-yELaGj/`: `final-doc`, `final-code`, `final-work-residual`, `final-work-blocker`, and the original post POV/resume directories. Intermediate results are retained for audit; final runs supersede them where noted.
