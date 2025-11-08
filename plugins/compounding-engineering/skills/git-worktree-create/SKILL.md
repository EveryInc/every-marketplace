# Git Worktree Creation Skill

## Overview

Creates isolated git worktrees for PR reviews, feature development, experiments, or other development work. This skill encapsulates worktree best practices and automation, making it easy to set up clean, isolated development environments.

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

See `examples/basic-usage.md` for detailed examples.

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

### Issue: "worktree already exists"

```bash
# Solution: Check what's in .worktrees
ls -la .worktrees/

# If corrupted, force remove
git worktree remove --force .worktrees/[name]
rm -rf .worktrees/[name]

# Then create new one
```

### Issue: "Cannot checkout branch - already exists"

```bash
# Solution: Check main for existing branches
git branch -a

# If branch exists locally, use it
git worktree add .worktrees/feature-name feature-name

# If branch doesn't exist, create it fresh
git worktree add -b feature/new-name .worktrees/feature-new-name main
```

### Issue: "Worktree location is a relative path"

```bash
# Solution: Always use absolute paths
git_root=$(git rev-parse --show-toplevel)
worktree_path="$git_root/.worktrees/feature-name"

git worktree add -b feature/name "$worktree_path" main
# NOT relative path
```

### Issue: ".gitignore not updated"

```bash
# Solution: Manually add entry
echo ".worktrees" >> .gitignore
git add .gitignore
git commit -m "Add .worktrees to .gitignore"
```

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

## Related Skills

- **git-worktree-manage** - Lists, switches, and removes worktrees
- **git-worktree-best-practices** - Naming conventions and workflow patterns

## See Also

- `git worktree` man page: `man git-worktree`
- Git documentation: https://git-scm.com/docs/git-worktree
- Related commands: `/work`, `/review`
