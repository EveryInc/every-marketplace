# Follow-up routing (Phase 4)

The chat POV (the TL;DR) is the deliverable. Any implementation is outside this read-only contract. Before any handoff, apply this four-part gate: **(1)** the original prompt explicitly authorized the named downstream action, **(2)** the final result is non-stalemated, **(3)** the action remains inside the inherited scope, and **(4)** the action is non-destructive and otherwise authorized. Only when all four pass may the settled POV be handed to the owning skill without another question. Otherwise return control to the caller; a later explicit request can supply authority for a continuation. What you offer next is **reasoned from the POV and its active subject shape — never a fixed menu, and never an assumption that everything routes to a plan.**

**Compute the next step.** From the active subject shape's result and its Handoff field when present, reason about the single best next move and a one-clause why:

- **External adoption:** **Adopt** with clear scope → `ce-plan`; **Adopt** with fuzzy scope → `ce-brainstorm`; **Trial** → a timeboxed spike with `ce-work`; **Hold / Reject / Not-our-problem** → no handoff.
- **Document take:** actionable revisions → offer to apply the specific edits through the workflow that owns that document; no requested change or a Blocked result → no handoff.
- **Approach-set position:** a chosen, sufficiently defined option → proceed through the owning planning or execution workflow; a choice that still needs scope → `ce-brainstorm`; an honest toss-up or Blocked result → no handoff.

**Return without a continuation interview.** The POV or explicit blocker completes the request. When useful, name the next step and why as part of that result. Do not use a blocking menu to ask whether to start new work or produce an unsolicited report. A write-up or capture is opt-in; a consequential recommendation does not itself authorize its execution.

**On a pre-authorized handoff or later user selection:**

- **Computed next step** → after the four-part gate passes, invoke the owning skill via the platform's skill-invocation primitive, seeding it with the POV substance (the decision, conditions, requested edits or chosen approach, and verified facts). A stalemate, scope expansion, destructive action, or insufficient authority always returns to the user first.
- **Full write-up** → read `references/report.md` and follow it (HTML by default; opened locally or published via Proof / an available HTML tool). Opt-in; the default stays chat-only.
- **"compound it"** → invoke `ce-compound` with `mode:non-interactive`, seeding it with the structured POV and the fitting existing capture type (no schema change; non-interactive avoids its interactive prompts). Never mandatory.

