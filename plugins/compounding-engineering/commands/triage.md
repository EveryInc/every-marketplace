# /compounding-engineering:triage

## Goal

Work through every pending finding, decision, or issue one by one, decide whether it belongs in the CLI todo system, and generate the appropriate todo files without writing or modifying product code.

## Prerequisites

- `claude` CLI authenticated with access to `/compounding-engineering:triage` (optional alias: `alias triage="claude /compounding-engineering:triage"`).
- Access to the repository’s `todos/` directory and the templates `000-pending-p{1,2,3}-TEMPLATE.md`.
- `TodoWrite` (or equivalent tracking) enabled for logging progress.
- Commitment to **not author any code changes during triage**—this command only decides and records work items.
- Agreement to provide progress updates with every finding header (e.g., “Item 3 of 11, ~8 minutes remaining”).

## Workflow

1. **Invoke the triage session**  
   ```bash
   claude /compounding-engineering:triage
   ```  
   Load the queue of findings from code reviews, security audits, performance runs, or other pipelines.

2. **Present each finding consistently**  
   - Before each item, announce progress (processed count, total remaining, estimated completion).  
   - Display the structured block:
     ```
     ---
     Issue #X: [Brief Title]

     Severity: 🔴 P1 (CRITICAL) / 🟡 P2 (IMPORTANT) / 🔵 P3 (NICE-TO-HAVE)
     Category: [Security/Performance/Architecture/Bug/Feature/etc.]

     Description:
     [Detailed explanation]

     Location: [file_path:line_number]
     Problem Scenario:
     [Step-by-step what happens]
     Proposed Solution:
     [Fix or mitigation]
     Estimated Effort: Small (<2h) / Medium (2–8h) / Large (>8h)

     ---
     Do you want to add this to the todo list?
     1. yes – create todo file
     2. next – skip
     3. custom – modify before creating
     ```

3. **Handle the user’s decision**  
   - **yes:**
     1. Determine the next issue ID:
        ```bash
        next_id=$(ls todos/ | grep -o '^[0-9]\+' | sort -n | tail -1)
        ```
     2. Build the filename `{next_id}-pending-{priority}-{brief-description}.md`, mapping severity to `p1/p2/p3`.
     3. Copy the matching template (e.g., `cp todos/000-pending-p1-TEMPLATE.md todos/{new_filename}`).
     4. Populate YAML front matter plus sections (Problem Statement, Findings, Proposed Solutions, Technical Details, Resources, Acceptance Criteria, Work Log, Notes) using the collected data:  
        ```yaml
        ---
        status: pending
        priority: p1
        issue_id: "042"
        tags: [category, relevant-tags]
        dependencies: []
        ---
        ```
     5. Confirm creation: `✅ Created: {filename} (Issue #{issue_id})` and log it in TodoWrite.
   - **next:** record the skip reason, remove or mark the item as not relevant, and continue.  
   - **custom:** ask what to change (priority, description, effort, etc.), revise the block, then re-prompt with the yes/next/custom menu.

4. **Loop until the queue is empty**  
   - Continue presenting, deciding, and logging items without waiting for external approval.  
   - Keep TodoWrite (or a running table) updated with statuses: pending, skipped, deferred.  
   - Ensure skipped items are removed from any “to review” lists so they are not reprocessed accidentally.

5. **Publish the final summary**  
   When all items are processed, output:
   ```markdown
   ## Triage Complete

   **Total Items:** [X]
   **Todos Created:** [Y]
   **Skipped:** [Z]

   ### Created Todos
   - `042-pending-p1-transaction-boundaries.md` – Transaction boundary issue
   - `043-pending-p2-cache-optimization.md` – Cache performance improvement

   ### Skipped Items
   - Item #5: [Reason]
   - Item #12: [Reason]

   ### Next Steps
   1. Review pending todos: `ls todos/*-pending-*.md`
   2. Approve for work via `/compounding-engineering:triage` or promotion workflow
   3. Start execution with `/compounding-engineering:resolve_todo_parallel` or targeted commands
   ```

## Success Criteria

- [ ] Every finding received a progress-aware presentation and a clear decision (yes/next/custom).  
- [ ] All approved items became properly formatted todo files with unique IDs and matching severity.  
- [ ] Skipped items were documented with reasons and removed from active queues.  
- [ ] Final summary captured totals, created filenames, and next steps.  
- [ ] No source code changes were made during the session.

## Troubleshooting

- **Problem:** Cannot determine the next issue ID because `todos/` is empty.  
  **Solution:** Initialize the directory with the provided templates and start numbering at `001` manually.
- **Problem:** Duplicate filenames when batching creations.  
  **Solution:** Recompute `next_id` immediately before each file creation or lock the directory while generating multiple todos.
- **Problem:** User forgets to provide progress estimates.  
  **Solution:** Maintain a simple counter (`processed/total`) and calculate ETA based on average time per item, announcing it before every header.
- **Problem:** Severity level unclear.  
  **Solution:** Revisit the original finding details (impact, exploitability, scope) and confirm with the requester before creating the todo.
- **Problem:** Templates missing required fields.  
  **Solution:** Copy fresh versions from `todos/000-pending-p*-TEMPLATE.md` and reapply the data, ensuring YAML front matter stays intact.
