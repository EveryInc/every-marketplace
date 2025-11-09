# Git Worktree Skills

Model-invoked skills for git worktree management in the compounding engineering plugin.

## Skills Overview

### git-worktree-create

Creates isolated git worktrees for PRs, features, or experiments.

**Auto-invoked when:**
- Setting up PR reviews
- Creating feature branches
- Establishing isolated environments
- Starting new development work

**What it does:**
- Creates worktree directory structure at `$git_root/.worktrees/`
- Handles branch creation and naming conventions
- Updates `.gitignore` with `.worktrees` entry
- Verifies setup and environment
- Guides conventional commit message best practices

**Key features:**
- Commit Message Best Practices section with type and scope guidance
- Examples of conventional commits (feat, fix, docs, etc.)
- Integration with Claude Code footer for AI-assisted commits

### git-worktree-manage

Manages worktree lifecycle: list, switch, cleanup.

**Auto-invoked when:**
- Navigating between worktrees
- Cleaning up old worktrees
- Checking worktree status
- Listing active development environments
- Verifying commit quality before removal

**What it does:**
- Lists all active worktrees with details
- Removes completed or abandoned worktrees
- Prunes stale worktree references
- Provides worktree status information
- Guides verification of conventional commit format before cleanup

**Key features:**
- Commit verification workflow (conventional format check)
- Cross-reference to best-practices for commit message standards
- Examples of proper commit cleanup before merge

### git-worktree-best-practices

Provides naming conventions, commit message standards, and patterns for git worktree workflows.

**Auto-invoked when:**
- Planning worktree workflows
- Establishing team conventions
- Organizing repository structure
- Troubleshooting worktree issues
- Implementing conventional commit practices

**What it does:**
- Documents naming conventions for PRs, features, experiments
- Provides organizational patterns
- Guides workflow setup
- Answers worktree questions
- Teaches conventional commit message standards
- Provides 20+ real-world commit message examples

**Key features:**
- Comprehensive "Conventional Commits for Worktrees" section
- Type reference table (feat, fix, docs, refactor, perf, test, chore, wip)
- Scope examples specific to worktree work
- Multi-line and breaking change commit examples
- Integration with worktree cleanup procedures
- COMMIT_TEMPLATE.txt for git configuration
- COMMIT_EXAMPLES.md with 20+ realistic examples

## Integration with Commands

These skills are automatically used by:

- **`/compounding-engineering:work`** - Creates feature worktrees using git-worktree-create
- **`/compounding-engineering:review`** - Creates PR review worktrees using git-worktree-create
- Custom workflows and agents needing isolation

## Directory Structure

```
skills/
├── README.md                          # This file
├── git-worktree-create/
│   ├── SKILL.md                       # Skill definition and documentation
│   ├── scripts/
│   │   └── create-worktree.sh         # Automation script
│   └── examples/
│       └── basic-usage.md             # Usage examples (with conventional commits)
├── git-worktree-manage/
│   └── SKILL.md                       # Skill definition
└── git-worktree-best-practices/
    ├── SKILL.md                       # Skill definition
    ├── COMMIT_TEMPLATE.txt            # Git commit message template
    └── COMMIT_EXAMPLES.md             # 20+ conventional commit examples
```

## Key Learnings

These skills extract common patterns from commands (especially `/work` and `/review`) to make them reusable across agents, commands, and other workflows. This follows the compounding engineering philosophy—each skill makes subsequent units of work easier.

**Benefits:**
1. **Single source of truth** - Worktree logic defined once
2. **Auto-invocation** - Claude automatically uses skills when relevant
3. **Reusability** - Multiple commands share same patterns
4. **Maintainability** - Updates in one place affect all users
5. **Discoverability** - Skills can be listed and documented separately
