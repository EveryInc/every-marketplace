# Git Worktree Best Practices Skill

## Overview

Provides comprehensive guidance on git worktree naming conventions, organizational patterns, and workflow strategies aligned with the compounding engineering philosophy. This skill helps establish consistent, maintainable worktree practices across teams and projects.

## When to Use This Skill

- **Planning Workflows**: Establish worktree patterns for your team
- **Naming Questions**: Determining semantic names for worktrees
- **Organization**: Structuring `.worktrees/` directory effectively
- **Team Conventions**: Setting standards for consistent practice
- **Troubleshooting**: Solving worktree-related issues
- **Scaling**: Managing many worktrees across large teams

## Core Philosophy

**Every unit of engineering work should make subsequent units easier—not harder.**

Applied to worktrees, this means:
- **Consistent naming** makes it easy to find work
- **Semantic structure** communicates intent
- **Clean organization** prevents chaos as scale grows
- **Clear conventions** reduce decision fatigue
- **Easy cleanup** maintains repository health

## Naming Conventions

### Convention 1: Purpose Prefixes

All worktrees use a **purpose prefix** to indicate their function:

| Prefix | Purpose | Location | Lifetime | Example |
|--------|---------|----------|----------|---------|
| `reviews/pr-` | Pull request review | `.worktrees/reviews/pr-123/` | Days | After review, remove |
| `feature-` | Feature development | `.worktrees/feature-auth/` | Weeks | Until merged |
| `spike-` | Experiment/investigation | `.worktrees/spike-cache/` | Days-weeks | Until decision made |
| `refactor-` | Refactoring work | `.worktrees/refactor-db/` | Weeks | Until merged |
| `hotfix-` | Production hotfix | `.worktrees/hotfix-bug-123/` | Days | ASAP merge |
| `doc-` | Documentation | `.worktrees/doc-api/` | Days-weeks | When published |

### Convention 2: Naming Format

**Format**: `{prefix}{descriptive-name}`

**Rules**:
- Use lowercase
- Use hyphens for word separation
- Use underscores ONLY for unclear acronyms
- Be specific and descriptive
- Keep under 50 characters total

**Good Examples**:
```
feature-user-authentication
feature-stripe-integration
spike-performance-optimization
refactor-database-layer
hotfix-login-bug
reviews/pr-456
```

**Bad Examples**:
```
feature1                    # Not descriptive
feature_user_auth           # Use hyphens not underscores
feature-user-authentication-and-authorization  # Too long
feat-ua                     # Too cryptic
feature_user_auth_system_v2 # Mixing conventions
```

### Convention 3: Semantic Descriptions

Worktree names should communicate:

1. **What**: What is this work about?
   ```
   feature-email-notifications  # About sending emails
   ```

2. **Why**: Why is this work being done?
   ```
   spike-caching-layer          # Investigating caching approach
   hotfix-memory-leak           # Fixing specific issue
   ```

3. **Scope**: How much does it change?
   ```
   feature-auth               # Substantial change (auth system)
   refactor-models            # Medium change (refactor models)
   doc-api                    # Smaller change (documentation)
   ```

## Directory Organization

### Recommended Structure

```
.worktrees/                                  # Root directory
│
├── reviews/                                # PR reviews (short-lived)
│   ├── pr-456/                            # PR #456 review
│   ├── pr-457/                            # PR #457 review
│   └── pr-458/
│
├── features/                               # Feature branches (medium-lived)
│   ├── feature-user-auth/
│   ├── feature-payments/
│   └── feature-dark-mode/
│
├── refactors/                              # Refactoring work
│   ├── refactor-database/
│   └── refactor-api-layer/
│
├── spikes/                                 # Experiments/investigations
│   ├── spike-caching/
│   ├── spike-architecture/
│   └── spike-performance/
│
└── hotfixes/                               # Production hotfixes
    ├── hotfix-bug-123/
    └── hotfix-deployment-issue/
```

**Flattened Alternative** (for small projects):
```
.worktrees/
├── pr-456/
├── feature-user-auth/
├── feature-payments/
├── spike-cache/
├── refactor-db/
└── hotfix-bug-123/
```

### Why This Organization

✓ **Quick scanning** - Know work type by directory
✓ **Natural grouping** - Similar work together
✓ **Lifecycle clarity** - Reviews separate from long-term work
✓ **Cleanup patterns** - Easy to identify and remove old work
✓ **Team clarity** - Everyone knows where things go

## Workflow Patterns

### Pattern 1: PR Review Workflow

**Scenario**: Review incoming pull requests

**Naming**:
```
.worktrees/reviews/pr-{number}/
```

**Lifetime**: Short (hours to days)

**Cleanup**: Remove immediately after review

**Example**:
```bash
# Create
git worktree add-pr 456

# Review and provide feedback

# Remove
git worktree remove .worktrees/reviews/pr-456
```

### Pattern 2: Feature Development Workflow

**Scenario**: Build new features

**Naming**:
```
.worktrees/feature-{description}/
```

**Lifetime**: Medium (days to weeks)

**Cleanup**: Remove after merge to main

**Example**:
```bash
# Create
./scripts/create-worktree.sh feature "user authentication"
# Creates: .worktrees/feature-user-authentication

# Develop
cd .worktrees/feature-user-authentication
git commit -m "Add login form"
git push -u origin feature/user-authentication

# Merge to main (via PR)
# Remove after merge
git worktree remove .worktrees/feature-user-authentication
```

### Pattern 3: Experiment/Spike Workflow

**Scenario**: Investigate solutions before committing

**Naming**:
```
.worktrees/spike-{investigation}/
```

**Lifetime**: Short to medium (hours to days)

**Cleanup**: Remove after decision (merge winner, discard loser)

**Example**:
```bash
# Experiment with caching layer
./scripts/create-worktree.sh spike "caching-layer"

# Compare with redis approach
./scripts/create-worktree.sh spike "redis-integration"

# After testing, keep winner
git merge spike/caching-layer
git worktree remove .worktrees/spike-redis-integration

# Remove spike worktrees
git worktree remove .worktrees/spike-caching-layer
```

### Pattern 4: Refactoring Workflow

**Scenario**: Large refactoring that takes sustained effort

**Naming**:
```
.worktrees/refactor-{component}/
```

**Lifetime**: Medium to long (weeks to months)

**Cleanup**: Remove after merge

**Example**:
```bash
# Large database layer refactoring
./scripts/create-worktree.sh feature "refactor-database"

# Intensive work over weeks
cd .worktrees/refactor-database
# ... many commits ...

# Merge when ready
git push origin feature/refactor-database
# ... code review ...
# ... merge ...

# Cleanup
git worktree remove .worktrees/refactor-database
```

### Pattern 5: Parallel Development Workflow

**Scenario**: Multiple team members work on different features

**Naming**: Consistent patterns allow parallelization

**Example**:
```bash
# Team member 1
./scripts/create-worktree.sh feature "authentication"

# Team member 2 (simultaneously, no conflicts!)
./scripts/create-worktree.sh feature "payments"

# Team member 3
./scripts/create-worktree.sh spike "performance"

# All work in isolation
# No branch contamination
# Easy merge when ready
```

## Team Conventions Guide

### Starting a New Team

**Establish these conventions:**

```markdown
# Our Worktree Standards

## Naming
- feature-* for feature branches
- spike-* for experiments
- hotfix-* for production fixes
- reviews/pr-* for PR reviews

## Location
All worktrees in .worktrees/ directory

## Cleanup
- Remove PR reviews after merge
- Remove features after merge
- Remove spikes after decision
- Weekly cleanup: git worktree prune

## Documentation
For complex work, add README.md to worktree

## Conventions
- Always create from main
- Descriptive branch names
- Commit messages reference ticket numbers
```

### Enforcing Standards

```bash
# Pre-commit hook to prevent worktree commits
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
git_root=$(git rev-parse --show-toplevel)
current_path=$(pwd)

if [[ "$current_path" == "$git_root/.worktrees"* ]]; then
    echo "Error: Cannot commit from worktree"
    echo "Switch to main branch to commit"
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

## Integration with Compounding Engineering

### How Worktrees Compound Work

1. **Each feature starts in isolation**
   - No branch conflicts
   - Clean separation of concerns
   - Enables parallel work

2. **Work compounds when merged**
   - Clean commits tell story
   - Easy review of changes
   - Simple rollback if needed

3. **Cleanup makes future work easier**
   - Repository stays lean
   - Fewer worktrees = faster operations
   - Clear intent for active work

4. **Consistent naming helps team**
   - Everyone knows where to look
   - New team members understand structure
   - Reduced cognitive load

### Integration with Commands

**`/work` command**:
```bash
claude /work "Build authentication system"
# Automatically:
# 1. Uses git-worktree-create skill
# 2. Names worktree: feature-build-authentication-system
# 3. Follows naming convention
# 4. Sets up environment for compounding engineering workflow
```

**`/review` command**:
```bash
claude /review 456
# Automatically:
# 1. Uses git-worktree-create skill
# 2. Names worktree: reviews/pr-456
# 3. Creates isolated review environment
# 4. Follows cleanup patterns
```

## Migration Guide

### Moving From No Worktrees

**Current state**: Everything on main branch

**Steps**:
1. Learn worktree basics (git-worktree-create skill)
2. Try one feature in worktree
3. Practice cleanup (git-worktree-manage skill)
4. Establish team conventions
5. Migrate team to worktree workflow

### Moving to Strict Conventions

**Current state**: Messy worktree naming

**Steps**:
1. Document current state
   ```bash
   git worktree list > worktrees-before.txt
   ```

2. Create migration plan
   ```bash
   # Remove old worktrees
   git worktree remove old-work-1
   git worktree remove old-work-2
   ```

3. Establish new conventions
4. Create setup guide for team
5. Use hooks to enforce (optional)

## Common Questions

### Q: How many worktrees is too many?

**A**: Generally < 10 is healthy. If you have 20+:
- Do cleanup pass
- Merge completed work
- Remove stale spikes
- Keep only active work

```bash
# Count worktrees
git worktree list | wc -l

# If too many, cleanup
git worktree list
# Identify old work
git worktree remove old-work
git worktree prune
```

### Q: Should we use subdirectories (reviews/) or not?

**A**: Depends on scale:
- **Small teams (< 5 people)**: Flat structure OK
- **Medium teams (5-20)**: Use categories (reviews/, features/, etc.)
- **Large teams (> 20)**: Organized by team + category

### Q: How do we handle long-running features?

**A**: Same as any feature, but:
- Keep main branch current: `git merge origin/main`
- Or rebase occasionally: `git rebase origin/main`
- Communicate timeline to team
- Document progress in README.md

### Q: What if someone deletes a worktree accidentally?

**A**: Recovery depends on commits:
- If commits pushed: recover from remote branch
- If unpushed: check git reflog
- Worst case: recreate from branch history

```bash
# Recover from reflog
git reflog
git worktree add .worktrees/recovered [COMMIT_SHA]
```

### Q: Should feature names match branch names?

**A**: Yes! Makes things consistent:
```bash
# Worktree: .worktrees/feature-auth
# Branch: feature/auth
# Matches the prefix exactly
```

## Best Practices Summary

| Practice | Why | How |
|----------|-----|-----|
| **Semantic names** | Communicate intent | feature-auth, spike-cache, hotfix-bug |
| **Purpose prefixes** | Quick identification | reviews/pr-, feature-, spike-, etc. |
| **Consistent organization** | Team clarity | Subdirectories by type or flat |
| **Regular cleanup** | Repository health | Weekly: git worktree prune |
| **Document complex work** | Knowledge sharing | Add README.md to worktree |
| **Commit before remove** | Prevent data loss | Verify clean status first |
| **Create from main** | Stay current | Always base on main branch |
| **Parallel safely** | Team productivity | Different worktrees, no conflicts |

## Troubleshooting Guidelines

### Problem: Inconsistent naming

```bash
# Bad state:
.worktrees/
├── feature1
├── new_feature
├── my-feature-work
└── f-auth

# Solution: Establish convention, rename incrementally
```

### Problem: Worktrees growing too old

```bash
# Check age of worktrees
git worktree list

# If any 30+ days old, investigate
# Likely merged or abandoned
```

### Problem: Team doesn't follow standards

```bash
# Solution: Document conventions
# Make guide visible to team
# Use pre-commit hooks to enforce
# Discuss in team meetings
```

## Resources

- **Git worktree documentation**: https://git-scm.com/docs/git-worktree
- **Related skills**:
  - git-worktree-create: How to create worktrees
  - git-worktree-manage: How to manage worktrees
- **Compounding engineering philosophy**: Each unit makes the next easier

## See Also

- `/work` command - Uses these practices
- `/review` command - Uses these practices
- git-worktree-create skill - Implementation details
- git-worktree-manage skill - Lifecycle operations
