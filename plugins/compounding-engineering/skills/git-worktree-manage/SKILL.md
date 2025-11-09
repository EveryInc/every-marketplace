# Git Worktree Management Skill

## Overview

Manages the complete lifecycle of git worktrees: listing active worktrees, inspecting their status, switching between them, and cleaning up completed or abandoned work. This skill provides the operations needed to maintain a healthy worktree environment.

### Official Documentation

- **Git Worktree Management**: https://git-scm.com/docs/git-worktree
- **List Command**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-listltoptionsgt
- **Remove Command**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-removeltworktreegt
- **Prune Command**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-pruneltoptionsgt
- **Lock/Unlock**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-lockltoptionsgt
- **Repair Command**: https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-repairltpathgt

## When to Use This Skill

- **View Active Work**: See all current worktrees and their status
- **Navigate Between Worktrees**: Switch between different development contexts
- **Clean Up Completed Work**: Remove worktrees after merging features or completing reviews
- **Maintain Repository**: Prune stale references and verify worktree integrity
- **Status Checking**: Verify worktree state and uncommitted changes

## Key Concepts

### Worktree Lifecycle

```
Create (git-worktree-create skill)
   ↓
Develop (work in worktree)
   ↓
Manage (this skill) - check status, list, verify
   ↓
Complete (merge to main)
   ↓
Cleanup (this skill) - remove worktree
```

### Worktree States

1. **Active**: Worktree exists and can be used
   ```
   /full/path/to/repo/.worktrees/feature-auth  abc1234 [feature/auth]
   ```

2. **Prunable**: Worktree deleted manually but reference remains
   ```
   /full/path/to/repo/.worktrees/old-feature   (prunable)
   ```

3. **With Changes**: Worktree has uncommitted changes
   ```
   /full/path/to/repo/.worktrees/active-work   def5678 [feature/work] dirty
   ```

## Worktree Status and Metadata

Git tracks worktree metadata in `.git/worktrees/<name>/`, including branch, HEAD, and lock status. This information is used by `git worktree list` and `git worktree remove`.

**Key operations:**
- **List worktrees:** `git worktree list` shows path, branch, and commit for all worktrees
- **Check status:** Each worktree has independent staging area and working directory state
- **Prune stale entries:** `git worktree prune` removes metadata for deleted worktree directories

For complete metadata structure and low-level details, see [Git Worktree Internals](https://git-scm.com/docs/gitrepository-layout#Documentation/gitrepository-layout.txt-worktreesltnamegtgitdir).

## Common Operations

### Operation 1: List All Worktrees

**Purpose**: See all active worktrees and their status

**Command**:
```bash
git worktree list
```

**Output**:
```
/full/path/to/repo                        abc1234 [main]
/full/path/to/repo/.worktrees/reviews/pr-123  def5678 [reviews/pr-123]
/full/path/to/repo/.worktrees/feature-auth    ghi9012 [feature/auth]
/full/path/to/repo/.worktrees/spike-cache     jkl3456 [spike/cache]
```

**Enhanced listing**:
```bash
# With more detail
git worktree list -v

# Count worktrees
git worktree list | wc -l

# Show only feature worktrees
git worktree list | grep feature

# Show only PR review worktrees
git worktree list | grep reviews
```

### Operation 2: Check Worktree Status

**Purpose**: See what's in a specific worktree

**Check current branch**:
```bash
cd .worktrees/feature-auth
git branch -vv

# Output: * feature/auth  abc1234 [origin/feature/auth: ahead 3]
```

**Check uncommitted changes**:
```bash
cd .worktrees/feature-auth
git status

# Shows modified files, staged changes, etc.
```

**View recent commits**:
```bash
cd .worktrees/feature-auth
git log --oneline -5

# Shows last 5 commits in this worktree
```

### Operation 3: Remove Completed Worktree

**Purpose**: Clean up worktree after work is merged or abandoned

**Safe removal**:
```bash
# From repo root
git worktree remove .worktrees/feature-auth

# Verification
git worktree list
# feature-auth is now gone
```

**Remove worktree with changes (caution!)**:
```bash
# If worktree has uncommitted changes, use --force
git worktree remove --force .worktrees/feature-auth
```

**Remove associated branch**:
```bash
# After removing worktree, delete the branch
git branch -d feature/auth

# Or force delete if not merged
git branch -D feature/auth
```

### Operation 4: Prune Stale References

**Purpose**: Clean up orphaned worktree references

**Prune references**:
```bash
git worktree prune

# Removes references to deleted worktrees
# Safe operation - doesn't delete worktrees, only references
```

**Before and after**:
```bash
# Before: shows prunable entries
git worktree list
# /path/to/missing/worktree (prunable)

# After prune
git worktree prune

git worktree list
# (prunable entry is gone)
```

### Operation 5: Full Cleanup

**Purpose**: Remove all worktrees and clean up repository

**Safe cleanup** (one at a time):
```bash
# List all worktrees
git worktree list

# Remove each one
git worktree remove .worktrees/reviews/pr-123
git worktree remove .worktrees/feature-auth
git worktree remove .worktrees/spike-cache

# Prune remaining references
git worktree prune

# Verify
git worktree list
# Should show only main repo
```

**Nuclear cleanup** (all at once):

⚠️ **WARNING**: This operation is destructive and irreversible. Use only when you have verified:
1. All important work has been pushed to remote
2. All active worktrees have been reviewed with `git worktree list`
3. You have committed or stashed any uncommitted changes
4. You will not need to recover old worktree history

```bash
# CAREFUL! Only do this if you're sure
# First, verify what will be deleted
git worktree list

# Second, confirm all changes are pushed
cd .worktrees/[name]
git log --oneline -5 origin/[branch]..HEAD  # Should show nothing

# Third, remove all worktrees
rm -rf .worktrees/
git worktree prune

# Verify
git worktree list
# Should be clean
```

## Workflow Examples

### Workflow 1: Daily Status Check

**Morning routine**:
```bash
# See what work is active
git worktree list

# Expected output shows active features and reviews
```

### Workflow 2: Context Switching

**Switch to different feature**:
```bash
# See available worktrees
git worktree list

# Switch to feature-auth
cd .worktrees/feature-auth
git status

# Work on auth feature
git add .
git commit -m "fix(auth): resolve login flow issue"

# Switch to payment feature
cd ../feature-payments
git status

# Work on payments
git add .
git commit -m "feat(payments): add payment validation"
```

### Workflow 3: End-of-Week Cleanup

**Friday afternoon cleanup**:
```bash
# List all worktrees
git worktree list

# Check which features are merged
git branch -r --merged

# Remove merged feature worktrees
git worktree remove .worktrees/feature-auth  # (merged)
git worktree remove .worktrees/feature-api   # (merged)

# Keep active work
git worktree list

# Should show only active features and current reviews

# Prune any orphaned references
git worktree prune

# Verify clean state
git worktree list
```

### Workflow 4: Debugging Stale Worktree

**Investigate worktree issues**:
```bash
# See what's there
git worktree list

# If you see (prunable) entry:
git worktree prune

# If worktree is corrupted:
rm -rf .worktrees/corrupted-name/
git worktree prune

# Verify
git worktree list
```

## Integration with Skill System

### Called by Skills

This skill is automatically used by:
- **git-worktree-create** - Verifies new worktrees after creation
- **git-worktree-best-practices** - Referenced for cleanup procedures

### Auto-Invoked When

Claude automatically invokes this skill when you:
- Ask "show me all my worktrees"
- Request worktree listing or status
- Need to "clean up old worktrees"
- Ask about removing a worktree
- Request pruning or maintenance

## Best Practices

### Practice 1: Regular Listing

```bash
# Before starting new work
git worktree list

# Understand current state
# Avoid duplicate names
# See if cleanup is needed
```

### Practice 2: Clean Before Creating

```bash
# Check for old worktrees
git worktree list

# If too many, clean up first
git worktree remove .worktrees/old-feature

# Then create new one
git worktree add -b feature/new .worktrees/feature-new main
```

### Practice 3: Document Before Removing

```bash
# Before removing important work, check:
cd .worktrees/feature-important
git log --oneline -10
# Make sure all commits are pushed

git status
# Make sure no uncommitted work

# Then safe to remove
cd ../..
git worktree remove .worktrees/feature-important
```

### Practice 4: Prune Regularly

```bash
# Weekly maintenance
git worktree prune

# After manually deleting worktree directories
git worktree prune

# After force-removing corrupted worktrees
git worktree prune
```

### Practice 5: Organize by Category

```bash
# Maintain this structure
.worktrees/
├── reviews/      # PR reviews
│   ├── pr-123/
│   └── pr-124/
├── feature-*     # Feature branches (flat)
├── spike-*       # Experiment branches (flat)
└── archive/      # (optional) stale but not deleted
```

### Practice 6: Verify Commit Quality Before Removal

Before removing a worktree, verify that commits follow best practices:

```bash
# Check commits in worktree vs main
cd .worktrees/feature-important
git log --oneline origin/main..HEAD

# Verify conventional commit format
# Each commit should follow: type(scope): description
# Examples: feat(auth): add login, fix(api): resolve timeout

# Verify all pushed
git log --oneline -5 origin/[branch]..HEAD
# Should be empty - all commits pushed

# Check last commits are meaningful
git log -3 --format="%h %s"
# Should show semantic commit messages
```

For more comprehensive guidance on commit message best practices, see the [Conventional Commits section in git-worktree-best-practices](./git-worktree-best-practices/SKILL.md#conventional-commits-for-worktrees).

## Advanced Management Techniques

### Scripting with Porcelain Format

For automation and scripts, use machine-readable format:

```bash
# Porcelain format for parsing
git worktree list --porcelain

# Output format:
# worktree /full/path
# HEAD abc1234567890
# branch refs/heads/feature-name
#
# worktree /full/path/to/worktree2
# HEAD def1234567890
# detached
```

**Parse in scripts:**
```bash
# Extract all worktree paths
git worktree list --porcelain | grep '^worktree ' | cut -d' ' -f2-

# Find detached HEAD worktrees
git worktree list --porcelain | grep -B1 '^detached$' | grep '^worktree '
```

### Bulk Operations

**Remove all feature worktrees:**
```bash
# Safe: loops through and removes one by one
git worktree list | grep 'feature-' | awk '{print $1}' | while read -r path; do
    git worktree remove "$path"
done
```

**Find worktrees with uncommitted changes:**
```bash
# Check all worktrees for dirty state
git worktree list --porcelain | grep '^worktree ' | cut -d' ' -f2- | while read -r path; do
    if [[ -d "$path" ]]; then
        cd "$path"
        if [[ -n "$(git status --porcelain)" ]]; then
            echo "Dirty: $path"
        fi
    fi
done
```

### Repair Operations

From [official docs](https://git-scm.com/docs/git-worktree#Documentation/git-worktree.txt-repair), use `git worktree repair` when:

- Worktree was moved manually
- Administrative files are corrupted
- Main worktree was moved

```bash
# Repair specific worktree
git worktree repair .worktrees/feature-moved

# Repair all worktrees
git worktree repair

# Repair will update gitdir files to point to current locations
```

## Advanced Operations

### List with Custom Formatting

```bash
# Porcelain format (for scripting)
git worktree list --porcelain

# Output:
# worktree /full/path
# branch refs/heads/main
# detach
#
# worktree /full/path/.worktrees/feature-auth
# branch refs/heads/feature/auth
```

### Count Worktrees

```bash
# Total count
git worktree list | wc -l

# Count by type
git worktree list | grep -c "reviews/"    # PR reviews
git worktree list | grep -c "feature-"    # Features
git worktree list | grep -c "spike-"      # Spikes
```

### Find Worktrees with Changes

```bash
# Check all worktrees for uncommitted changes
for worktree in $(git worktree list | awk '{print $1}'); do
    cd "$worktree"
    if [[ -n $(git status --porcelain) ]]; then
        echo "Changes in: $worktree"
        git status --short
    fi
done
```

### Bulk Cleanup

```bash
# Remove all feature worktrees
for dir in .worktrees/feature-*; do
    git worktree remove "$dir"
done

# Cleanup associated branches
git branch | grep "feature/" | xargs git branch -d

# Prune
git worktree prune
```

## Troubleshooting

### Issue: "Worktree not found"

```bash
# Error when trying to remove
git worktree remove .worktrees/missing
# fatal: '.worktrees/missing' is not a working tree

# Solution: Already deleted
git worktree prune
git worktree list
```

### Issue: "Worktree contains uncommitted changes"

```bash
# Error when trying to remove
git worktree remove .worktrees/feature-work
# fatal: cannot remove working tree '.worktrees/feature-work'
# contains uncommitted modifications

# Solution: Commit first
cd .worktrees/feature-work
git add .
git commit -m "wip(feature): checkpoint before cleanup"
cd ../..
git worktree remove .worktrees/feature-work

# Or force remove (LOSE CHANGES!)
git worktree remove --force .worktrees/feature-work
```

### Issue: "(prunable)" in worktree list

```bash
# Worktree shows as prunable
git worktree list
# /path/to/missing/worktree (prunable)

# Solution: Prune references
git worktree prune

# Verify
git worktree list
# Entry should be gone
```

### Issue: Too many worktrees, slow repo

```bash
# Performance issue with many worktrees
git worktree list | wc -l
# Shows: 50 worktrees

# Solution: Aggressive cleanup
# Keep only active work
git worktree list | grep -v "feature-\|reviews/" | awk '{print $1}'

# Or nuke and rebuild
rm -rf .worktrees/
git worktree prune
```

## Related Skills

- **git-worktree-create** - Create new worktrees
- **git-worktree-best-practices** - Naming conventions and organization

## Related Commands

- **`/work`** - Interactive worktree creation
- **`/review`** - PR review with auto-cleanup

## Official Resources

### Git Documentation
- **git worktree man page**: `man git-worktree` or https://git-scm.com/docs/git-worktree
- **Git reference**: https://git-scm.com/docs
- **Git Book**: https://git-scm.com/book

### Community Guides
- [Practical Guide to Git Worktree (DEV.to)](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)
- [Git Worktree Best Practices (GitHub Gist)](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc)
- [Mastering Git Worktree (Medium)](https://mskadu.medium.com/mastering-git-worktree-a-developers-guide-to-multiple-working-directories-c30f834f79a5)

