# Git Worktree Creation Examples

This document provides practical examples of creating and using git worktrees with the git-worktree-create skill.

## Example 1: PR Review Workflow

### Scenario
You need to review a pull request (#456) before merging it to main.

### Steps

**Step 1: Create PR review worktree**
```bash
# Option A: Using the skill directly
claude "Create a worktree for PR 456 review"
# Automatically creates .worktrees/reviews/pr-456

# Option B: Using the automation script
cd /path/to/repo
./plugins/compounding-engineering/skills/git-worktree-create/scripts/create-worktree.sh review 456
# Creates .worktrees/reviews/pr-456
```

**Step 2: Skill automatically:**
- Creates `.worktrees/reviews/` directory
- Checks out PR #456 using `gh pr checkout`
- Downloads PR's source branch into the worktree
- Verifies setup is complete

**Step 3: Use `/review` command**
```bash
claude /review 456
# Automatically uses the worktree created by skill
# Runs analysis in isolated environment
# Reports findings
```

**Step 4: Clean up after review**
```bash
cd /path/to/repo
git worktree remove .worktrees/reviews/pr-456
```

### Result
✓ PR reviewed in isolation
✓ Main branch remains clean
✓ Easy to switch back to main work

---

## Example 2: Feature Development Workflow

### Scenario
You're building a new authentication system. You want to work in isolation while other team members work on other features.

### Steps

**Step 1: Create feature worktree**
```bash
# Option A: Using the /work command (recommended)
claude /work "Build user authentication system"
# Automatically:
# - Creates .worktrees/feature-build-user-authentication-system
# - Creates branch: feature/build-user-authentication-system
# - Sets up environment

# Option B: Using skill directly
claude "Create a feature worktree for building authentication"
# Automatically invokes git-worktree-create skill

# Option C: Using automation script
./scripts/create-worktree.sh feature "user authentication"
# Creates .worktrees/feature-user-authentication
# Creates branch: feature/user-authentication
```

**Step 2: Start development**
```bash
cd .worktrees/feature-user-authentication
git status
# On branch feature/user-authentication

# Install dependencies
npm install

# Start work
vim src/auth/login.ts
npm test
```

**Step 3: Commit and push**
```bash
cd .worktrees/feature-user-authentication

git add src/auth/
git commit -m "feat(auth): add login form component"

git add src/services/
git commit -m "feat(auth): add authentication service"

git push -u origin feature/user-authentication
```

**Step 4: Meanwhile, team member works on other feature**
```bash
# In another terminal (same repo)
./scripts/create-worktree.sh feature "payment processing"
# Creates separate .worktrees/feature-payment-processing

cd .worktrees/feature-payment-processing
npm install
# ... work on payments independently ...
```

**Step 5: After PR review and merge**
```bash
cd /path/to/repo

# Clean up merged feature worktree
git worktree remove .worktrees/feature-user-authentication
git branch -D feature/user-authentication

# Continue with next feature
./scripts/create-worktree.sh feature "email notifications"
```

### Result
✓ Feature developed in isolation
✓ Multiple team members can work in parallel
✓ No branch conflicts between features
✓ Easy cleanup after merge

---

## Example 3: Parallel Experimentation Workflow

### Scenario
You need to investigate two different approaches to optimizing database queries. You want to test both simultaneously without affecting main branch.

### Steps

**Step 1: Create first spike/experiment**
```bash
./scripts/create-worktree.sh spike "query-optimization-v1"
# Creates .worktrees/spike-query-optimization-v1
# Creates branch: spike/query-optimization-v1

cd .worktrees/spike-query-optimization-v1

# Implement approach 1
vim src/database/queries.ts
npm test

# Commit results
git add .
git commit -m "perf(db): test indexed lookup optimization approach"
```

**Step 2: Create second spike (in another terminal)**
```bash
./scripts/create-worktree.sh spike "query-optimization-v2"
# Creates .worktrees/spike-query-optimization-v2
# Creates branch: spike/query-optimization-v2

cd .worktrees/spike-query-optimization-v2

# Implement approach 2
vim src/database/queries.ts
npm test

# Commit results
git add .
git commit -m "perf(db): test query caching optimization approach"
```

**Step 3: Compare results**
```bash
# Back in main repo
git checkout main

# Review both branches
git log spike/query-optimization-v1
git log spike/query-optimization-v2

# Check performance benchmarks from each
cat .worktrees/spike-query-optimization-v1/BENCHMARK.md
cat .worktrees/spike-query-optimization-v2/BENCHMARK.md
```

**Step 4: Merge winning approach**
```bash
# Merge v2 (faster approach)
git merge spike/query-optimization-v2

# Clean up both spikes
git worktree remove .worktrees/spike-query-optimization-v1
git worktree remove .worktrees/spike-query-optimization-v2

git branch -D spike/query-optimization-v1
git branch -D spike/query-optimization-v2
```

### Result
✓ Experimented safely in isolation
✓ Compared approaches without polluting main
✓ Best solution merged cleanly
✓ Failed experiments easily discarded

---

## Example 4: Mixed Review + Development Workflow

### Scenario
You're developing a feature AND need to review incoming PRs. You want both active simultaneously.

### Steps

**Step 1: Start feature development**
```bash
./scripts/create-worktree.sh feature "dark mode support"
cd .worktrees/feature-dark-mode-support

# ... development work ...
git add .
git commit -m "feat(ui): add dark theme CSS variables"
```

**Step 2: Urgent PR review comes in**
```bash
# In another terminal
./scripts/create-worktree.sh review 789
cd .worktrees/reviews/pr-789

# ... review work ...
```

**Step 3: Seamlessly switch between contexts**
```bash
# Back to feature development
cd /path/to/repo/.worktrees/feature-dark-mode-support
git status
# You're in feature context, not affected by review

# Switch to review
cd /path/to/repo/.worktrees/reviews/pr-789
git status
# You're in PR context, not affected by feature work
```

**Step 4: Clean up review, continue feature**
```bash
cd /path/to/repo
git worktree remove .worktrees/reviews/pr-789

# Resume feature work
cd .worktrees/feature-dark-mode-support
git add .
git commit -m "feat(ui): add dark mode toggle to settings"
```

### Result
✓ Can handle urgent reviews without disrupting feature work
✓ Each context remains isolated
✓ Easy to context-switch without merge conflicts
✓ Multiple work streams in parallel

---

## Example 5: Cleanup and Housekeeping

### Scenario
After a week of work, you have multiple old worktrees that need cleanup.

### Steps

**Step 1: List all worktrees**
```bash
git worktree list

# Expected output:
# /full/path/to/repo                        abc1234 [main]
# /full/path/to/repo/.worktrees/reviews/pr-456      def5678 [reviews/pr-456]
# /full/path/to/repo/.worktrees/feature-auth        ghi9012 [feature/user-auth]
# /full/path/to/repo/.worktrees/spike-cache        jkl3456 [spike/cache-layer]
```

**Step 2: Remove merged features**
```bash
# Check which are merged
git branch -r --merged

# Remove worktree for merged feature
git worktree remove .worktrees/feature-auth

# Remove the branch
git branch -d feature/user-auth
```

**Step 3: Clean up old reviews**
```bash
# Remove old review worktrees
git worktree remove .worktrees/reviews/pr-456

# Prune references
git worktree prune
```

**Step 4: Keep active work**
```bash
# Keep current feature and spike
git worktree list

# Should show only active work
```

**Step 5: Full cleanup (nuclear option)**
```bash
# Only do this if you're sure everything is merged/done
rm -rf .worktrees/
git worktree prune
```

### Result
✓ Old worktrees cleaned up
✓ Repository stays lean
✓ Easy to track current work

---

## Pro Tips

### Tip 1: Use meaningful names
```bash
# GOOD
./scripts/create-worktree.sh feature "add stripe integration"
# Creates: feature-add-stripe-integration

# BAD
./scripts/create-worktree.sh feature "feature1"
# Creates: feature-feature1
```

### Tip 2: Keep main branch current
```bash
# Before creating worktree
git checkout main
git pull origin main

# Or let the script do it automatically
./scripts/create-worktree.sh feature "my-feature"
# Script handles this
```

### Tip 3: Use absolute paths in scripts
```bash
# GOOD
git_root=$(git rev-parse --show-toplevel)
cd "$git_root/.worktrees/feature-name"

# BAD
cd .worktrees/feature-name  # Relative paths can break
```

### Tip 4: Organize with subdirectories
```bash
# Reviews organized by type
.worktrees/reviews/pr-123
.worktrees/reviews/pr-124

# Features by area
.worktrees/feature-auth
.worktrees/feature-payments

# Spikes separated
.worktrees/spike-optimization
.worktrees/spike-architecture
```

### Tip 5: Document important work
```bash
cd .worktrees/feature-important-work

# Create README explaining context
cat > README.md <<EOF
# Feature: Important Work

## Purpose
Implement critical functionality for Q1 release

## Design
- Uses new caching layer
- Integrates with payment system

## Status
In progress, expected completion Nov 15

## Notes
- Depends on spike/cache-layer completion
- Needs security review before merge
EOF

git add README.md
git commit -m "docs(feature): document feature context and timeline"
```

---

## Troubleshooting Examples

### Problem: Worktree already exists
```bash
ls -la .worktrees/feature-auth/
# Shows: directory exists

# Solution: Either remove it first
git worktree remove .worktrees/feature-auth

# Or use different name
./scripts/create-worktree.sh feature "user-auth-v2"
```

### Problem: Can't check out PR
```bash
./scripts/create-worktree.sh review 999
# Error: Failed to checkout PR #999

# Solution: Verify PR exists and gh CLI is installed
gh pr view 999
which gh

# If gh not installed:
# Install from https://cli.github.com/
```

### Problem: Branch already exists
```bash
./scripts/create-worktree.sh feature "auth"
# Error: branch "feature/auth" already exists

# Solution: Use different name or check branch status
git branch -a
./scripts/create-worktree.sh feature "auth-v2"

# Or reuse existing branch
git worktree add .worktrees/feature-auth-existing feature/auth
```

### Problem: Stale worktree references
```bash
# After manual deletion, ghost worktrees may remain
git worktree list
# Shows: /path/to/missing/worktree (prunable)

# Solution: Prune references
git worktree prune
```

---

## See Also

- SKILL.md - Full skill documentation
- git worktree man page: `man git-worktree`
- Git documentation: https://git-scm.com/docs/git-worktree
