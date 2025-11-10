# Phase 2: Command Consistency Review

**Codex Analysis Results**

## Structural Templates

- **`generate_command.md`**: Breaks the shared pattern by replacing the "Goal" narrative with the literal `#$ARGUMENTS` placeholder and omitting any prerequisites or success criteria, so new commands lack guidance on inputs or completion checks.
- **`resolve_todo_parallel.md`**: Provides only a "Workflow" section; no overview, prerequisites, or success checklist, and Step 2's paragraph ("grouped by type.Make sure…") is fused together, making the structure diverge from other commands' stepwise templates.
- **`triage.md`**: Skips introductory/context sections and folds warnings into a bold sentence at the top instead of a structured "Prerequisites" or "Warnings" block, so it reads differently from `review.md`/`work.md`.
- **`plan.md`**: Mixes `<thinking>` tags, emoji subsections, and full templates inside templates; the nesting (Minimal/More/Maximum) is useful but inconsistent with other command docs that stop at one workflow outline.
- **`work.md`**: Much closer to `review.md`, but lacks a concluding "Success Criteria" block like the others, so expectations for completion are implicit rather than explicit.

## Usage Examples

- **`resolve_todo_parallel.md`**: No concrete invocation or sample argument (e.g., showing what happens when pointing at `todos/*.md`), making it the only command without a real usage example.
- **`triage.md`**: Provides alias instructions but no example showing how to pass findings or reference a source file, unlike `plan.md`, `review.md`, and `work.md` which each include realistic example calls.

## Cross-References

- **Namespace mismatches**: `review.md`'s closing notes reference `/workflows:review {arguments}` and `/triage` without the `/compounding-engineering:` namespace; `triage.md` similarly tells readers to switch to `/resolve_todo_parallel` without the namespace. These break copy/paste parity with the Usage sections.
- **Missing backlinks**: `resolve_todo_parallel.md` never mentions that its outputs are the todos created via `triage.md`, and `triage.md` doesn't remind readers that those todos feed into the `/compounding-engineering:work` command, leaving the lifecycle implicit.
- **Unintroduced agents**: `resolve_todo_parallel.md` instructs spawning `pr-comment-resolver` tasks but no other command defines that agent, so readers can't cross-reference capabilities or prerequisites.

## Clarity Opportunities

- **`plan.md`**: Contains typos ("Runn", "paralel"), vague instructions ("use paralel subagents to do this"), and conflicting tone ("I'll put the to-dos…"), which could be tightened into imperative steps with bullet lists to stay consistent with the other docs.
- **`resolve_todo_parallel.md`**: Step 2 combines multiple sentences without punctuation and never explains what the mermaid diagram should look like; adding a short example diagram would clarify expectations.
- **`review.md`**: The "Parallel Agents" list mixes language-specific and universal reviewers without indicating which are mandatory; a small matrix or decision table would reduce ambiguity.
- **`triage.md`**: The final paragraph ("Every time you present… say what the progress…") is detached from the workflow and should be moved into Step 1 as a rule so it isn't overlooked.
- **`work.md`**: Mentions the git-worktree-create skill but doesn't link to its documentation or describe failure modes, leaving users unsure how to recover if the automation isn't available.

## Prerequisites & Warnings

- **`generate_command.md`**: Should warn that `.claude/commands/` must exist and that command names should be unique; currently implies you can "Create a new slash command" without noting file naming conventions or required metadata.
- **`plan.md`**: Lacks an explicit prerequisite list (GitHub CLI auth, repo access, template files) even though later steps call `gh` and rely on repo labels.
- **`resolve_todo_parallel.md`**: No warning about needing a clean working tree before spawning parallel agents, nor about the requirement for the `todos/` directory structure and TodoWrite access.
- **`triage.md`**: Omits prerequisites such as `todos/000-pending-p1-TEMPLATE.md` existing and the need for repository write access before creating files; a short warning would prevent failed file operations.
- **`work.md`**: Should caution that the automated worktree setup can delete existing `.worktrees/*` directories or overwrite branches, and that local changes on `main` must be committed before running the command.
