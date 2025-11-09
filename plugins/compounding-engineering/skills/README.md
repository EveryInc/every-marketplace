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

### git-worktree-manage

Manages worktree lifecycle: list, switch, cleanup.

**Auto-invoked when:**
- Navigating between worktrees
- Cleaning up old worktrees
- Checking worktree status
- Listing active development environments

**What it does:**
- Lists all active worktrees with details
- Removes completed or abandoned worktrees
- Prunes stale worktree references
- Provides worktree status information

### git-worktree-best-practices

Provides naming conventions and patterns for git worktree workflows.

**Auto-invoked when:**
- Planning worktree workflows
- Establishing team conventions
- Organizing repository structure
- Troubleshooting worktree issues

**What it does:**
- Documents naming conventions for PRs, features, experiments
- Provides organizational patterns
- Guides workflow setup
- Answers worktree questions

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
│       └── basic-usage.md             # Usage examples
├── git-worktree-manage/
│   └── SKILL.md                       # Skill definition
└── git-worktree-best-practices/
    └── SKILL.md                       # Skill definition
```

## Learning Resources

### Git Worktree Documentation
The git-worktree-skills include comprehensive documentation and examples:

- **Skills**: `skills/git-worktree-*/SKILL.md` - Full skill documentation
- **Examples**: `skills/git-worktree-create/examples/` - Practical examples
- **Resources**: `skills/git-worktree-create/RESOURCES.md` - Curated external references
- **Script**: `skills/git-worktree-create/scripts/create-worktree.sh` - Automation tool

### External Resources
- [Official Git Worktree Docs](https://git-scm.com/docs/git-worktree)
- [Git Worktree Best Practices (GitHub Gist)](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc)
- [Practical Guide to Git Worktree (DEV.to)](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)

## Key Learnings

These skills extract common patterns from commands (especially `/work` and `/review`) to make them reusable across agents, commands, and other workflows. This follows the compounding engineering philosophy—each skill makes subsequent units of work easier.

**Benefits:**
1. **Single source of truth** - Worktree logic defined once
2. **Auto-invocation** - Claude automatically uses skills when relevant
3. **Reusability** - Multiple commands share same patterns
4. **Maintainability** - Updates in one place affect all users
5. **Discoverability** - Skills can be listed and documented separately
