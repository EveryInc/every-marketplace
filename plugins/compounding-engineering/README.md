# Compounding Engineering Plugin

AI-powered development tools that embody a simple principle: **each unit of engineering work should make subsequent units of work easier—not harder.**

## The Compounding Advantage

Most development workflows create technical debt. This plugin inverts that pattern. Every code review raises quality standards. Every issue plan captures research for reuse. Every bug fix documents patterns to prevent recurrence. The result? Your engineering velocity compounds over time.

### How Work Compounds

**Traditional Workflow** (knowledge lost):
```
Issue → Code → Review → Fix → Repeat
Each cycle starts from scratch ❌
```

**Compounding Workflow** (knowledge retained):
```
/plan → Research captured, patterns documented ✓
  ↓
/work → Isolated development, parallel work enabled ✓
  ↓
/review → Standards raised, anti-patterns caught ✓
  ↓
/triage → Findings organized, context preserved ✓
  ↓
Next cycle: Higher baseline, faster execution ✨
```

### Concrete Example

**Week 1:** Run `/review` on Rails PR. Agent identifies: "Controllers should stay under 50 lines." Pattern captured.

**Week 3:** Run `/plan` for new feature. Agent references captured pattern automatically. Plan includes: "Keep controller under 50 lines."

**Week 5:** Run `/work` on implementation. Isolated worktree prevents conflicts with 3 parallel features.

**Week 7:** Run `/review`. Now checks 15+ captured patterns. What took 2 hours takes 20 minutes.

**Result:** Standards compound. Quality rises. Work accelerates.

## Table of Contents

- [Philosophy](#philosophy)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Components Overview](#components-overview)
  - [Slash Commands](#slash-commands)
  - [Specialized Agents](#specialized-agents)
  - [Reusable Skills](#reusable-skills)
- [Command Reference](#command-reference)
- [Agent Reference](#agent-reference)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Resources](#resources)

## Philosophy

**Each unit of engineering work should make subsequent units of work easier—not harder.**

This plugin embodies the compounding engineering philosophy by providing AI agents, commands, hooks, and reusable skills that improve your workflow with every use.

## Quick Start

Get productive with the Compounding Engineering plugin in 10 minutes.

### Prerequisites

- Claude Code CLI installed ([Installation Guide](https://docs.claude.com/claude-code))
- Git repository with a main branch
- Terminal access with bash/zsh

### Installation Steps

```bash
# 1. Add the Every Marketplace
claude /plugin marketplace add https://github.com/EveryInc/every-marketplace

# 2. Install the compounding-engineering plugin
claude /plugin install compounding-engineering

# 3. Verify installation
claude /compounding-engineering:plan --help
```

### Your First Workflow

Try this complete feature development workflow:

```bash
# 1. Create a structured implementation plan
claude /compounding-engineering:plan "Add OAuth authentication"

# 2. Execute the plan with isolated worktree
claude /compounding-engineering:work docs/feature-plan.md

# 3. Review the implementation
claude /compounding-engineering:review

# 4. Triage any findings
claude /compounding-engineering:triage
```

**What just happened?**

1. `/plan` created a detailed implementation plan with research, acceptance criteria, and technical details
2. `/work` set up an isolated git worktree and executed tasks systematically
3. `/review` ran multiple specialized agents to check code quality, security, and performance
4. `/triage` helped you prioritize and track any issues found

### Next Steps

- Read the [Command Reference](#command-reference) to understand each command's capabilities
- Explore [Common Workflows](#common-workflows) for real-world scenarios
- Check out [Agent Reference](#agent-reference) to use specialized agents directly

## Installation

### From Marketplace (Recommended)

```bash
# Add the marketplace
claude /plugin marketplace add https://github.com/EveryInc/every-marketplace

# Install the plugin
claude /plugin install compounding-engineering
```

### From Local Directory

```bash
# Clone the repository
git clone https://github.com/EveryInc/every-marketplace.git

# Add local marketplace
claude /plugin marketplace add /path/to/every-marketplace

# Install the plugin
claude /plugin install compounding-engineering
```

### Optional: Create Aliases

Add these to your shell config (`~/.bashrc`, `~/.zshrc`):

```bash
alias plan="claude /compounding-engineering:plan"
alias work="claude /compounding-engineering:work"
alias review="claude /compounding-engineering:review"
alias triage="claude /compounding-engineering:triage"
alias gencommand="claude /compounding-engineering:generate_command"
alias resolve="claude /compounding-engineering:resolve_todo_parallel"
```

## Components Overview

### Slash Commands

6 powerful commands for workflow automation:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/plan` | Create structured implementation plans | Starting features, planning refactors |
| `/work` | Execute work plans in isolated worktrees | Implementing features, fixing bugs |
| `/review` | Multi-agent code quality assessment | Before merging, quality checks |
| `/triage` | Prioritize findings and issues | After reviews, organizing work |
| `/generate_command` | Create custom slash commands | Automating repetitive workflows |
| `/resolve_todo_parallel` | Resolve TODOs in parallel | Batch fixing issues, cleanup |

### Specialized Agents

17 AI experts for specific engineering tasks:

#### Code Review Specialists (5)

- `kieran-rails-reviewer` - Strict Rails code quality standards
- `kieran-typescript-reviewer` - TypeScript best practices
- `kieran-python-reviewer` - Python code quality
- `dhh-rails-reviewer` - DHH-philosophy Rails review
- `code-simplicity-reviewer` - Simplification and YAGNI

#### Architecture & Design (2)

- `architecture-strategist` - System design analysis
- `pattern-recognition-specialist` - Design patterns and anti-patterns

#### Quality & Performance (3)

- `performance-oracle` - Performance optimization
- `security-sentinel` - Security vulnerability detection
- `data-integrity-guardian` - Database safety review

#### Analysis & Research (4)

- `git-history-analyzer` - Code evolution analysis
- `repo-research-analyst` - Repository structure analysis
- `best-practices-researcher` - Best practices research
- `framework-docs-researcher` - Framework documentation

#### Workflow & Feedback (2)

- `feedback-codifier` - Convert feedback to patterns
- `pr-comment-resolver` - Resolve review comments

#### Documentation (1)

- `every-style-editor` - Every.to writing style

### Reusable Skills

3 model-invoked skills for git worktree management:

- `git-worktree-create` - Create isolated development environments
- `git-worktree-manage` - Manage worktree lifecycle
- `git-worktree-best-practices` - Naming conventions and patterns

## Command Reference

### `/plan` - Create Implementation Plans

Transform feature descriptions into structured GitHub-ready issues.

**Syntax:**

```bash
claude /compounding-engineering:plan "feature description"
```

**Examples:**

```bash
# Plan a new feature
claude /compounding-engineering:plan "Add OAuth authentication with Google"

# Plan a bug fix
claude /compounding-engineering:plan "Fix race condition in payment processing"

# Plan a refactor
claude /compounding-engineering:plan "Refactor user service to improve testability"
```

**What It Does:**

1. Researches repository patterns using 3 parallel agents
2. Analyzes similar implementations in your codebase
3. Creates structured plan with acceptance criteria
4. Includes technical considerations and success metrics
5. Outputs GitHub-ready issue markdown

**Detail Levels:**

- **MINIMAL** - Quick issues for simple bugs/features
- **MORE** - Standard issues for team collaboration (default)
- **A LOT** - Comprehensive plans for major features

**Output:** GitHub issue markdown with title, description, acceptance criteria, and references

**When to Use:**

- Starting new features
- Planning complex refactors
- Creating detailed bug reports
- Documenting technical debt

**Related Commands:** `/work` to execute the plan

---

### `/work` - Execute Work Plans

Systematically execute work plans with isolated git worktrees and task tracking.

**Syntax:**

```bash
claude /compounding-engineering:work [PATH_TO_PLAN]
```

**Examples:**

```bash
# Execute a feature plan
claude /compounding-engineering:work docs/oauth-feature.md

# Work on a TODO item
claude /compounding-engineering:work todos/042-approved-p1-fix.md

# Execute current plan
claude /compounding-engineering:work
```

**What It Does:**

1. Updates main branch and creates feature branch
2. Uses `git-worktree-create` skill to set up isolated environment
3. Analyzes the plan and creates task breakdown
4. Executes tasks systematically with progress tracking
5. Runs tests and validation after each task
6. Prepares final commit and pull request

**Worktree Structure:**

```
.worktrees/
└── feature-oauth-authentication/
    ├── app/
    ├── spec/
    └── ... (isolated copy of repository)
```

**When to Use:**

- Implementing planned features
- Fixing bugs with detailed plans
- Working on multiple features in parallel (separate worktrees)
- Executing complex multi-step tasks

**Output:** Completed implementation in isolated worktree, ready for PR

**Related Commands:** `/plan` to create the plan, `/review` to check quality

---

### `/review` - Multi-Agent Code Review

Comprehensive code review using specialized agents and deep analysis.

**Syntax:**

```bash
claude /compounding-engineering:review [PR_NUMBER|PR_URL|FILE_PATH]
```

**Examples:**

```bash
# Review a pull request by number
claude /compounding-engineering:review 123

# Review using GitHub URL
claude /compounding-engineering:review https://github.com/owner/repo/pull/123

# Review a specific file
claude /compounding-engineering:review app/services/payment_processor.rb

# Review current changes
claude /compounding-engineering:review
```

**What It Does:**

1. Creates isolated worktree for local code inspection
2. Detects project type (Rails, TypeScript, Python)
3. Runs 10+ specialized agents in parallel:
   - Language-specific reviewers (Rails/TypeScript/Python)
   - Security vulnerability scanning
   - Performance analysis
   - Architecture assessment
   - Pattern recognition
   - Data integrity checks
4. Synthesizes findings with severity ratings
5. Presents findings for triage

**Agents Used (Rails Project):**

- `kieran-rails-reviewer` - Rails conventions
- `dhh-rails-reviewer` - DHH philosophy
- `security-sentinel` - Security vulnerabilities
- `performance-oracle` - Performance bottlenecks
- `architecture-strategist` - System design
- `data-integrity-guardian` - Database safety
- `pattern-recognition-specialist` - Anti-patterns
- `git-history-analyzer` - Code evolution
- `best-practices-researcher` - Best practices

**Output:** Categorized findings with severity (P1/P2/P3), location, and remediation steps

**When to Use:**

- Before merging pull requests
- After implementing features
- Regular code quality checks
- Pre-deployment audits

**Related Commands:** `/triage` to handle findings

---

### `/triage` - Prioritize Findings

Interactively triage findings and convert them to tracked TODO items.

**Syntax:**

```bash
claude /compounding-engineering:triage
```

**What It Does:**

1. Presents each finding one by one
2. Shows severity, category, location, and impact
3. Asks whether to create a TODO file
4. Generates properly formatted TODO markdown
5. Tracks creation progress
6. Provides summary report

**Finding Format:**

```
---
Issue #5: Missing Transaction Boundaries

Severity: 🔴 P1 (CRITICAL)
Category: Data Integrity
Location: app/controllers/concerns/google_oauth_callbacks.rb:13-50

Description: [Detailed explanation]
Problem Scenario: [Step-by-step what could go wrong]
Proposed Solution: [How to fix]
Estimated Effort: Small (< 2 hours)
---
Do you want to add this to the todo list?
1. yes - create todo file
2. next - skip this item
3. custom - modify before creating
```

**User Options:**

- **yes** - Creates `{id}-pending-{priority}-{description}.md` in `todos/`
- **next** - Skips this finding
- **custom** - Modify details before creating

**When to Use:**

- After running `/review` to handle findings
- Processing security audit results
- Organizing work items
- Prioritizing technical debt

**Output:** TODO files in `todos/` directory ready for work

**Related Commands:** `/review` to generate findings, `/resolve_todo_parallel` to fix issues

---

### `/generate_command` - Create Custom Commands

Generate new custom slash commands for repeated workflows.

**Syntax:**

```bash
claude /compounding-engineering:generate_command "command description"
```

**Examples:**

```bash
# Create a deployment command
claude /compounding-engineering:generate_command "Deploy to staging with rollback support"

# Create a testing command
claude /compounding-engineering:generate_command "Run tests for changed files only"

# Create a cleanup command
claude /compounding-engineering:generate_command "Clean up unused dependencies and files"
```

**What It Does:**

1. Analyzes the requested workflow
2. Researches relevant tools and patterns
3. Creates structured command markdown
4. Saves to `.claude/commands/{name}.md`
5. Makes command immediately available

**Best Practices:**

- Be specific about what the command should do
- Include success criteria (tests pass, etc.)
- Reference existing code patterns
- Use `$ARGUMENTS` placeholder for dynamic inputs

**When to Use:**

- Automating repetitive tasks
- Creating team-specific workflows
- Building project-specific shortcuts
- Codifying standard procedures

**Output:** New slash command file in `.claude/commands/`

---

### `/resolve_todo_parallel` - Batch Resolve TODOs

Resolve multiple TODO items using parallel processing.

**Syntax:**

```bash
claude /compounding-engineering:resolve_todo_parallel
```

**What It Does:**

1. Scans `todos/` directory for unresolved items
2. Analyzes dependencies between TODOs
3. Creates execution plan with Mermaid diagram
4. Spawns parallel `pr-comment-resolver` agents
5. Executes fixes in dependency order
6. Commits changes and marks TODOs resolved

**Execution Strategy:**

- Independent TODOs run in parallel
- Dependent TODOs wait for prerequisites
- Visualizes execution flow with diagram

**When to Use:**

- Batch fixing multiple issues
- Cleanup sprints
- Addressing all review findings at once
- Clearing technical debt

**Output:** All TODOs resolved with committed changes

**Related Commands:** `/triage` to create TODOs

## Agent Reference

### General-Purpose Agent Invocation

Use any specialized agent directly for focused analysis:

```bash
claude agent {agent-name} "your request"
```

### Key Agents with Examples

#### `kieran-rails-reviewer`

Expert Rails code review with strict quality standards.

**When to Use:**

- After implementing Rails features
- Modifying existing Rails code
- Creating new Rails components
- Pre-merge quality checks

**Example Usage:**

```bash
# Review a controller
claude agent kieran-rails-reviewer "Review the PostsController for Rails best practices"

# Review a service object
claude agent kieran-rails-reviewer "Check if UserRegistrationService follows our conventions"

# Review turbo stream implementation
claude agent kieran-rails-reviewer "Evaluate the turbo stream implementation in comments#create"
```

**What It Checks:**

- Rails convention compliance
- Turbo streams pattern (inline arrays vs files)
- Naming clarity (5-second rule)
- Testability of methods
- Service extraction opportunities
- Namespacing conventions
- Code simplicity vs complexity

**Output:** Detailed review with specific code examples and improvement suggestions

---

#### `security-sentinel`

Elite security specialist for vulnerability detection.

**When to Use:**

- Before deploying authentication changes
- After implementing payment processing
- Reviewing API endpoints
- Pre-release security audits

**Example Usage:**

```bash
# Audit authentication endpoints
claude agent security-sentinel "Scan user authentication endpoints for vulnerabilities"

# Check for SQL injection
claude agent security-sentinel "Review database queries in search functionality for SQL injection risks"

# Scan for exposed secrets
claude agent security-sentinel "Check codebase for hardcoded secrets or API keys"
```

**What It Checks:**

- Input validation at all entry points
- SQL injection vulnerabilities
- XSS attack vectors
- Authentication and authorization flaws
- Hardcoded secrets and credentials
- OWASP Top 10 compliance
- Security header configuration

**Output:** Security report with severity ratings and remediation steps

---

#### `performance-oracle`

Performance optimization and scalability expert.

**When to Use:**

- After implementing data-heavy features
- Experiencing slow API responses
- Before launching high-traffic features
- Optimizing database queries

**Example Usage:**

```bash
# Analyze API endpoint performance
claude agent performance-oracle "Check why the reports endpoint takes 2+ seconds to respond"

# Review algorithm efficiency
claude agent performance-oracle "Analyze the user matching algorithm for scalability"

# Database query optimization
claude agent performance-oracle "Optimize the N+1 queries in the dashboard controller"
```

**What It Checks:**

- Algorithmic complexity (Big O)
- N+1 query patterns
- Database index usage
- Memory allocation and leaks
- Caching opportunities
- Performance at 10x/100x/1000x scale

**Output:** Performance analysis with bottlenecks identified and optimization recommendations

---

#### `feedback-codifier`

Converts review feedback into reusable patterns and standards.

**When to Use:**

- After giving detailed code review feedback
- Capturing new conventions to enforce
- Updating reviewer agent standards
- Codifying team knowledge

**Example Usage:**

```bash
# Codify review feedback
claude agent feedback-codifier "I gave extensive feedback on service object patterns. Update kieran-rails-reviewer to check for these in future reviews"

# Capture architectural decisions
claude agent feedback-codifier "We decided all API controllers should inherit from Api::BaseController. Add this to our standards"
```

**What It Does:**

1. Extracts core patterns from feedback
2. Categorizes insights (architecture, testing, security, etc.)
3. Formulates actionable guidelines
4. Updates reviewer agent configurations
5. Preserves existing valuable standards

**Output:** Updated agent configuration files with new standards integrated

---

#### `architecture-strategist`

System design and architectural decision analysis.

**When to Use:**

- Planning major features
- Evaluating system design changes
- Reviewing architectural decisions
- Assessing technical debt

**Example Usage:**

```bash
# Review system design
claude agent architecture-strategist "Evaluate our microservices architecture for the payment system"

# Analyze database design
claude agent architecture-strategist "Review our database schema for multi-tenancy support"
```

**What It Checks:**

- System component interactions
- Scalability and maintainability
- Design pattern appropriateness
- Technical debt implications

---

#### `best-practices-researcher`

Research and gather industry best practices.

**When to Use:**

- Learning new frameworks
- Implementing unfamiliar features
- Setting up new tools
- Establishing conventions

**Example Usage:**

```bash
# Research testing patterns
claude agent best-practices-researcher "Find React testing best practices for hooks and context"

# Research caching strategies
claude agent best-practices-researcher "Research Redis caching patterns for Rails API applications"
```

**What It Does:**

1. Searches documentation and resources
2. Identifies industry standards
3. Compares approaches
4. Recommends best practices for your context

---

#### `pattern-recognition-specialist`

Identifies design patterns and anti-patterns in code.

**When to Use:**

- Reviewing large codebases
- Identifying refactoring opportunities
- Detecting code smells
- Understanding legacy code

**Example Usage:**

```bash
# Detect anti-patterns
claude agent pattern-recognition-specialist "Identify anti-patterns in our service layer"

# Find design patterns
claude agent pattern-recognition-specialist "What design patterns are used in the notification system?"
```

## Common Workflows

### Workflow 1: Feature Development

Complete process from planning to deployment.

```bash
# Step 1: Create implementation plan
claude /compounding-engineering:plan "Add two-factor authentication"
# Output: docs/2fa-feature-plan.md

# Step 2: Execute in isolated worktree
claude /compounding-engineering:work docs/2fa-feature-plan.md
# Creates: .worktrees/feature-two-factor-authentication/
# Implements: User model changes, controller, views, tests
# Output: Ready for review

# Step 3: Run comprehensive review
cd .worktrees/feature-two-factor-authentication/
claude /compounding-engineering:review
# Runs: 10+ specialized agents
# Output: Findings categorized by severity

# Step 4: Triage findings
claude /compounding-engineering:triage
# Interactive: yes/next/custom for each finding
# Output: TODO files for approved issues

# Step 5: Fix issues if needed
claude /compounding-engineering:resolve_todo_parallel
# Output: All TODOs resolved

# Step 6: Create pull request
git push -u origin feature-two-factor-authentication
gh pr create --title "feat: Add two-factor authentication" \
  --body "Implements 2FA with TOTP support. See docs/2fa-feature-plan.md"
```

**When to Use:** Implementing any new feature from scratch

**Time Estimate:** 2-4 hours for medium features

---

### Workflow 2: Bug Fix

Rapid response to production issues.

```bash
# Step 1: Quick plan for context
claude /compounding-engineering:plan "Fix null pointer exception in payment webhook"
# Output: Understanding of issue and approach

# Step 2: Verify security implications
claude agent security-sentinel "Check payment webhook handler for vulnerabilities"
# Output: Security assessment

# Step 3: Implement fix in worktree
claude /compounding-engineering:work docs/bug-fix-plan.md
# Implements fix with tests

# Step 4: Fast review focused on regression
claude /compounding-engineering:review
# Focus: Does this break anything else?

# Step 5: Deploy
git push -u origin fix-payment-webhook-null-pointer
gh pr create --title "fix: Handle null payment_intent in webhook" \
  --label "bug,priority-high"
```

**When to Use:** Critical bug fixes, hotfixes

**Time Estimate:** 30 minutes - 2 hours

---

### Workflow 3: Refactoring

Improve code quality without changing behavior.

```bash
# Step 1: Analyze current state
claude agent pattern-recognition-specialist "Identify code smells in app/services/"
claude agent architecture-strategist "Review service layer organization"
# Output: List of issues and refactoring opportunities

# Step 2: Plan refactoring scope
claude /compounding-engineering:plan "Refactor service layer to use command pattern"
# Output: Detailed refactoring plan with phases

# Step 3: Execute phase by phase
claude /compounding-engineering:work docs/refactor-services-phase-1.md
# Implements: Base command class and infrastructure

# Step 4: Review continuously
claude /compounding-engineering:review
# Check: No behavior changes, improved structure

# Step 5: Validate with tests
# All existing tests should still pass
bundle exec rspec

# Step 6: Use code-simplicity-reviewer
claude agent code-simplicity-reviewer "Review refactored services for simplification opportunities"
# Output: Areas that can be further simplified
```

**When to Use:** Improving code maintainability, reducing technical debt

**Time Estimate:** 4-8 hours for major refactors

---

### Workflow 4: Documentation

Improve documentation quality and consistency.

```bash
# Step 1: Review with writing specialist
claude agent every-style-editor "Review README.md for clarity and Every.to style"
# Output: Specific improvements for tone and structure

# Step 2: Research documentation best practices
claude agent best-practices-researcher "Find best practices for technical documentation"
# Output: Industry standards and patterns

# Step 3: Update documentation
# Make changes based on feedback

# Step 4: Review for consistency
claude /compounding-engineering:review docs/api-documentation.md
# Check: Markdown formatting, link validity, code examples

# Step 5: Commit with clear message
git add docs/
git commit -m "docs: Improve API documentation clarity and examples"
```

**When to Use:** Documentation updates, README improvements

**Time Estimate:** 1-2 hours

---

### Workflow 5: Security Audit

Comprehensive security review.

```bash
# Step 1: Full codebase scan
claude agent security-sentinel "Perform comprehensive security audit of authentication system"
# Output: Detailed security findings

# Step 2: Triage security issues
claude /compounding-engineering:triage
# Creates: Priority-ordered TODO files for vulnerabilities

# Step 3: Fix critical issues first
ls todos/*-pending-p1-*.md
claude /compounding-engineering:work todos/042-pending-p1-sql-injection.md
# Fix critical vulnerabilities

# Step 4: Verify fixes
claude agent security-sentinel "Verify SQL injection fix in search controller"
# Output: Confirmation of remediation

# Step 5: Address medium priority items
claude /compounding-engineering:resolve_todo_parallel
# Fixes all P2/P3 items

# Step 6: Final audit
claude agent security-sentinel "Final security scan after fixes"
# Output: Clean bill of health
```

**When to Use:** Pre-release security audits, after security incidents

**Time Estimate:** 4-8 hours depending on findings

---

### Workflow 6: Performance Optimization

Identify and fix performance bottlenecks.

```bash
# Step 1: Identify bottlenecks
claude agent performance-oracle "Analyze dashboard controller for performance issues"
# Output: List of N+1 queries, slow algorithms

# Step 2: Plan optimizations
claude /compounding-engineering:plan "Optimize dashboard to load in under 500ms"
# Output: Structured optimization plan

# Step 3: Implement optimizations
claude /compounding-engineering:work docs/performance-optimization-plan.md
# Adds: Database indexes, eager loading, caching

# Step 4: Verify improvements
# Run benchmarks before and after
bundle exec rails runner scripts/benchmark_dashboard.rb

# Step 5: Review for correctness
claude /compounding-engineering:review
# Ensure: No broken functionality

# Step 6: Performance validation
claude agent performance-oracle "Verify dashboard optimizations achieve targets"
# Output: Performance metrics and assessment
```

**When to Use:** Addressing slow endpoints, scaling issues

**Time Estimate:** 2-6 hours

## Troubleshooting

### Plugin Installation Problems

**Issue:** Plugin won't install

```bash
# Check marketplace is added
claude /plugin marketplace list

# Re-add marketplace
claude /plugin marketplace remove every-marketplace
claude /plugin marketplace add https://github.com/EveryInc/every-marketplace

# Try install again
claude /plugin install compounding-engineering
```

**Issue:** Plugin installed but commands not working

```bash
# Verify plugin is active
claude /plugin list

# Use full namespace
claude /compounding-engineering:plan "test"
```

---

### Command Namespace Issues

**Issue:** Command not found

```bash
# Always works: use full namespace
claude /compounding-engineering:plan "feature"

# Create alias to avoid typing namespace
alias plan="claude /compounding-engineering:plan"
```

**Issue:** Ambiguous command name

```bash
# Multiple plugins have /review command
# Solution: Use full namespace
claude /compounding-engineering:review
```

---

### Agent Invocation Failures

**Issue:** Agent not found

```bash
# Correct syntax
claude agent kieran-rails-reviewer "review this code"

# Not this
claude agent compounding-engineering:kieran-rails-reviewer "review this code"
```

**Issue:** Agent times out

- Simplify the request
- Break into smaller chunks
- Check network connectivity

---

### Todo System Setup

**Issue:** `/triage` can't create TODO files

```bash
# Create todos directory
mkdir -p todos

# Copy template
cp plugins/compounding-engineering/todos/000-pending-p1-TEMPLATE.md todos/
```

**Issue:** TODO files have wrong format

- Use `/triage` to create them (handles formatting)
- Copy from existing TODOs as templates
- Check frontmatter YAML is valid

---

### Workspace Conflicts

**Issue:** Worktree already exists

```bash
# List worktrees
git worktree list

# Remove old worktree
git worktree remove .worktrees/feature-old-feature

# Prune stale references
git worktree prune
```

**Issue:** Can't create worktree (untracked files)

```bash
# Ensure main branch is clean
git checkout main
git stash

# Update main
git pull origin main

# Try worktree creation again
claude /compounding-engineering:work docs/plan.md
```

---

### General Issues

**Issue:** Commands are slow

- Large repositories take longer to analyze
- Use specific file paths instead of full repo scans
- Consider breaking into smaller review units

**Issue:** Inconsistent results

- Ensure you're on the correct branch
- Check git status for unexpected changes
- Verify you're in the correct worktree directory

**Issue:** Git errors during worktree operations

```bash
# Reset to clean state
git worktree prune
git worktree list
# Remove any problematic worktrees manually
```

## Configuration

All configuration is managed through the plugin system. No additional setup required.

### Optional Customizations

**Custom Command Locations:**

Commands are loaded from `.claude/commands/`. Create your own:

```bash
claude /compounding-engineering:generate_command "your custom workflow"
```

**Environment Variables:**

Some agents respect these environment variables:

- `GITHUB_TOKEN` - For GitHub API access (used by review commands)
- `OPENAI_API_KEY` - For extended AI capabilities (optional)

## Key Features

### Isolated Development with Worktrees

The plugin uses git worktrees to create isolated development environments:

```bash
claude /compounding-engineering:work "Build new feature"
# Creates: .worktrees/feature-build-new-feature/
# Isolated from main branch
# No conflicts with other work
# Easy cleanup when done
```

**Benefits:**

- Work on multiple features in parallel
- Keep main branch always deployable
- Easy rollback by removing worktree
- No git stash/unstash needed

### Integrated Workflow Automation

Commands work together seamlessly:

```bash
# Complete workflow
claude /compounding-engineering:plan "Component library"
claude /compounding-engineering:work docs/component-library-plan.md
claude /compounding-engineering:review
claude /compounding-engineering:triage
```

### Expert Analysis Agents

Specialized agents handle deep analysis:

```bash
# Architecture review
claude agent architecture-strategist "review our database design"

# Security audit
claude agent security-sentinel "audit authentication implementation"

# Performance check
claude agent performance-oracle "optimize these queries"
```

## Contributing

This plugin is part of the Every Marketplace. Contributions welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Adding New Agents

1. Create `agents/{agent-name}.md` with frontmatter
2. Update plugin.json agent count and list
3. Update README.md
4. Test the agent

### Adding New Commands

1. Create `commands/{command-name}.md`
2. Update plugin.json command count and list
3. Update README.md
4. Test the command

## Learning Resources

### Git Worktree Documentation

The git-worktree skills include comprehensive documentation:

- **Skills:** `plugins/compounding-engineering/skills/git-worktree-*/SKILL.md`
- **Examples:** `plugins/compounding-engineering/skills/git-worktree-create/examples/`
- **Script:** `plugins/compounding-engineering/skills/git-worktree-create/scripts/create-worktree.sh`

### External Resources

- [Official Git Worktree Docs](https://git-scm.com/docs/git-worktree)
- [Git Worktree Best Practices](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc)
- [Practical Guide to Git Worktree](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)

### Plugin Development

- [Claude Code Plugin Documentation](https://docs.claude.com/en/docs/claude-code/plugins)
- [Plugin Marketplace Documentation](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)
- [Plugin Reference](https://docs.claude.com/en/docs/claude-code/plugins-reference)

## Resources

- [Blog Post: My AI Had Already Fixed the Code Before I Saw It](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)
- [Every Marketplace](https://github.com/EveryInc/every-marketplace)
- [Claude Code Documentation](https://docs.claude.com/claude-code)

## License

MIT License - see LICENSE file for details

## Author

Created by Kieran Klaassen

- Email: kieran@every.to
- GitHub: [@kieranklaassen](https://github.com/kieranklaassen)
- Blog: [Every](https://every.to)

## Version History

### 1.1.0 (Current)

- Added 3 reusable skills for git worktree management
- Enhanced `/work` command to use git-worktree-create skill
- Improved workflow automation and isolation

### 1.0.0

- Initial release
- 17 specialized agents
- 6 slash commands
