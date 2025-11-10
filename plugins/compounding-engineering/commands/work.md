# Work Plan Execution Command

## Usage

```bash
# With namespace (always works)
claude /compounding-engineering:work [PATH_TO_PLAN|TODO_FILE]

# Examples:
claude /compounding-engineering:work docs/feature-plan.md
claude /compounding-engineering:work todos/042-approved-p1-fix.md

# Set up alias for convenience (optional)
alias work="claude /compounding-engineering:work"
```

## Introduction

This command helps you analyze a work document (plan, Markdown file, specification, or any structured document), create a comprehensive todo list using the TodoWrite tool, and then systematically execute each task until the entire plan is completed. It combines deep analysis with practical execution to transform plans into reality.

**Enhanced with git worktree isolation**: This command uses the **git-worktree-create skill** to automatically create isolated development environments for each work plan, ensuring clean separation of concerns and enabling parallel development.

## Prerequisites

- A work document to analyze (plan file, specification, or any structured document)
- Clear understanding of project context and goals
- Access to necessary tools and permissions for implementation
- Ability to test and validate completed work
- Git repository with main branch

## Main Tasks

### 1. Setup Development Environment

- Ensure main branch is up to date
- Create feature branch with descriptive name
- Setup worktree for isolated development
- Configure development environment

### 2. Analyze Input Document

<input_document> #$ARGUMENTS </input_document>

## Execution Workflow

### Phase 1: Environment Setup

1. **Update Main Branch**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create Feature Branch and Worktree** (via git-worktree-create skill)

   The **git-worktree-create skill** handles all worktree setup automatically:

   - Determines appropriate branch name from document/arguments
   - Creates `.worktrees/` directory structure
   - Updates `.gitignore` with `.worktrees` entry
   - Creates feature branch with semantic naming convention
   - Sets up isolated development environment
   - Verifies environment is ready for work

   **The skill automatically:**
   - ✓ Determines branch name: `feature/{descriptive-name}`
   - ✓ Creates directory: `$git_root/.worktrees/feature-{descriptive-name}/`
   - ✓ Initializes git worktree with proper base branch
   - ✓ Verifies worktree setup and branch creation
   - ✓ Positions you in the worktree directory

3. **Verify Environment**
   - Confirm in correct worktree directory
   - Install dependencies if needed
   - Run initial tests to ensure clean state

### Phase 2: Document Analysis and Planning

1. **Read Input Document**

   - Use Read tool to examine the work document
   - Identify all deliverables and requirements
   - Note any constraints or dependencies
   - Extract success criteria

2. **Create Task Breakdown**

   - Convert requirements into specific tasks
   - Add implementation details for each task
   - Include testing and validation steps
   - Consider edge cases and error handling

3. **Build Todo List**
   - Use TodoWrite to create comprehensive list
   - Set priorities based on dependencies
   - Include all subtasks and checkpoints
   - Add documentation and review tasks

### Phase 3: Systematic Execution

1. **Task Execution Loop**

   ```
   while (tasks remain):
     - Select next task (priority + dependencies)
     - Mark as in_progress
     - Execute task completely
     - Validate completion
     - Mark as completed
     - Update progress
   ```

2. **Quality Assurance**

   - Run tests after each task
   - Execute lint and typecheck commands
   - Verify no regressions
   - Check against acceptance criteria
   - Document any issues found

3. **Progress Tracking**
   - Regularly update task status
   - Note any blockers or delays
   - Create new tasks for discoveries
   - Maintain work visibility

### Phase 4: Completion and Submission

1. **Final Validation**

   - Verify all tasks completed
   - Run comprehensive test suite
   - Execute final lint and typecheck
   - Check all deliverables present
   - Ensure documentation updated

2. **Prepare for Submission**

   - Stage and commit all changes
   - Write commit messages
   - Push feature branch to remote
   - Create detailed pull request

3. **Create Pull Request**
   ```bash
   git push -u origin feature-branch-name
   gh pr create --title "Feature: [Description]" --body "[Detailed description]"
   ```
