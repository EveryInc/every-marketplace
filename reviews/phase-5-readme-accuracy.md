# Phase 5: README Accuracy and Completeness

**Codex Analysis Results**

## Undocumented Coverage

- **Agent Gaps:** The `agents/` folder defines 17 experts, but the Agent Reference section only explains 7 (`kieran-rails-reviewer` through `pattern-recognition-specialist`). Ten others—`kieran-typescript-reviewer`, `kieran-python-reviewer`, `dhh-rails-reviewer`, `code-simplicity-reviewer`, `data-integrity-guardian`, `git-history-analyzer`, `repo-research-analyst`, `framework-docs-researcher`, `pr-comment-resolver`, and `every-style-editor`—have no usage examples, success criteria, or "what it checks" callouts even though their markdown specs exist under `agents/`. Readers can see the names in the overview table but get no guidance on when or how to invoke them.
- **Command Gaps:** `/compounding-engineering:generate_command` appears in the Command Reference but never shows up in Quick Start, Common Workflows, or Troubleshooting. There's no narrative example demonstrating why or when to turn to it, despite `commands/generate_command.md` outlining substantial capabilities.

## Outdated Examples

- **Plan Output Paths:** Quick Start ("Your First Workflow") and Common Workflow 1 both show `/plan` producing files like `docs/feature-plan.md` or `docs/2fa-feature-plan.md`. The actual command spec (`commands/plan.md`) outputs a GitHub-issue payload inside `<github_issue>` tags; it doesn't create local markdown files. Those examples describe behavior that no longer exists.
- **Argument-Free `/work`:** The `/work` command examples list "Execute current plan" with `claude /compounding-engineering:work` (no arguments), but the command definition requires an input document (`#$ARGUMENTS` is mandatory). Unless there's undocumented implicit state, that example is likely a leftover from an earlier version.

## Workflow Mismatches

- **Review Without a PR:** Quick Start and several Common Workflows instruct running `/compounding-engineering:review` immediately after `/work` without creating a pull request or passing a target. `commands/review.md` explicitly says an empty invocation reviews the "latest PR," not the current worktree. Following the README workflow would review someone else's PR instead of the branch you just developed.
- **Plan-to-Work Handoff:** Multiple workflows assume `/plan` writes a reusable plan file consumed by `/work`. Because the plan command now emits issue text for `gh issue create`, users must manually save that output or `/work` has no document to parse. The described automation loop (plan → work → review) therefore doesn't function as written.

## Clarity Opportunities

- **Command Reference Density:** Long prose blocks (especially under `/plan` and `/work`) obscure the handful of mandatory inputs and outputs. Replacing portions with concise tables (arguments, default behaviors, side effects) would make the specs faster to scan.
- **Agent Reference Consistency:** The seven detailed agent write-ups use different structures, and most skip prerequisites or sample prompts tied to real repo files. A consistent template (When to use, Inputs, Checks performed, Example prompt) would make the section more compelling and trustworthy.
- **Common Workflows:** Each workflow is a solid narrative, but none mention prerequisites (e.g., "open PR before running `/review`"). Adding a short "Preconditions" line and clarifying which commands expect artifacts from previous steps would prevent the mismatches noted above.

## Missing Troubleshooting

- **`gh` CLI Failures:** `/review` depends on `gh pr checkout` and `gh pr view`, yet troubleshooting never covers missing GitHub CLI installs or authentication failures. A subsection with `brew install gh`/`gh auth login` guidance would save setup time.
- **Non-`main` Default Branches:** `commands/work.md` assumes `git checkout main`. Repos that use `develop` or another default will see worktree creation fail, but there's no troubleshooting advice for updating the base branch.
- **Plan Output Handling:** Since `/plan` now emits markdown to stdout, users frequently ask where the file went. A troubleshooting entry describing how to redirect output to `docs/*.md` (or pipe into `gh issue create`) would bridge the current documentation gap.

## Key Issues Identified

- ⚠️ **10/17 agents undocumented in README**
- ⚠️ **Examples don't match actual command behavior** (plan output, work arguments)
- ⚠️ **Workflow loops broken** (missing PR requirement, file handoff issues)
- ⚠️ **Missing prerequisites and troubleshooting**
