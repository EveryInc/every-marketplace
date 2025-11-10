# Todo System

This directory contains the CLI-based todo tracking system for managing work items, issues, and improvements discovered through code reviews, analysis, and planning sessions.

## Directory Structure

```
todos/
├── README.md                    # This file
├── 000-pending-p1-TEMPLATE.md   # Template for P1 (Critical) issues
├── 000-pending-p2-TEMPLATE.md   # Template for P2 (Important) issues
├── 000-pending-p3-TEMPLATE.md   # Template for P3 (Nice-to-have) issues
└── {id}-{status}-{priority}-{description}.md  # Actual todo files
```

## File Naming Convention

Todo files follow this pattern:
```
{issue_id}-{status}-{priority}-{brief-description}.md
```

**Examples:**
- `001-pending-p1-sql-injection-fix.md`
- `042-approved-p2-cache-optimization.md`
- `105-completed-p3-refactor-service.md`

### Components:

- **issue_id**: Sequential 3-digit number (001, 002, 003, ...)
- **status**: Current state of the todo
  - `pending` - Awaiting triage/approval
  - `approved` - Ready to work on
  - `in-progress` - Currently being worked on
  - `completed` - Finished and verified
  - `blocked` - Cannot proceed (waiting on dependency)
  - `cancelled` - No longer relevant/needed
- **priority**: Urgency and impact level
  - `p1` - Critical (security, data loss, system down)
  - `p2` - Important (performance, user experience, tech debt)
  - `p3` - Nice-to-have (polish, minor improvements, future enhancements)
- **brief-description**: Short kebab-case description (3-5 words)

## Workflow

### 1. Discovery Phase
Todos are created from various sources:
- `/review` command (code reviews)
- `/triage` command (issue processing)
- Manual discovery during development
- Security audits
- Performance analysis

### 2. Triage Phase
New todos start in `pending` status. Use `/triage` to:
- Review each finding
- Decide to accept (create todo) or skip
- Customize details if needed
- Assign initial priority

### 3. Approval Phase
Pending todos need approval before work begins:
```bash
# Review pending items
ls todos/*-pending-*.md

# Approve by renaming
mv todos/042-pending-p1-fix.md todos/042-approved-p1-fix.md
```

### 4. Work Phase
Use commands to work on approved todos:
- `/resolve_todo_parallel` - Process multiple todos in parallel
- `/work` - Execute todo as a work plan
- Manual implementation

When starting work:
```bash
mv todos/042-approved-p1-fix.md todos/042-in-progress-p1-fix.md
```

### 5. Completion Phase
After work is done and verified:
```bash
mv todos/042-in-progress-p1-fix.md todos/042-completed-p1-fix.md
```

## Priority Guidelines

### P1 (Critical) - Fix Immediately
- Security vulnerabilities (SQL injection, XSS, auth bypass)
- Data integrity issues (data loss, corruption)
- System availability (crashes, infinite loops, deadlocks)
- Critical bugs affecting core functionality
- Compliance violations

**SLA**: Within 24 hours

### P2 (Important) - Fix Soon
- Performance problems (slow queries, memory leaks)
- User experience issues (confusing UI, error messages)
- Technical debt (code smells, deprecated APIs)
- Missing validations or error handling
- Important refactoring for maintainability

**SLA**: Within 1-2 weeks

### P3 (Nice-to-have) - Plan for Future
- Code polish and cleanup
- Minor optimizations
- Documentation improvements
- Nice-to-have features
- Exploratory refactoring

**SLA**: When time permits

## Todo File Structure

Each todo file contains:
```yaml
---
status: pending|approved|in-progress|completed|blocked|cancelled
priority: p1|p2|p3
issue_id: "042"
tags: [security, rails, oauth]
dependencies: ["041", "039"]  # Other issue IDs that must be completed first
---

# [Issue Title]

## Problem Statement
Clear description of what's wrong or what needs improvement.

## Findings
- How was this discovered?
- Who/what identified it?
- Specific evidence or examples

## Proposed Solutions

### Option 1: [Primary approach]
- **Pros**: Benefits and advantages
- **Cons**: Drawbacks or risks
- **Effort**: Small/Medium/Large
- **Risk**: Low/Medium/High

### Option 2: [Alternative approach]
(Optional - include if there are multiple valid approaches)

## Recommended Action
After triage, document the chosen approach and reasoning.

## Technical Details
- **Affected Files**: List of files that need changes
- **Related Components**: Models, controllers, services involved
- **Database Changes**: Schema migrations, data migrations needed
- **API Changes**: Breaking changes, deprecations

## Resources
- Code references: [file_path:line_number]
- Documentation: [URLs]
- Related issues: #123, #456
- Related PRs: #789

## Acceptance Criteria
- [ ] Specific, testable success criteria
- [ ] Tests pass (unit, integration, system)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Performance verified
- [ ] Security checked

## Work Log

### YYYY-MM-DD - [Phase/Milestone]
**By:** [Name or "Claude Code System"]
**Actions:**
- What was done

**Learnings:**
- What was learned
- Insights gained
- Patterns discovered

## Notes
Additional context, warnings, or important information.
```

## Querying Todos

### Find by Status
```bash
ls todos/*-pending-*.md    # All pending items
ls todos/*-approved-*.md   # Ready to work on
ls todos/*-in-progress-*.md # Currently being worked
ls todos/*-completed-*.md  # Finished items
```

### Find by Priority
```bash
ls todos/*-p1-*.md  # All critical items
ls todos/*-p2-*.md  # All important items
ls todos/*-p3-*.md  # All nice-to-have items
```

### Find Specific Combinations
```bash
ls todos/*-approved-p1-*.md  # Approved critical items (work on these!)
ls todos/*-pending-p2-*.md   # Pending important items (triage these)
```

### Search by Content
```bash
# Find todos related to security
grep -l "security" todos/*.md

# Find todos affecting a specific file
grep -l "app/controllers/users_controller.rb" todos/*.md
```

## Best Practices

1. **One Issue Per File**: Each todo should represent a single, focused piece of work
2. **Clear Titles**: Make titles searchable and descriptive
3. **Detailed Context**: Include enough information for someone else to understand and fix
4. **Update Regularly**: Keep work logs current with progress and learnings
5. **Link Related Work**: Cross-reference related todos, PRs, and issues
6. **Track Dependencies**: Use the dependencies field to manage work order
7. **Archive Completed**: Move old completed todos to an archive directory quarterly
8. **Tag Appropriately**: Use tags for categorization (security, performance, rails, etc.)

## Integration with Commands

### `/review` Command
- Discovers issues during code review
- Presents findings for triage
- Creates pending todos for accepted items

### `/triage` Command
- Processes pending todos one by one
- Allows accept/skip/customize decisions
- Creates properly structured todo files

### `/resolve_todo_parallel` Command
- Analyzes dependencies between todos
- Spawns parallel agents for independent work
- Commits and marks todos as completed

### `/work` Command
- Executes a todo as a complete work plan
- Creates worktree for isolated development
- Tracks progress with TodoWrite
- Submits PR when complete

## Getting Next Issue ID

```bash
# Get the highest issue ID currently in use
ls todos/ | grep -o '^[0-9]\+' | sort -n | tail -1

# Next ID is highest + 1
```

## Example Workflow

```bash
# 1. Run code review
claude /compounding-engineering:review 123

# 2. Triage findings (creates pending todos)
claude /compounding-engineering:triage

# 3. Approve critical items
for f in todos/*-pending-p1-*.md; do
  mv "$f" "${f/pending/approved}"
done

# 4. Work on approved todos
claude /compounding-engineering:resolve_todo_parallel

# 5. Check completed work
ls todos/*-completed-*.md
```

## Maintenance

### Weekly
- Review pending todos older than 7 days
- Triage or close stale items
- Ensure in-progress items are active

### Monthly
- Review completed todos
- Extract learnings for documentation
- Archive old completed items
- Update this README with new patterns

### Quarterly
- Archive completed todos to `todos/archive/YYYY-QQ/`
- Review priority distribution
- Update templates based on learnings
- Analyze common issue patterns
