# /compounding-engineering:review

## Goal

Perform exhaustive code reviews (or document reviews) using isolated Git worktrees, coordinated specialist agents, and structured synthesis so every finding becomes an actionable todo in the repository’s `todos/` system.

## Prerequisites

- `claude` CLI authenticated with access to `/compounding-engineering:review` (optional alias: `alias review="claude /compounding-engineering:review"`).
- GitHub CLI (`gh`) installed, authenticated, and permitted to create worktrees and fetch PR metadata.
- Clean `main`/`master` branch plus write permissions to `.worktrees/reviews/pr-*` directories.
- Mandatory rule: **create the review worktree before any other analysis** so every agent runs against local code, not just diffs.
- Access to project tooling (linters, language servers) and to todo templates inside `todos/000-pending-p*-TEMPLATE.md`.
- Availability of Task agents: `kieran-rails-reviewer`, `kieran-typescript-reviewer`, `kieran-python-reviewer`, `dhh-rails-reviewer`, `git-history-analyzer`, `repo-research-analyst`, `pattern-recognition-specialist`, `architecture-strategist`, `feedback-codifier`, `security-sentinel`, `performance-oracle`, `best-practices-researcher`, `data-integrity-guardian`, `code-simplicity-reviewer`.

## Workflow

1. **Invoke the command**  
   ```bash
   claude /compounding-engineering:review 123
   claude /compounding-engineering:review https://github.com/owner/repo/pull/123
   claude /compounding-engineering:review docs/plan.md
   ```
   Use `#$ARGUMENTS` to pass the PR number, PR URL, or file path to review.

2. **Provision the worktree and detect project type**  
   - Determine the target type (PR number, GitHub URL, document path, or latest PR).  
   - Create the worktree directory: ``$git_root/.worktrees/reviews/pr-$identifier``.  
   - Check out the PR locally: `gh pr checkout $identifier`.  
   - Fetch metadata: `gh pr view $identifier --json title,body,files,author,baseRefName`.  
   - Detect the stack to select reviewers:
     - **Rails** → `Gemfile` with `rails`, `config/application.rb`, `app/`.  
     - **TypeScript** → `tsconfig.json`, `package.json` with TS deps, `.ts/.tsx` files.  
     - **Python** → `pyproject.toml` or `requirements.txt`, `.py` files, `setup.py`/`poetry.lock`.  
   - Stay inside the worktree; all further shell commands, tests, and scans run here.

3. **Launch parallel reviewer agents**  
   - Run language-specific reviewers based on detection:  
     - Rails: `Task kieran-rails-reviewer(PR content)` and `Task dhh-rails-reviewer(PR title)`.  
     - TypeScript: `Task kieran-typescript-reviewer(PR content)`.  
     - Python: `Task kieran-python-reviewer(PR content)`.  
   - Run universal reviewers for every stack:  
     ```bash
     Task git-history-analyzer(PR content)
     Task repo-research-analyst(PR content)
     Task pattern-recognition-specialist(PR content)
     Task architecture-strategist(PR content)
     Task feedback-codifier(PR content)
     Task security-sentinel(PR content)
     Task performance-oracle(PR content)
     Task best-practices-researcher(PR content)
     Task data-integrity-guardian(PR content)
     Task code-simplicity-reviewer()
     ```  
   - Configure any language-specific linters, test suites, or security scanners before collecting reports.

4. **Conduct ultra-thinking analysis**  
   - Produce a complete system context map showing component interactions.  
   - **Stakeholder perspective review:** evaluate developer, operations, end-user, security, and business concerns (ease of modification, deployability, UX clarity, attack surface, ROI).  
   - **Scenario exploration:** walk through happy paths, invalid inputs, boundaries, concurrency, scale, network failures, resource exhaustion, security attacks, data corruption, and cascading failure scenarios.  
   - **Multi-angle assessment:** cover technical excellence, business value, risk management, and team dynamics.  
   - Challenge assumptions, document trade-offs, and note simplification opportunities flagged by `code-simplicity-reviewer`.

5. **Synthesize findings**  
   - Aggregate results from all agents.  
   - De-duplicate and categorize by theme (security, performance, architecture, quality, docs).  
   - Assign severity 🔴 (P1), 🟡 (P2), 🔵 (P3) plus effort (Small/Medium/Large).  
   - Capture precise locations (`file_path:line_number`) and supporting evidence (metrics, logs, screenshots).  
   - Maintain a table or checklist for tracking.

6. **Present findings for triage**  
   For each finding, output:
   ```
   ---
   Finding #X: [Brief Title]

   Severity: 🔴 P1 / 🟡 P2 / 🔵 P3
   Category: [Security/Performance/Architecture/Quality/etc.]

   Description:
   [Detailed explanation]

   Location: [file_path:line_number]
   Problem: [Why it matters]
   Impact: [Effect on users/platform]
   Proposed Solution: [How to fix]
   Effort: Small/Medium/Large

   Do you want to add this to the todo list?
   1. yes – create todo file
   2. next – skip
   3. custom – modify before creating
   ```

7. **Create todos for approved findings**  
   - When the user selects “yes,” determine the next issue ID:  
     ```bash
     next_id=$(ls todos/ | grep -o '^[0-9]\+' | sort -n | tail -1)
     ```  
   - Generate the filename: `{next_id}-pending-{priority}-{brief-description}.md`.  
   - Copy the appropriate template:  
     ```bash
     cp todos/000-pending-p1-TEMPLATE.md todos/{new_filename}
     ```  
   - Populate the template with YAML front matter, problem statement, findings, proposed solutions, technical details, resources, acceptance criteria, and work log entries as captured above.  
   - Track each creation in TodoWrite if batching multiple items.

8. **Summarize and hand off**  
   - Produce a final markdown report:  
     ```markdown
     ## Code Review Complete

     **Review Target:** [PR number or branch]
     **Total Findings:** [X]
     **Todos Created:** [Y]

     ### Created Todos
     - `{issue_id}-pending-p1-{description}.md` – {title}
     - `{issue_id}-pending-p2-{description}.md` – {title}

     ### Skipped Findings
     - [Finding #Z]: {reason}

     ### Next Steps
     1. Triage pending todos with `/compounding-engineering:triage`
     2. Approve and prioritize
     3. Hand off resolved work to `/compounding-engineering:work` or `/compounding-engineering:resolve_todo_parallel`
     ```  
   - Offer a batch creation option if the user wants todos for every finding (ask “yes/no/show-critical-only”).

## Success Criteria

- [ ] Dedicated worktree exists at `.worktrees/reviews/pr-$identifier` with the PR checked out via `gh pr checkout`.  
- [ ] Appropriate language-specific and universal reviewer agents ran in parallel, plus `code-simplicity-reviewer`.  
- [ ] Ultra-thinking outputs include stakeholder lenses, scenario analysis, and multi-angle assessments.  
- [ ] Every approved finding became a todo file in `todos/` using the correct template and severity.  
- [ ] Final summary reports total findings, todos created, skipped items, and next steps.

## Troubleshooting

- **Problem:** Worktree creation fails or PR checkout errors.  
  **Solution:** Confirm a clean main branch, remove stale directories in `.worktrees/reviews/`, run `gh auth refresh`, then retry `gh pr checkout`.
- **Problem:** Language reviewers mismatch the stack.  
  **Solution:** Re-run the project-type detection step, inspect key files (e.g., `Gemfile`, `package.json`, `pyproject.toml`), and relaunch only the applicable agents.
- **Problem:** Findings are duplicated across agents.  
  **Solution:** During synthesis, consolidate overlapping issues, keep the highest-severity version, and note merged evidence in the todo file.
- **Problem:** Todo creation fails because IDs collide.  
  **Solution:** Recalculate the next ID after every file creation (`ls todos/ | sort`) or reserve a range before batching.
- **Problem:** GitHub CLI cannot fetch PR metadata.  
  **Solution:** Run `gh auth status`, verify repo remote, and supply the full PR URL when invoking the command.
