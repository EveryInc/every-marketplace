# Git Worktree Creation Skill

## Overview

Creates isolated git worktrees for PR reviews, feature development, experiments, or other development work. This skill encapsulates worktree best practices and automation, making it easy to set up clean, isolated development environments.

### Official Documentation

- **Git Worktree Reference**: https://git-scm.com/docs/git-worktree
- **Git Book - Git Tools**: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging

### Important Notice

⚠️ Git worktrees are still considered **experimental** according to official Git documentation, particularly when used with submodules. For most single-repository workflows (like the patterns in this skill), they are stable and production-ready.

## When to Use This Skill

- **PR Review Workflows**: Setting up `/review` command worktrees
- **Feature Development**: Creating `/work` command worktrees
- **Experiment/Spikes**: Establishing temporary isolated environments
- **Parallel Development**: Working on multiple features simultaneously
- **Clean Isolation**: Ensuring no branch contamination between work contexts

## Key Concepts

### Worktree Locations

All worktrees are created under `$git_root/.worktrees/` directory:

```
$git_root/
├── .worktrees/           # All worktrees live here
│   ├── reviews/          # PR review worktrees
│   │   ├── pr-123/
│   │   ├── pr-124/
│   │   └── ...
│   ├── feature-auth/     # Feature branch worktrees
│   ├── feature-payments/ # Feature branch worktrees
│   ├── spike-cache/      # Experiment/spike worktrees
│   └── ...
├── .gitignore            # Must include .worktrees entry
└── ...
```

### Benefits of This Pattern

1. **Centralized Location** - All worktrees in one place (easy to find)
2. **Semantic Organization** - Subdirectories indicate purpose (reviews/, features, spikes/)
3. **Easy Cleanup** - Remove entire `.worktrees/` dir during housekeeping
4. **Git Friendly** - Single `.gitignore` entry covers all
5. **Clear Intent** - Directory structure shows what work is happening

## Git Worktree Fundamentals

Git worktrees let you work on multiple branches simultaneously by creating separate working directories that share the same repository. Each worktree is a full checkout with its own branch, HEAD, and index, but shares objects and configuration with the main repository.

**Why this matters for creation:** Understanding that worktrees share the underlying repository helps you choose optimal locations (prefer sibling directories to main worktree) and avoid resource conflicts.

See [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) for complete fundamentals.

## Worktree Patterns

### Pattern 1: PR Reviews

**Use Case**: Reviewing pull requests with the `/review` command

**Directory Structure**:
```
.worktrees/reviews/pr-{pr_number}/
```

**Example**:
```
.worktrees/reviews/pr-123/
```

**Branch**: Automatically checks out PR source branch via `gh pr checkout`

**Isolation**: Complete separation from main development

**Cleanup**: Remove after review is complete

### Pattern 2: Feature Development

**Use Case**: Building features with the `/work` command

**Directory Structure**:
```
.worktrees/{descriptive-feature-name}/
```

**Examples**:
```
.worktrees/feature-user-auth/
.worktrees/feature-payment-processing/
.worktrees/feature-dark-mode/
```

**Branch**: New feature branch created from main

**Isolation**: Allows parallel work on multiple features

**Cleanup**: Remove after feature is merged

### Pattern 3: Experiments/Spikes

**Use Case**: Exploring new approaches or investigating solutions

**Directory Structure**:
```
.worktrees/spike-{experiment-name}/
```

**Examples**:
```
.worktrees/spike-caching-layer/
.worktrees/spike-migration-strategy/
```

**Branch**: Temporary branch for investigation

**Isolation**: Keeps experiments isolated from production work

**Cleanup**: Remove when investigation is complete or merged

## Step-by-Step Process

### 1. Verify Repository State

```bash
# Ensure you're in the repository root
git_root=$(git rev-parse --show-toplevel)
cd "$git_root"

# Update main branch
git checkout main
git pull origin main
```

### 2. Create Worktrees Directory

```bash
# Create .worktrees directory if it doesn't exist
mkdir -p "$git_root/.worktrees"

# Add to .gitignore if not already there
if ! grep -q "^\.worktrees$" "$git_root/.gitignore"; then
  echo ".worktrees" >> "$git_root/.gitignore"
  git add .gitignore
  git commit -m "Add .worktrees to .gitignore"
fi
```

### 3. Create Worktree for Specific Purpose

#### For PR Reviews

```bash
pr_number=123
worktree_name="reviews/pr-$pr_number"
worktree_path="$git_root/.worktrees/$worktree_name"

# Create worktree directory
mkdir -p "$(dirname "$worktree_path")"

# Checkout PR branch into worktree using gh CLI
gh pr checkout "$pr_number" --repo "$(git config --get remote.origin.url)" --worktree "$worktree_path"

# Verify it worked
cd "$worktree_path"
git branch -vv
```

#### For Feature Development

```bash
feature_name="user-authentication"
worktree_name="feature-$feature_name"
worktree_path="$git_root/.worktrees/$worktree_name"

# Create worktree with new branch
git worktree add -b "feature/$feature_name" "$worktree_path" main

# Verify
cd "$worktree_path"
git branch -vv
# Expected: * feature/user-authentication upstream/main
```

#### For Experiments/Spikes

```bash
spike_name="caching-optimization"
worktree_name="spike-$spike_name"
worktree_path="$git_root/.worktrees/$worktree_name"

# Create worktree with spike branch
git worktree add -b "spike/$spike_name" "$worktree_path" main

# Verify
cd "$worktree_path"
git branch -vv
```

### 4. Verify Worktree Setup

```bash
# List worktrees
git worktree list

# Verify you're in the correct worktree
pwd
# Should show: /full/path/to/.worktrees/[category]/[name]

# Verify correct branch
git branch -vv
# Should show: * [appropriate-branch]

# Verify no uncommitted changes
git status
# Should show: working tree clean
```

### 5. Environment Configuration

After worktree creation:

```bash
# Install dependencies if needed
npm install
# or
bundle install
# or
pip install -r requirements.txt

# Run initial tests to verify clean state
npm test
# or
bundle exec rspec
# or
pytest
```

## Automation Script

A `create-worktree.sh` script is provided for automated worktree creation:

```bash
# View the script
cat scripts/create-worktree.sh

# Make it executable
chmod +x scripts/create-worktree.sh

# Usage
./scripts/create-worktree.sh [type] [name] [branch]

# Examples
./scripts/create-worktree.sh review 123
./scripts/create-worktree.sh feature user-auth
./scripts/create-worktree.sh spike caching-layer
```

See the [Worktree Patterns](#worktree-patterns) section above for detailed usage examples.

## Advanced Worktree Options

Based on [official git-worktree documentation](https://git-scm.com/docs/git-worktree), here are advanced options you might need:

### Detached HEAD Worktrees

For experimental changes you don't want to create a branch for:

```bash
# Create worktree at specific commit without branch
git worktree add --detach .worktrees/experiment-abc123 abc123

# Useful for testing old commits or one-off experiments
cd .worktrees/experiment-abc123
# Make changes, test
# When done, just remove - no branch to cleanup
```

### Orphan Branch Worktrees

For completely separate histories (documentation sites, etc.):

```bash
# Create worktree with orphan branch (no history)
git worktree add --orphan .worktrees/docs-site

# Useful for gh-pages branches or isolated documentation
```

### Lock Worktrees

For worktrees on removable drives or network shares:

```bash
# Lock to prevent pruning when drive unmounted
git worktree add .worktrees/feature-x
git worktree lock .worktrees/feature-x --reason "On external drive"

# Unlock when done
git worktree unlock .worktrees/feature-x
```

### Remove Worktrees Safely

⚠️ **WARNING**: Always verify before removing a worktree:

```bash
# SAFE: Check what you're removing first
cd .worktrees/feature-name
git status                              # Verify no uncommitted changes
git log --oneline -5 origin/[branch]..HEAD  # Verify all changes are pushed

# SAFE: Then remove
cd ../..
git worktree remove .worktrees/feature-name

# UNSAFE: Do NOT use --force flag unless you understand the consequences
# --force will remove even if worktree has uncommitted changes
git worktree remove --force .worktrees/feature-name  # ONLY if you're sure!
```

### Repair Moved Worktrees

If you manually move a worktree directory:

```bash
# After moving .worktrees/feature-x to different path
git worktree repair .worktrees/feature-x

# Or repair all worktrees
git worktree repair
```

### No Checkout Mode

For sparse checkout or custom index operations:

```bash
# Create worktree without checking out files
git worktree add --no-checkout .worktrees/sparse-work

# Then configure sparse-checkout
cd .worktrees/sparse-work
git sparse-checkout init --cone
git sparse-checkout set src/specific/directory
```

## Common Workflows

### Workflow 1: Quick PR Review

```bash
# 1. Invoke skill to create PR review worktree
claude "Create worktree for PR 123 review"
# Skill auto-invokes and creates .worktrees/reviews/pr-123

# 2. Use /review command (uses skill internally)
claude /review 123
# Automatically uses worktree created by skill

# 3. After review, cleanup
git worktree remove .worktrees/reviews/pr-123
```

### Workflow 2: Feature Development

```bash
# 1. Create feature worktree
claude /work "Add user authentication"
# Skill creates .worktrees/feature-user-auth

# 2. Work in the worktree
cd .worktrees/feature-user-auth
git status
# You're now isolated in feature-user-auth branch

# 3. Commit and push
git add .
git commit -m "Add authentication flow"
git push -u origin feature/user-auth

# 4. After merge, cleanup
cd ../..
git worktree remove .worktrees/feature-user-auth
```

### Workflow 3: Parallel Development

```bash
# Create multiple feature worktrees simultaneously
claude /work "Add user authentication"
# Creates .worktrees/feature-user-auth

# In another terminal
claude /work "Setup payment processing"
# Creates .worktrees/feature-payment-processing

# Work independently in each
cd .worktrees/feature-user-auth
# ... work on auth ...

# In another terminal
cd .worktrees/feature-payment-processing
# ... work on payments independently ...

# Both can commit and push independently
```

## Troubleshooting

For common issues with worktrees (already exists, branch checkout problems, corrupted worktrees, etc.), see the [Troubleshooting section in git-worktree-manage skill](./git-worktree-manage/SKILL.md#troubleshooting).

## Best Practices

### 1. Always Create From Main

```bash
# GOOD
git worktree add -b feature/name .worktrees/feature-name main

# BAD - might not have latest code
git worktree add -b feature/name .worktrees/feature-name
```

### 2. Use Descriptive Names

```bash
# GOOD
.worktrees/feature-user-authentication
.worktrees/spike-performance-optimization

# BAD
.worktrees/feature-1
.worktrees/work
```

### 3. Keep Worktrees Current

```bash
# Before important work, update from main
cd .worktrees/feature-name
git fetch origin
git rebase origin/main

# Or for long-running features
git merge origin/main
```

### 4. Clean Up After Use

```bash
# After feature is merged or review is complete
git worktree remove .worktrees/feature-name

# For stale worktrees
git worktree prune

# Nuclear option (careful!)
rm -rf .worktrees/*
```

### 5. Document Worktree Purpose

```bash
# Optional: Create README in worktree
echo "Feature branch for user authentication flow" > .worktrees/feature-user-auth/README.md

# Then commit
cd .worktrees/feature-user-auth
git add README.md
git commit -m "Add worktree documentation"
```

## Integration with Commands

### `/work` Command

The `/work` command uses this skill automatically:

```bash
claude /work "Build payment processing system"
# Internally:
# 1. Invokes git-worktree-create skill
# 2. Creates .worktrees/feature-payment-processing
# 3. Sets up environment
# 4. Creates task breakdown
# 5. Starts work execution
```

### `/review` Command

The `/review` command uses this skill automatically:

```bash
claude /review 456
# Internally:
# 1. Invokes git-worktree-create skill
# 2. Creates .worktrees/reviews/pr-456
# 3. Checks out PR branch
# 4. Runs analysis in worktree
# 5. Reports findings
```

## Limitations and Warnings

### From Official Git Documentation

⚠️ **Experimental Status**: Multiple checkout support is still experimental, particularly:
- Submodule support is incomplete
- Multiple checkouts of superprojects are unsupported
- Some edge cases may have unexpected behavior

⚠️ **Branch Checkout Restrictions**:
- A branch cannot be checked out in multiple worktrees simultaneously
- Attempting to do so will fail with an error
- Use different branches or detached HEAD if you need same codebase in multiple places

⚠️ **Performance Considerations**:
- Many worktrees (20+) can slow down some Git operations
- Each worktree consumes disk space for working files
- Clean up old worktrees regularly for best performance

### Best Practices to Avoid Issues

✓ Keep worktree count reasonable (< 10 active worktrees)
✓ Use `git worktree prune` regularly to clean stale references
✓ Always use `git worktree remove` instead of manual deletion
✓ If you must move worktrees, use `git worktree repair` after
✓ Avoid worktrees with submodules unless necessary (incomplete support)

## Related Skills

- **git-worktree-manage** - Lists, switches, and removes worktrees
- **git-worktree-best-practices** - Naming conventions and workflow patterns

## Related Commands

- `/work` - Uses this skill for feature development
- `/review` - Uses this skill for PR reviews

## Official Resources

### Git Documentation
- **git worktree man page**: `man git-worktree` or https://git-scm.com/docs/git-worktree
- **Git reference**: https://git-scm.com/docs
- **Git Book**: https://git-scm.com/book

### Community Guides
- [Practical Guide to Git Worktree (DEV.to)](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)
- [Git Worktree Best Practices (GitHub Gist)](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc)
- [Mastering Git Worktree (Medium)](https://mskadu.medium.com/mastering-git-worktree-a-developers-guide-to-multiple-working-directories-c30f834f79a5)

