# Phase 1: Agent Consistency Review

**Codex Analysis Results**

## Frontmatter Structure

- **Mixed metadata fields:** `feedback-codifier.md` adds `model` and `color`, `pr-comment-resolver.md` adds only `color`, and `every-style-editor.md` adds a comma-separated `tools` string, while the rest expose only `name`/`description`. Pick a shared schema (e.g., `model`, `color`, `tools` as YAML lists) or document why certain agents diverge so downstream parsers stay stable.
- **Inline example blobs:** Files like `architecture-strategist.md`, `best-practices-researcher.md`, `code-simplicity-reviewer.md`, `data-integrity-guardian.md`, `pattern-recognition-specialist.md`, `performance-oracle.md`, `repo-research-analyst.md`, and `security-sentinel.md` embed every `<example>` inside a single-line `description` with literal `\n` escapes, which is brittle; convert those descriptions to block scalars (`|`) plus a dedicated `examples:` array like the Kieran reviewers use.
- **Capitalization drift:** Only the Kieran reviewers define an `Examples:` key (capitalized) inside the frontmatter, so consumers must handle two shapes (`description`-embedded vs. `Examples`). Normalize on a lower-case `examples` list everywhere.
- **Malformed spacing:** `pr-comment-resolver.md`'s description runs sentences together (`...made.user:`), and `every-style-editor.md`'s `tools` list is a single string instead of YAML list items, both of which will break straightforward YAML parsing.

## Description Patterns

- **Missing usage examples:** `every-style-editor.md` gives no `<example>` / `<commentary>` pair at all, so there's no canonical triggering pattern for tooling or operators to consult.
- **Duplicated assistant lines:** Each Kieran reviewer example repeats the `assistant:` utterance before and after the `<commentary>` block, unlike the single-response structure everywhere else; tighten those to one turn.
- **Compressed context blocks:** Many descriptions place `Context`, `user`, and `assistant` on one physical line separated by escaped `\n`, which is hard to skim and easy to break when editing. Split these into multi-line YAML block text so editors can diff them sanely.
- **Inconsistent quoting:** `feedback-codifier.md` mixes single-quoted and double-quoted dialogue, while `pr-comment-resolver.md` omits spaces between sentences; adopt a uniform `"quoted string"` pattern to keep examples grep-able.

## Compounding Alignment

- **`every-style-editor.md`:** Focuses on enforcing house style but never states how that accelerates compounding engineering (e.g., faster knowledge transfer, reusable editorial patterns). Add an explicit paragraph tying style compliance to reusable engineering narratives.
- **`pr-comment-resolver.md`:** Describes closing review comments but not how resolutions are captured for future agents; highlight how it feeds improvements back into reviewer prompts or playbooks.
- **`performance-oracle.md`:** Frames work as point-in-time tuning without mentioning how findings should become reusable performance budgets, heuristics, or regression guards—spell that out to show compounding value.
- **`security-sentinel.md`:** Presents a standalone audit checklist; add guidance on logging discovered vulns/patterns into a shared knowledge base or updating other agents' safeguards so security learning compounds.

## Tone & Formatting

- **Stylistic whiplash:** The Kieran reviewers lean on all-caps headings and emoji (e.g., "## 1. EXISTING CODE MODIFICATIONS - BE VERY STRICT", 🔴/✅), whereas peers like `architecture-strategist.md` use calm prose. Decide whether heightened tone is intentional or bring them closer to the broader voice.
- **Section layout drift:** Some agents (`performance-oracle.md`, `security-sentinel.md`) use Markdown headings with tiered `##`/`###`, others rely on numbered lists, and a few (`every-style-editor.md`) are pure bullet catalogues. Consider a common scaffold (`Role`, `When to use`, `Process`, `Output`) for easier scanning.
- **Tooling references:** Files such as `best-practices-researcher.md` and `framework-docs-researcher.md` mention Context7/Web search but omit a `tools` declaration, while `every-style-editor.md` lists tools no other agent acknowledges. Align references so capability expectations are clear.

## Clarity & Consistency Opportunities

- **Adopt a shared template:** For each agent, structure content as: frontmatter (with block `description` + `examples` array), `Role`, `Workflow`, `Quality Bar`, `Output Format`. This would immediately smooth the current per-agent variability.
- **State compounding impact explicitly:** Add a short "Compounding Contribution" paragraph describing how the agent's output feeds future work (e.g., updating other prompts, enriching playbooks, informing dashboards).
- **Standardize output sections:** Only a subset (e.g., `code-simplicity-reviewer.md`) specifies an explicit markdown template for responses. Providing a concise output contract for every agent will make orchestration predictable.
- **Normalize reference tooling:** If agents need Context7, Task, or other MCP tools, declare them uniformly in frontmatter and reinforce usage expectations in the body so operators know which capabilities are assumed.
- **Tidy YAML readability:** Replace inline escape sequences with readable multi-line text, ensure consistent spacing between keys, and keep dialogue blocks indented. This will cut copy/paste errors and make future reviews faster.
