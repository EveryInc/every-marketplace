# /compounding-engineering:generate_command

## Goal

Create a tailored Claude CLI command definition that lives in `.claude/commands/[name].md`, guiding agents through complex engineering work with clear steps, explicit tooling, and repeatable success criteria.

## Prerequisites

- `claude` CLI installed and authenticated with access to the `/compounding-engineering` namespace.
- Write access to the current repository's `.claude/commands/` directory.
- A well-defined task description for the new command (use `#$ARGUMENTS` wherever the command should accept dynamic input).
- Familiarity with relevant project conventions in `CLAUDE.md`, including required tests, linters, and deployment practices.

## Workflow

1. **Invoke the generator**  
   Run the command with a concise description of the command you need:  
   ```bash
   claude /compounding-engineering:generate_command "Create a command to run database migrations"
   ```  
   Optional alias for repeated use: `alias gencommand="claude /compounding-engineering:generate_command"`.

2. **Describe the desired command**  
   Provide context, constraints, and expected outputs. Reference `#$ARGUMENTS` anywhere the generated command should accept user-provided values and call out required validations (tests, linting, docs).

3. **Adopt the standard structure**  
   Use the following markdown template when drafting the new command, replacing bracketed sections with command-specific details:  
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

4. **Leverage the available capabilities**  
   - **File Operations:** Read, edit, write, glob, grep, multi-edit for atomic updates.  
   - **Development:** Bash for git/tests/linters, Task for complex workflows, TodoWrite for progress tracking.  
   - **Web & APIs:** WebFetch, WebSearch, GitHub CLI, Puppeteer for research or automation.  
   - **Integrations:** AppSignal, Context7, Stripe, Todoist, Featurebase if the command interacts with those systems.

5. **Apply best practices**  
   - Be specific and clear; break down complex work into steps.  
   - Reference project examples and include verification commands.  
   - Define explicit success criteria and call out constraints (e.g., do not touch certain files).  
   - Use XML tags like `<task>`, `<requirements>`, `<constraints>` when structured prompts improve clarity.  
   - Iterate—guide the agent to plan before making large, risky changes.

6. **Use the example pattern when in doubt**  
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

7. **Save the command file**  
   Persist the finished instructions to `.claude/commands/[name].md`, review the diff, and ensure the command explicitly tells the agent to run the validations listed in the success criteria.

## Success Criteria

- [ ] Generated command markdown lives in `.claude/commands/[name].md` with an accurate title and description.
- [ ] Steps walk through actionable tasks with explicit file paths, commands, and verification guidance.
- [ ] Success checklist matches the validations the agent must run (tests, linters, documentation updates).
- [ ] Namespace references consistently use `/compounding-engineering:` and placeholders like `#$ARGUMENTS` are intentional.

## Troubleshooting

- **Problem:** `claude` cannot find `/compounding-engineering:generate_command`.  
  **Solution:** Run `claude namespaces list` to confirm access; re-authenticate if the namespace is missing.

- **Problem:** Output omits key sections (Steps, Success Criteria).  
  **Solution:** Provide a fuller description when invoking the command and reapply the standard structure template before saving.

- **Problem:** Command file does not save to `.claude/commands/`.  
  **Solution:** Verify the directory exists or create it, then re-run the generator output into the correct path.

- **Problem:** Placeholder text (`#$ARGUMENTS`, `[Command Name]`) leaks into final instructions.  
  **Solution:** Replace placeholders manually and review for lingering template markers before finalizing the file.
