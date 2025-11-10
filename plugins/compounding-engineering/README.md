# Compounding Engineering Plugin

AI-powered development tools that get smarter with every use. Make each unit of engineering work easier than the last.

## Philosophy

**Each unit of engineering work should make subsequent units of work easier—not harder.**

This plugin embodies the compounding engineering philosophy by providing AI agents, commands, hooks, and reusable skills that improve your workflow with every use.

## What's Included

- **17 Specialized Agents** - AI experts for specific engineering tasks
- **6 Slash Commands** - Quick workflow automation
- **3 Reusable Skills** - Git worktree management for isolation and parallelization

## Installation

### From Marketplace

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

## Slash Commands

Quick access to common workflows:

1. **`/plan`** - Create detailed GitHub issue plans from feature descriptions
2. **`/work`** - Execute work plans with task tracking and git worktree isolation
3. **`/review`** - Deep code review with multi-agent quality assessment
4. **`/triage`** - Triage and prioritize findings and decisions
5. **`/generate_command`** - Generate new custom slash command templates
6. **`/resolve_todo_parallel`** - Resolve TODO comments using parallel processing

## Specialized Agents

### Code Review Specialists

- **kieran-rails-reviewer** - Rails/Ruby expert code review with strict quality standards
- **kieran-typescript-reviewer** - TypeScript expert code review with high quality bar
- **kieran-python-reviewer** - Python expert code review with strict quality standards
- **dhh-rails-reviewer** - Brutally honest Rails review from DHH philosophy perspective
- **code-simplicity-reviewer** - Code simplification and YAGNI principles

### Architecture & Design

- **architecture-strategist** - System design and architectural decision analysis
- **pattern-recognition-specialist** - Design pattern and anti-pattern identification

### Quality & Performance

- **performance-oracle** - Performance optimization and scalability analysis
- **security-sentinel** - Security vulnerability detection and remediation
- **data-integrity-guardian** - Database migration and data safety review

### Analysis & Research

- **git-history-analyzer** - Git history and code evolution analysis
- **repo-research-analyst** - Repository structure and organization analysis
- **best-practices-researcher** - Research and gather best practices
- **framework-docs-researcher** - Framework and library documentation research

### Workflow & Feedback

- **feedback-codifier** - Convert feedback into actionable patterns
- **pr-comment-resolver** - Address code review comments systematically

### Documentation

- **every-style-editor** - Every.to writing style and voice editing

## Reusable Skills

Model-invoked skills for git worktree management:

### git-worktree-create
Creates isolated git worktrees for PRs, feature branches, or experiments.

**Auto-invoked when:**
- Setting up `/work` command
- Creating feature branches
- Establishing isolated environments

**Features:**
- Smart branch naming conventions
- Directory structure management
- `.gitignore` automation
- Environment verification

### git-worktree-manage
Manages worktree lifecycle: list, switch, cleanup.

**Auto-invoked when:**
- Checking worktree status
- Cleaning up completed work
- Navigating between worktrees

**Features:**
- List active worktrees
- Inspect worktree state
- Remove completed worktrees
- Prune stale references

### git-worktree-best-practices
Provides naming conventions and organizational patterns.

**Auto-invoked when:**
- Planning worktree workflows
- Establishing team conventions
- Organizing repository structure

**Features:**
- Semantic naming conventions
- Organizational patterns
- Workflow guidance
- Team standards

## Usage Examples

### Quick Code Review

```bash
claude /review
```

### Start New Feature Work

```bash
claude /work "Add user authentication"
# Automatically creates isolated worktree
# Generates task list
# Starts execution
```

### Create Implementation Plan

```bash
claude /plan "Refactor payment processing"
```

### Research Best Practices

```bash
claude agent best-practices-researcher "find React testing best practices"
```

### Analyze for Security Issues

```bash
claude agent security-sentinel "review user authentication endpoints"
```

## Compounding Engineering Workflow

1. **Plan** → Use `/plan` to understand work
2. **Delegate** → Use agents and commands for implementation
3. **Assess** → Use `/review` and agents for quality
4. **Codify** → Update processes and skills with learnings

## Key Features

### Isolated Development with Worktrees

The plugin uses git worktrees to create isolated development environments:

```bash
claude /work "Build new feature"
# Creates: .worktrees/feature-build-new-feature/
# Isolated from main branch
# No conflicts with other work
# Easy cleanup when done
```

### Integrated Workflow Automation

Commands work together seamlessly:

```bash
# Plan the work
claude /plan "Component library implementation"

# Execute with isolation
claude /work "Component library implementation"
# (uses git-worktree-create skill)

# Review the work
claude /review

# Triage findings
claude /triage
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

## Configuration

All configuration is managed through the plugin system. No additional setup required.

## Learning Resources

### Git Worktree Documentation
The git-worktree-skills include comprehensive documentation and examples:

- **Skills**: `plugins/compounding-engineering/skills/git-worktree-*/SKILL.md` - Full skill documentation
- **Examples**: `plugins/compounding-engineering/skills/git-worktree-create/examples/` - Practical examples
- **Script**: `plugins/compounding-engineering/skills/git-worktree-create/scripts/create-worktree.sh` - Automation tool

### External Resources
- [Official Git Worktree Docs](https://git-scm.com/docs/git-worktree)
- [Git Worktree Best Practices (GitHub Gist)](https://gist.github.com/ChristopherA/4643b2f5e024578606b9cd5d2e6815cc)
- [Practical Guide to Git Worktree (DEV.to)](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)

### Related Commands
- `/work` - Execute work plans with git-worktree-create skill
- `/review` - Deep code review with quality assessment

## Contributing

This plugin is part of the Every Marketplace. Contributions welcome!

## License

MIT License - see LICENSE file for details

## Author

Created by Kieran Klaassen

- Email: kieran@every.to
- GitHub: [@kieranklaassen](https://github.com/kieranklaassen)
- Blog: [Every](https://every.to)

## Resources

- [Blog Post: My AI Had Already Fixed the Code Before I Saw It](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)
- [Every Marketplace](https://github.com/EveryInc/every-marketplace)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Git Worktrees Guide](https://git-scm.com/docs/git-worktree)

## Version History

### 1.1.0 (Current)
- Added 3 reusable skills for git worktree management
- Enhanced `/work` command to use git-worktree-create skill
- Improved workflow automation and isolation

### 1.0.0
- Initial release
- 17 specialized agents
- 6 slash commands
