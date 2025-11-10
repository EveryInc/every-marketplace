# Create a Custom Claude Code Command

## Usage

```bash
# With namespace (always works)
claude /compounding-engineering:generate_command "command description"

# Example:
claude /compounding-engineering:generate_command "Create a command to run database migrations"

# Set up alias for convenience (optional)
alias gencommand="claude /compounding-engineering:generate_command"
```

Create a new slash command in `.claude/commands/` for the requested task.

## Goal

#$ARGUMENTS

## Key Capabilities to Leverage

**File Operations:**
- Read, Edit, Write - modify files precisely
- Glob, Grep - search codebase
- MultiEdit - atomic multi-part changes

**Development:**
- Bash - run commands (git, tests, linters)
- Task - launch specialized agents for complex tasks
- TodoWrite - track progress with todo lists

**Web & APIs:**
- WebFetch, WebSearch - research documentation
- GitHub (gh cli) - PRs, issues, reviews
- Puppeteer - browser automation, screenshots

**Integrations:**
- AppSignal - logs and monitoring
- Context7 - framework docs
- Stripe, Todoist, Featurebase (if relevant)

## Best Practices

1. **Be specific and clear** - detailed instructions yield better results
2. **Break down complex tasks** - use step-by-step plans
3. **Use examples** - reference existing code patterns
4. **Include success criteria** - tests pass, linting clean, etc.
5. **Think first** - use "think hard" or "plan" keywords for complex problems
6. **Iterate** - guide the process step by step

## Structure Your Command

```markdown
# [Command Name]

[Brief description of what this command does]

## Steps

1. [First step with specific details]
   - Include file paths, patterns, or constraints
   - Reference existing code if applicable

2. [Second step]
   - Use parallel tool calls when possible
   - Check/verify results

3. [Final steps]
   - Run tests
   - Lint code
   - Commit changes (if appropriate)

## Success Criteria

- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated (if needed)
```

## Tips for Effective Commands

- **Use $ARGUMENTS** placeholder for dynamic inputs
- **Reference CLAUDE.md** patterns and conventions
- **Include verification steps** - tests, linting, visual checks
- **Be explicit about constraints** - don't modify X, use pattern Y
- **Use XML tags** for structured prompts: `<task>`, `<requirements>`, `<constraints>`

## Example Pattern

```markdown
Implement #$ARGUMENTS following these steps:

1. Research existing patterns
   - Search for similar code using Grep
   - Read relevant files to understand approach

2. Plan the implementation
   - Think through edge cases and requirements
   - Consider test cases needed

3. Implement
   - Follow existing code patterns (reference specific files)
   - Write tests first if doing TDD
   - Ensure code follows CLAUDE.md conventions

4. Verify
   - Run tests:
     - Rails: `bin/rails test` or `bundle exec rspec`
     - TypeScript: `npm test` or `yarn test` (Jest/Vitest)
     - Python: `pytest` or `python -m pytest`
   - Run linter:
     - Rails: `bundle exec standardrb` or `bundle exec rubocop`
     - TypeScript: `npm run lint` or `eslint .`
     - Python: `ruff check .` or `flake8`
   - Check changes with git diff

5. Commit (optional)
   - Stage changes
   - Write clear commit message
```

Now create the command file at `.claude/commands/[name].md` with the structure above.
