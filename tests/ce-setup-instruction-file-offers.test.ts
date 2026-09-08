import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import path from "node:path"

const readRepoFile = (p: string) => readFile(path.join(process.cwd(), p), "utf8")

// The compounding directive is standing-instruction text users paste into their
// own AGENTS.md/CLAUDE.md. It exists in three always-visible places: the asset
// ce-setup inserts verbatim, the ce-compound guide a user copies from, and this
// repo's own AGENTS.md. A paraphrase in any one of them silently forks the bar,
// so the three are pinned byte-for-byte to each other.

function assetVariants(asset: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /^## (.+)\n\n([\s\S]*?)(?=\n## |\s*$)/gm
  for (const m of asset.matchAll(re)) out[m[1].trim()] = m[2].trim()
  return out
}

function guideBlockquotes(guide: string): string[] {
  const section = guide.split("## Make capture automatic")[1]?.split("\n---")[0] ?? ""
  return [...section.matchAll(/^> (.+)$/gm)].map((m) => m[1].trim())
}

describe("ce-setup instruction-file offers", () => {
  test("directive asset matches the ce-compound guide variants verbatim", async () => {
    const variants = assetVariants(await readRepoFile("skills/ce-setup/assets/compounding-directive.md"))
    expect(Object.keys(variants).sort()).toEqual(["Offer first", "Run automatically"])
    const quotes = guideBlockquotes(await readRepoFile("docs/guides/ce-compound.md"))
    expect(quotes).toEqual([variants["Offer first"], variants["Run automatically"]])
  })

  test("this repo's AGENTS.md carries the automatic variant verbatim", async () => {
    const variants = assetVariants(await readRepoFile("skills/ce-setup/assets/compounding-directive.md"))
    expect(await readRepoFile("AGENTS.md")).toContain(variants["Run automatically"])
  })

  test("both variants state the durable-knowledge bar ce-compound enforces", async () => {
    const variants = assetVariants(await readRepoFile("skills/ce-setup/assets/compounding-directive.md"))
    for (const text of Object.values(variants)) {
      for (const phrase of [
        "durable project reasoning",
        "not readily recoverable from the final code, tests, types, comments, or existing documentation",
        "recurrence, material risk, or substantial rediscovery",
        "if the learning document disappeared",
        "Completion, effort, and diff size alone are not enough",
        "tracked, committed knowledge",
      ]) {
        expect(text).toContain(phrase)
      }
    }
  })

  test("Step 9 inserts the asset verbatim, only on approval, and never creates the file", async () => {
    const fixes = await readRepoFile("skills/ce-setup/references/repo-fixes.md")
    const step = fixes.split("### Step 9:")[1] ?? ""
    expect(step).toContain("assets/compounding-directive.md")
    expect(step).toMatch(/verbatim/)
    expect(step).toMatch(/do not paraphrase/i)
    expect(step).toMatch(/only on approval/i)
    expect(step).toMatch(/never creates one/i)
    expect(step).toMatch(/never the `<root>` placeholder/)
    expect(step).toMatch(/git tracks at least one file under the resolved `<root>\/solutions\/`/)
    expect(step).toMatch(/untracked or gitignored directory is not evidence/)
    expect(step).toMatch(/already carries a standing instruction to invoke `ce-compound`/)
    const skill = await readRepoFile("skills/ce-setup/SKILL.md")
    expect(skill).toContain("Steps 4-9")
  })

  // The chat-register directive is the always-on path for ce-noslop's
  // agent-reporting register: the skill is not in context when an agent writes
  // a reply, so the instruction-file line has to carry the boundary, the
  // register, and the exclusions on its own. No guide copies it yet, so the
  // asset is pinned here byte-for-byte; a paraphrase forks the bar.
  const NOSLOP_DIRECTIVE =
    "Before you write a report, summary, or handoff to the user, invoke the `ce-noslop` skill in author mode and hold its tests while you write. " +
    "This applies when you are the top-level agent writing to the user, not when you are a subagent reporting to its caller. " +
    "Do not apply it to code, config, verbatim quotes, or text the user asked to post as written. " +
    "If the skill is unavailable, apply its tests yourself: say what a thing does, not how it feels; cut any sentence that could move to another project unchanged; name the actor; keep one idea per sentence; lead with the outcome; gloss any identifier a reader without the code open cannot act on. " +
    "Lead with the outcome, and write no acknowledgement, no offer of more help, and no narration of your own process."

  test("noslop directive asset carries the pinned standing instruction verbatim", async () => {
    const variants = assetVariants(await readRepoFile("skills/ce-setup/assets/noslop-directive.md"))
    expect(Object.keys(variants)).toEqual(["Standing instruction"])
    expect(variants["Standing instruction"]).toBe(NOSLOP_DIRECTIVE)
    expect(NOSLOP_DIRECTIVE.length).toBeLessThan(900)
    expect(NOSLOP_DIRECTIVE).toContain("invoke the `ce-noslop` skill")
    expect(NOSLOP_DIRECTIVE).not.toMatch(/\/ce-noslop/)
  })

  test("Step 9 offers the noslop directive verbatim beside the compounding directive", async () => {
    const fixes = await readRepoFile("skills/ce-setup/references/repo-fixes.md")
    const step = fixes.split("### Step 9:")[1] ?? ""
    expect(step).toContain("assets/noslop-directive.md")
    expect(step).toMatch(/\*\*Chat-register directive\.\*\*/)
    expect(step).toMatch(/Report all three outcomes/)
    const skill = await readRepoFile("skills/ce-setup/SKILL.md")
    expect(skill).toContain("the chat-register directive for `ce-noslop`")
  })

  test("Step 9 skips the noslop offer only when all three parts are already covered", async () => {
    const fixes = await readRepoFile("skills/ce-setup/references/repo-fixes.md")
    const step = fixes.split("### Step 9:")[1] ?? ""
    // covers all three parts -> skip
    expect(step).toMatch(
      /Skip the offer only when the file already carries an instruction that covers all three parts of the bundled one: the report boundary \(.*\), the outcome-first register \(.*\), and the exclusions \(.*\)\./,
    )
    // partial (boundary only, or a generic "write plainly") -> offer
    expect(step).toMatch(/A partial instruction, such as one naming only the boundary or a generic "write plainly"/)
    // unrelated or none -> offer
    expect(step).toMatch(/or an unrelated writing rule still gets the offer/)
    expect(step).toMatch(/Offer it whenever this step runs\./)
  })
})
