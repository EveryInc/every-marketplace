#!/bin/bash

# Git Worktree Creation Script
# Usage: create-worktree.sh [type] [name] [base_branch]
# Examples:
#   create-worktree.sh review 123              # Create PR review worktree
#   create-worktree.sh feature user-auth       # Create feature worktree
#   create-worktree.sh spike cache-layer       # Create spike worktree
#   create-worktree.sh feature payment main    # Create feature from custom branch

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_error() {
    echo -e "${RED}✗ Error: $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Validate inputs
if [[ $# -lt 2 ]]; then
    log_error "Insufficient arguments"
    echo "Usage: $(basename "$0") [type] [name] [base_branch]"
    echo ""
    echo "Types:"
    echo "  review - PR review worktree (requires PR number as name)"
    echo "  feature - Feature branch worktree"
    echo "  spike - Experiment/spike worktree"
    echo ""
    echo "Examples:"
    echo "  $(basename "$0") review 123"
    echo "  $(basename "$0") feature user-auth"
    echo "  $(basename "$0") spike caching-layer"
    echo "  $(basename "$0") feature payment-processing main"
    exit 1
fi

type="$1"
name="$2"
base_branch="${3:-main}"

# Determine git root
if ! git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
    log_error "Not in a git repository"
    exit 1
fi

log_info "Repository root: $git_root"

# Create .worktrees directory
if [[ ! -d "$git_root/.worktrees" ]]; then
    log_info "Creating .worktrees directory"
    mkdir -p "$git_root/.worktrees"
fi

# Update .gitignore
if ! grep -q "^\.worktrees$" "$git_root/.gitignore" 2>/dev/null; then
    log_info "Adding .worktrees to .gitignore"
    echo ".worktrees" >> "$git_root/.gitignore"
fi

# Ensure main branch is up to date
log_info "Updating main branch"
cd "$git_root"
git checkout main 2>/dev/null || true
git pull origin main 2>/dev/null || true

# Create worktree based on type
case "$type" in
    review)
        if [[ ! "$name" =~ ^[0-9]+$ ]]; then
            log_error "PR number must be numeric (got: $name)"
            exit 1
        fi

        worktree_dir="$git_root/.worktrees/reviews"
        mkdir -p "$worktree_dir"

        worktree_path="$worktree_dir/pr-$name"

        if [[ -d "$worktree_path" ]]; then
            log_error "PR worktree already exists: $worktree_path"
            exit 1
        fi

        log_info "Creating PR review worktree for PR #$name"

        # Use gh to checkout PR
        if command -v gh &> /dev/null; then
            gh pr checkout "$name" --worktree "$worktree_path" 2>/dev/null || {
                log_error "Failed to checkout PR #$name"
                log_info "Make sure PR #$name exists and you have gh CLI installed"
                exit 1
            }
            log_success "PR worktree created at: $worktree_path"
        else
            log_error "gh CLI not found. Install from https://cli.github.com/"
            exit 1
        fi
        ;;

    feature)
        if [[ -z "$name" ]]; then
            log_error "Feature name required"
            exit 1
        fi

        # Normalize feature name (replace spaces with hyphens, lowercase)
        feature_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

        worktree_path="$git_root/.worktrees/feature-$feature_name"
        branch_name="feature/$feature_name"

        if [[ -d "$worktree_path" ]]; then
            log_error "Feature worktree already exists: $worktree_path"
            exit 1
        fi

        log_info "Creating feature worktree for: $feature_name"
        log_info "Branch: $branch_name"
        log_info "Base: $base_branch"

        # Verify base branch exists
        if ! git rev-parse "$base_branch" &>/dev/null; then
            log_error "Base branch not found: $base_branch"
            exit 1
        fi

        git worktree add -b "$branch_name" "$worktree_path" "$base_branch"
        log_success "Feature worktree created at: $worktree_path"
        ;;

    spike)
        if [[ -z "$name" ]]; then
            log_error "Spike name required"
            exit 1
        fi

        # Normalize spike name
        spike_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

        worktree_path="$git_root/.worktrees/spike-$spike_name"
        branch_name="spike/$spike_name"

        if [[ -d "$worktree_path" ]]; then
            log_error "Spike worktree already exists: $worktree_path"
            exit 1
        fi

        log_info "Creating spike worktree for: $spike_name"
        log_info "Branch: $branch_name"
        log_info "Base: $base_branch"

        # Verify base branch exists
        if ! git rev-parse "$base_branch" &>/dev/null; then
            log_error "Base branch not found: $base_branch"
            exit 1
        fi

        git worktree add -b "$branch_name" "$worktree_path" "$base_branch"
        log_success "Spike worktree created at: $worktree_path"
        ;;

    *)
        log_error "Unknown type: $type"
        log_info "Valid types: review, feature, spike"
        exit 1
        ;;
esac

# Verify worktree setup
log_info "Verifying worktree setup"

cd "$worktree_path"

# Check branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
log_success "Branch: $current_branch"

# Check status
if [[ -z "$(git status --porcelain)" ]]; then
    log_success "Working directory clean"
else
    log_warn "Working directory has changes"
fi

# Summary
echo ""
log_success "Worktree created successfully!"
echo ""
echo "Next steps:"
echo "  1. Navigate to worktree:"
echo "     cd $worktree_path"
echo "  2. Install dependencies (if needed):"
echo "     npm install  # or equivalent for your project"
echo "  3. Start working!"
echo ""
echo "When done, clean up:"
echo "  cd $git_root"
echo "  git worktree remove $worktree_path"
