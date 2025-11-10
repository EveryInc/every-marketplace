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

## Official Git Guidance

The practices in this skill align with guidance from:
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Git Best Practices](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)
- Community resources from experienced Git users

### Key Official Recommendations

From the Git documentation:

1. **Use for parallel work**: Worktrees excel at allowing simultaneous work on different branches
2. **Clean up promptly**: Remove worktrees when done to maintain repository health
3. **Understand limitations**: Worktrees are experimental, especially with submodules
4. **Lock when portable**: Use `git worktree lock` for worktrees on removable media

### Community Best Practices

From [GitHub Gist on Worktree Best Practices](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc):

- **One purpose per worktree**: Create worktrees for specific purposes, not individual tasks
- **Consistent naming**: Adopt clear naming conventions for quick identification
- **Regular maintenance**: Prune and clean up weekly to prevent accumulation
- **CI/CD optimization**: Use worktrees to avoid multiple clones in build pipelines

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

## Conventional Commits for Worktrees

When working in worktrees, use **conventional commit messages** to create semantic, meaningful commits that communicate intent clearly. This practice is especially important in isolated worktree environments where commits may be reviewed separately.

### Format

```
type(scope): subject

[optional body]

[optional footers]
```

### Commit Types

| Type | Purpose | Examples |
|------|---------|----------|
| `feat` | New feature or capability | Adding login, implementing payment processing |
| `fix` | Bug fix | Resolving null reference, fixing timeout |
| `docs` | Documentation changes only | Updating README, adding API docs |
| `refactor` | Code refactoring (no behavior change) | Extracting utility, reorganizing structure |
| `perf` | Performance improvements | Optimizing query, caching data |
| `test` | Adding/updating tests | New unit tests, integration tests |
| `chore` | Maintenance tasks | Dependency updates, build config |
| `wip` | Work in progress | Temporary checkpoints (will be squashed) |

### Scope Examples for Worktrees

Scopes help identify the area of change:

- **Features**: `feat(auth)`, `feat(api)`, `feat(ui)`, `feat(db)`
- **Components**: `fix(login)`, `refactor(payment)`, `perf(cache)`
- **Infrastructure**: `chore(deps)`, `ci(build)`, `test(e2e)`
- **Worktree-specific**: `docs(worktree)`, `chore(setup)`

### Examples

**Simple commits:**
```bash
# Feature development
git commit -m "feat(auth): add login form validation"

# Bug fixes
git commit -m "fix(api): resolve connection timeout"

# Documentation
git commit -m "docs(api): update endpoint documentation"

# Setup tasks
git commit -m "chore(setup): add .worktrees to .gitignore"

# Performance improvements
git commit -m "perf(db): optimize query with indexing"
```

**Multi-line commits with body:**
```bash
git commit -m "feat(auth): add two-factor authentication

- Implement TOTP-based verification
- Store secrets securely using encryption
- Add recovery code generation

This improves security for user accounts.

Closes #345
Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Work in progress:**
```bash
# Temporary checkpoint commits that will be squashed
git commit -m "wip(feature): checkpoint before context switch"
```

**Breaking changes:**
```bash
git commit -m "refactor(api)!: remove deprecated authentication endpoint

BREAKING CHANGE: The /v1/auth endpoint is no longer available.
Users must migrate to /v2/auth before the next release.

See migration guide: docs/migration-v1-to-v2.md

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Best Practices for Worktree Commits

1. **Use descriptive scopes** - Helps identify work area at a glance
2. **Keep subjects under 50 characters** - Ensures readability in logs and GUIs
3. **Use imperative mood** - "add feature" not "added feature"
4. **One logical change per commit** - Atomic commits are easier to review and revert
5. **Use `wip()` type for checkpoints** - Makes it clear these will be squashed
6. **Include Claude Code footer** - For AI-assisted work:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

### Integration with Worktree Cleanup

Before removing a worktree, verify commits follow conventional format:

```bash
# Check commits in worktree vs main
git log --oneline origin/main..HEAD

# Each should follow: type(scope): description
# Examples: feat(auth): add login, fix(api): resolve timeout

# Squash WIP commits before merge
git rebase -i origin/main
# Mark WIP commits as 'squash' or 'fixup'
```

### References

For more detailed conventional commits specification, see:
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/) - Related to conventional commits
- See also [Commit Message Best Practices in git-worktree-create](./git-worktree-create/SKILL.md#commit-message-best-practices)

## Workflow Patterns

### Pattern 1: Emergency Hotfix Management

**Scenario**: Production bug needs immediate fix while you have uncommitted feature work

From the [official Git worktree docs](https://git-scm.com/docs/git-worktree):

```bash
# Current state: working on new feature with uncommitted changes
git status
# On branch feature/new-feature
# Changes not staged for commit:
#   modified: src/feature.js

# Emergency: production bug reported!
# Create temporary worktree for hotfix
git worktree add -b hotfix/critical-bug ../hotfix main

# Move to hotfix worktree
cd ../hotfix

# Fix the bug
vim src/buggy-code.js
git add src/buggy-code.js
git commit -m "Fix critical production bug"

# Push and deploy
git push origin hotfix/critical-bug
# (create PR, merge, deploy)

# Return to feature work
cd -  # back to original worktree

# Your feature work is exactly as you left it
git status
# On branch feature/new-feature
# Changes not staged for commit:
#   modified: src/feature.js (still there!)

# Clean up hotfix worktree after merge
git worktree remove ../hotfix
git branch -d hotfix/critical-bug
```

**Why this works better than `git stash`:**
- No need to stash/unstash (can forget what you stashed)
- Both contexts remain active (can switch back and forth)
- No risk of stash conflicts
- Can test both simultaneously

### Pattern 2: Feature Development Workflow

**Scenario**: Build new features in isolation

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

### Pattern 3: PR Review Without Context Switching

**Scenario**: Review pull requests while keeping current work intact

**Naming**:
```
.worktrees/reviews/pr-{number}/
```

**Lifetime**: Short (hours to days)

**Example**:
```bash
# Create dedicated review worktree
./scripts/create-worktree.sh review 456
cd .worktrees/reviews/pr-456

# Review and provide feedback
# ... examine code, add comments ...

# Your feature work is preserved in main worktree
cd /path/to/repo
./scripts/create-worktree.sh feature my-work
cd .worktrees/feature-my-work
# ... continue your work, uninterrupted ...

# Return to finish review
cd /path/to/repo/.worktrees/reviews/pr-456
# Exactly where you left off, no branch switching!

# Clean up when done
cd /path/to/repo
git worktree remove .worktrees/reviews/pr-456
```

**Benefits:**
- Review context preserved between sessions
- No branch switching interrupts your flow
- Can pause/resume review easily
- Multiple reviews can be active simultaneously

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

## Troubleshooting

For common issues with worktrees (already exists, uncommitted changes, prunable entries, performance), see the [Troubleshooting section in git-worktree-manage skill](./git-worktree-manage/SKILL.md#troubleshooting).

## Official Resources

### Git Documentation
- **git worktree man page**: `man git-worktree` or https://git-scm.com/docs/git-worktree
- **Git reference**: https://git-scm.com/docs
- **Git Book**: https://git-scm.com/book

### Community Guides
- [Practical Guide to Git Worktree (DEV.to)](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)
- [Git Worktree Best Practices (GitHub Gist)](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc)
- [Mastering Git Worktree (Medium)](https://mskadu.medium.com/mastering-git-worktree-a-developers-guide-to-multiple-working-directories-c30f834f79a5)

### Related Skills
- **git-worktree-create**: How to create worktrees
- **git-worktree-manage**: How to manage worktrees

### Related Commands
- `/work` - Uses these practices
- `/compounding-engineering:review` - Uses these practices

## Compounding Engineering Philosophy

Each unit of engineering work should make subsequent units easier—not harder. Applied to worktrees:
- Consistent naming makes finding work easier
- Organized structure prevents future confusion
- Regular cleanup maintains repository performance
- Clear conventions reduce team decision-making
