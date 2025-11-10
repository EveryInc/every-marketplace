# /compounding-engineering:plan

## Goal

Transform any feature description, bug report, or improvement idea passed in through `#$ARGUMENTS` into a GitHub-ready markdown issue that follows project conventions, includes actionable structure, and clearly states acceptance criteria, metrics, and references.

## Prerequisites

- `claude` CLI installed, authenticated, and allowed to call `/compounding-engineering:plan`.
- GitHub CLI (`gh`) configured with permissions to read labels and create issues in the target repository.
- Access to the repository (including `CLAUDE.md`, docs, and architecture references) plus write access to drafts or issue trackers.
- The supporting Task agents `repo-research-analyst`, `best-practices-researcher`, and `framework-docs-researcher` available so they can run in parallel when requested.
- A concise yet complete problem statement ready to pass as `claude /compounding-engineering:plan "#$ARGUMENTS"`.
- Optional but recommended: alias `alias plan="claude /compounding-engineering:plan"` for quick reuse.

## Workflow

1. **Invoke the planner**  
   Run the command with a short but descriptive summary of the feature or bug.  
   ```bash
   claude /compounding-engineering:plan "Add user authentication with OAuth"
   ```

2. **Gather repository context**  
   Think first, then run parallel research tasks to capture every relevant convention:  
   ```bash
   Task repo-research-analyst(#$ARGUMENTS)
   Task best-practices-researcher(#$ARGUMENTS)
   Task framework-docs-researcher(#$ARGUMENTS)
   ```  
   - Document findings with explicit file paths (e.g., `app/services/example_service.rb:42`).  
   - Capture external references, prior issues/PRs, and any norms identified in `CLAUDE.md`.  
   - Maintain a checklist of resources to cite later.

3. **Plan the issue structure**  
   - Title & categorization: draft searchable titles (`feat:`, `fix:`, `docs:`), choose labels via `gh label list`, and note the issue type.  
   - Stakeholder analysis: list who is affected (end users, SRE, QA) and assess required expertise.  
   - Content planning: select the detail tier (Minimal, More, A Lot), outline required sections, gather screenshots/logs, and prepare reproducible steps or mock filenames.

4. **Choose the implementation detail level**  
   - **📄 MINIMAL (Quick Issue)** — ideal for simple bugs or tight fixes.  
     - Include core problem statement, acceptance criteria, and essential context.  
     - Template:  
       ````markdown
       [Brief problem/feature description]

       ## Acceptance Criteria

       - [ ] Core requirement 1
       - [ ] Core requirement 2

       ## Context

       [Any critical information]

       ## MVP

       ### test.rb

       ```ruby
       class Test
         def initialize
           @name = "test"
         end
       end
       ```

       ## References

       - Related issue: #[issue_number]
       - Documentation: [relevant_docs_url]
       ````
   - **📋 MORE (Standard Issue)** — default for most collaborative work.  
     - Adds motivation, technical considerations, dependencies, and success metrics.  
     - Template:  
       ```markdown
       ## Overview

       [Comprehensive description]

       ## Problem Statement / Motivation

       [Why this matters]

       ## Proposed Solution

       [High-level approach]

       ## Technical Considerations

       - Architecture impacts
       - Performance implications
       - Security considerations

       ## Acceptance Criteria

       - [ ] Detailed requirement 1
       - [ ] Detailed requirement 2
       - [ ] Testing requirements

       ## Success Metrics

       [How we measure success]

       ## Dependencies & Risks

       [What could block or complicate this]

       ## References & Research

       - Similar implementations: [file_path:line_number]
       - Best practices: [documentation_url]
       - Related PRs: #[pr_number]
       ```
   - **📚 A LOT (Comprehensive Issue)** — for major features or architecture.  
     - Expands on phases, alternatives, risk mitigation, resources, and documentation plans.  
     - Template:  
       ```markdown
       ## Overview

       [Executive summary]

       ## Problem Statement

       [Detailed problem analysis]

       ## Proposed Solution

       [Comprehensive solution design]

       ## Technical Approach

       ### Architecture

       [Detailed technical design]

       ### Implementation Phases

       #### Phase 1: [Foundation]

       - Tasks and deliverables
       - Success criteria
       - Estimated effort

       #### Phase 2: [Core Implementation]

       - Tasks and deliverables
       - Success criteria
       - Estimated effort

       #### Phase 3: [Polish & Optimization]

       - Tasks and deliverables
       - Success criteria
       - Estimated effort

       ## Alternative Approaches Considered

       [Other solutions evaluated and why rejected]

       ## Acceptance Criteria

       ### Functional Requirements

       - [ ] Detailed functional criteria

       ### Non-Functional Requirements

       - [ ] Performance targets
       - [ ] Security requirements
       - [ ] Accessibility standards

       ### Quality Gates

       - [ ] Test coverage requirements
       - [ ] Documentation completeness
       - [ ] Code review approval

       ## Success Metrics

       [Detailed KPIs and measurement methods]

       ## Dependencies & Prerequisites

       [Detailed dependency analysis]

       ## Risk Analysis & Mitigation

       [Comprehensive risk assessment]

       ## Resource Requirements

       [Team, time, infrastructure needs]

       ## Future Considerations

       [Extensibility and long-term vision]

       ## Documentation Plan

       [What docs need updating]

       ## References & Research

       ### Internal References

       - Architecture decisions: [file_path:line_number]
       - Similar features: [file_path:line_number]
       - Configuration: [file_path:line_number]

       ### External References

       - Framework documentation: [url]
       - Best practices guide: [url]
       - Industry standards: [url]

       ### Related Work

       - Previous PRs: #[pr_numbers]
       - Related issues: #[issue_numbers]
       - Design documents: [links]
       ```

5. **Draft and format the issue**  
   - Headings: enforce hierarchy (##, ###), use emojis for quick scanning (🐛, ✨, 📚, ♻️).  
   - Code: wrap examples with language fences and note file references (`app/services/user_service.rb:42`).  
   - Rich media: attach screenshots/mockups; wrap long logs in `<details>`.  
   - Cross-references: link #issues, #PRs, commits (permalinks), @mention stakeholders, and cite external resources descriptively.  
   - AI-era considerations: record prompts used, tools invoked (Claude, Copilot), testing expectations, and highlight any AI-generated code that still needs human review.  
   - Example snippet:  
     ```markdown
     ```ruby
     # app/services/user_service.rb:42
     def process_user(user)
       # Implementation here
     end
     ```

     <details>
     <summary>Full error stacktrace</summary>

     ```
     Error details here...
     ```
     </details>
     ```

6. **Review and prepare for submission**  
   - Final checklist: searchable title, accurate labels, completed sections, working links, measurable acceptance criteria, named mock files, ERD diagram for new data models.  
   - Wrap the finished body inside `<github_issue>` tags.  
   - Use GitHub CLI to file it:  
     ```bash
     gh issue create --title "[TITLE]" --body "[CONTENT]" --label "[LABELS]"
     ```

## Success Criteria

- [ ] Issue content reflects the selected detail level (Minimal/More/A Lot) with all required sections filled.  
- [ ] Research references include concrete file paths, links, and prior work numbers.  
- [ ] Acceptance criteria and success metrics are measurable, testable, and aligned with `CLAUDE.md` standards.  
- [ ] Final markdown is wrapped in `<github_issue>` tags and ready for `gh issue create`.  
- [ ] Namespace usage remains `/compounding-engineering:plan` throughout the workflow and examples.

## Troubleshooting

- **Problem:** `claude` cannot find `/compounding-engineering:plan`.  
  **Solution:** Run `claude namespaces list` or re-authenticate to ensure access to the `/compounding-engineering` namespace.
- **Problem:** Research Task agents fail or return empty context.  
  **Solution:** Verify that each Task agent exists, rerun them individually, and seed them with clearer prompts referencing specific directories or services.
- **Problem:** Generated issue lacks required sections for the chosen detail level.  
  **Solution:** Reapply the appropriate template snippet, ensuring every heading is filled before wrapping the issue in `<github_issue>` tags.
- **Problem:** `gh issue create` rejects the payload due to formatting.  
  **Solution:** Escape quotes inside the body, or pipe the markdown via `gh issue create --body-file issue.md` after saving the generated content locally.
