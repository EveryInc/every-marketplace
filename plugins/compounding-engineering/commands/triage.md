# Triage Command

Present all findings, decisions, or issues here one by one for triage. The goal is to go through each item and decide whether to add it to the CLI todo system.

**IMPORTANT: DO NOT CODE ANYTHING DURING TRIAGE!**

## Usage

```bash
# With namespace (always works)
claude /compounding-engineering:triage

# Set up alias for convenience (optional)
alias triage="claude /compounding-engineering:triage"
```

## Purpose

This command is for:
- Triaging code review findings
- Processing security audit results
- Reviewing performance analysis
- Handling any other categorized findings that need tracking

## Workflow

### Step 1: Present Each Finding

For each finding, present in this format:

```
---
Issue #X: [Brief Title]

Severity: 🔴 P1 (CRITICAL) / 🟡 P2 (IMPORTANT) / 🔵 P3 (NICE-TO-HAVE)

Category: [Security/Performance/Architecture/Bug/Feature/etc.]

Description:
[Detailed explanation of the issue or improvement]

Location: [file_path:line_number]

Problem Scenario:
[Step by step what's wrong or could happen]

Proposed Solution:
[How to fix it]

Estimated Effort: [Small (< 2 hours) / Medium (2-8 hours) / Large (> 8 hours)]

---
Do you want to add this to the todo list?
1. yes - create todo file
2. next - skip this item
3. custom - modify before creating
```

### Step 2: Handle User Decision

**When user says "yes":**

1. **Determine next issue ID:**
   ```bash
   ls todos/ | grep -o '^[0-9]\+' | sort -n | tail -1
   ```

2. **Create filename:**
   ```
   {next_id}-pending-{priority}-{brief-description}.md
   ```

   Priority mapping:
   - 🔴 P1 (CRITICAL) → `p1`
   - 🟡 P2 (IMPORTANT) → `p2`
   - 🔵 P3 (NICE-TO-HAVE) → `p3`

   Example: `042-pending-p1-transaction-boundaries.md`

3. **Create from template:**
   ```bash
   cp todos/000-pending-p1-TEMPLATE.md todos/{new_filename}
   ```

4. **Populate the file:**
   ```yaml
   ---
   status: pending
   priority: p1  # or p2, p3 based on severity
   issue_id: "042"
   tags: [category, relevant-tags]
   dependencies: []
   ---

   # [Issue Title]

   ## Problem Statement
   [Description from finding]

   ## Findings
   - [Key discoveries]
   - Location: [file_path:line_number]
   - [Scenario details]

   ## Proposed Solutions

   ### Option 1: [Primary solution]
   - **Pros**: [Benefits]
   - **Cons**: [Drawbacks if any]
   - **Effort**: [Small/Medium/Large]
   - **Risk**: [Low/Medium/High]

   ## Recommended Action
   [Leave blank - will be filled during approval]

   ## Technical Details
   - **Affected Files**: [List files]
   - **Related Components**: [Components affected]
   - **Database Changes**: [Yes/No - describe if yes]

   ## Resources
   - Original finding: [Source of this issue]
   - Related issues: [If any]

   ## Acceptance Criteria
   - [ ] [Specific success criteria]
   - [ ] Tests pass
   - [ ] Code reviewed

   ## Work Log

   ### {date} - Initial Discovery
   **By:** Claude Triage System
   **Actions:**
   - Issue discovered during [triage session type]
   - Categorized as {severity}
   - Estimated effort: {effort}

   **Learnings:**
   - [Context and insights]

   ## Notes
   Source: Triage session on {date}
   ```

5. **Confirm creation:**
   "✅ Created: `{filename}` - Issue #{issue_id}"

**When user says "next":**
- Skip to the next item
- Track skipped items for summary

**When user says "custom":**
- Ask what to modify (priority, description, details)
- Update the information
- Present revised version
- Ask again: yes/next/custom

### Step 3: Continue Until All Processed

- Process all items one by one
- Track using TodoWrite for visibility
- Don't wait for approval between items - keep moving

### Step 4: Final Summary

After all items processed:

```markdown
## Triage Complete

**Total Items:** [X]
**Todos Created:** [Y]
**Skipped:** [Z]

### Created Todos:
- `042-pending-p1-transaction-boundaries.md` - Transaction boundary issue
- `043-pending-p2-cache-optimization.md` - Cache performance improvement
...

### Skipped Items:
- Item #5: [reason]
- Item #12: [reason]

### Next Steps:
1. Review pending todos: `ls todos/*-pending-*.md`
2. Approve for work: Move from pending → ready status
3. Start work: Use `/resolve_todo_parallel` or pick individually
```

## Example Response Format

```
---
Issue #5: Missing Transaction Boundaries for Multi-Step Operations

Severity: 🔴 P1 (CRITICAL)

Category: Data Integrity / Security

Description:
The google_oauth2_connected callback in GoogleOauthCallbacks concern performs multiple database
operations without transaction protection. If any step fails midway, the database is left in an
inconsistent state.

Location: app/controllers/concerns/google_oauth_callbacks.rb:13-50

Problem Scenario:
1. User.update succeeds (email changed)
2. Account.save! fails (validation error)
3. Result: User has changed email but no associated Account
4. Next login attempt fails completely

Operations Without Transaction:
- User confirmation (line 13)
- Waitlist removal (line 14)
- User profile update (line 21-23)
- Account creation (line 28-37)
- Avatar attachment (line 39-45)
- Journey creation (line 47)

Proposed Solution:
Wrap all operations in ApplicationRecord.transaction do ... end block

Estimated Effort: Small (30 minutes)

---
Do you want to add this to the todo list?
1. yes - create todo file
2. next - skip this item
3. custom - modify before creating
```

Do not code, and if you say yes, make sure to mark the to‑do as ready to pick up or something. If you make any changes, update the file and then continue to read the next one. If next is selecrte make sure to remove the to‑do from the list since its not relevant.

Every time you present the to‑do as a header, can you say what the progress of the triage is, how many we have done and how many are left, and an estimated time for completion, looking at how quickly we go through them as well?
