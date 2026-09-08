---
name: ce-noslop
description: "Rewrite, check, or draft prose so it reads plainly on the first read and carries no AI writing patterns, without changing what it says. Use when the user asks to make text plainer, humanize it, remove AI-sounding writing, or check whether it reads as machine-written; when a draft is wanted from supplied content; and when a skill about to compose a PR body, plan, finding, or reply names this skill. Use ce-promote for channel-specific marketing copy."
argument-hint: "[mode:author|edit|detect] [text, file path, or nothing]"
---

# Write without slop

Prose that carries no AI tells and that a reader understands on the first read, with every claim the source made still there. Both goals hold at once: text that is free of tells but still dense has failed, and text that is plain but drops a qualifier has failed.

**Done:** the mode's output is returned, every claim, number, name, quote, and citation in the input survives, and nothing was added that the source or the caller did not supply.

**Boundaries:** never touch code blocks, quoted text, frontmatter, link targets, identifiers, or a token the caller's own contract requires, unless the user names that content as the thing to fix. Never say whether text was written by a model. Write a named file in place only when the request asks for that; otherwise return the text.

## Mode

Take a `mode:` token when one is given. Otherwise: no draft means **author**; an imperative on a draft means **edit**; a question about a draft means **detect**.

- **author.** Hold the tests below while the caller writes; return nothing. When handed content and asked to write, draft it under the same tests.
- **edit.** Rewrite and return the text plus one line saying what changed. A second pass on the returned text changes nothing.
- **detect.** Name each pattern found, quote the line, give the fix in a few words. Do not rewrite.

For edit and detect, and for an author passage the tests alone do not settle, read `references/patterns.md`. On text that is not English, apply the tests only, and open the summary line by saying the pattern catalog did not apply.

## Register

Pick by who reads the result. The caller's own interaction contract wins over any line here.

- **Agent reporting to the user.** Lead with the outcome. No acknowledgement, no offer of more help, nothing about the agent's own process.
- **Repo or team artifact.** Neutral. Match the surrounding document's idiom. No first person, no opinion the artifact does not need. This is the default when no reader is named.
- **The user's own writing.** Preserve voice; make the minimum effective edit. Understandability edits stop at sentence splits and actor restoration that keep the user's word choice.

## The tests

Apply these to every sentence, in author mode as constraints and in edit or detect mode as checks.

1. **Mechanism.** Does the sentence say what the thing does, or how it feels? Replace the feeling with the fact it displaced, or cut the sentence.
2. **Portability.** Could the sentence move to another project unchanged? Then it carries no fact about this one.
3. **Actor.** Who does the verb? Name them. Keep the passive only when naming the actor adds nothing.
4. **One idea.** Would the reader backtrack? Split the sentence.
5. **Density.** One device proves nothing. Three or more distinct patterns in a passage, or one repeated across passages, is a finding.
6. **Decision first.** Does the first sentence carry the outcome the reader needs?
7. **Reader.** Can someone without the document or the code open act on this? Gloss the identifier or name the consequence.

Shorten sentences, not content. Keep exact identifiers, paths, commands, thresholds, and domain terms.
