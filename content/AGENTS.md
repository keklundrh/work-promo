# AGENTS.md — Rules for AI-assisted announcement writing
Scope: this file governs AI agents working on announcement content under `content/`.
Folders with a different agent purpose (e.g. application code) get their own
AGENTS.md; the nearest AGENTS.md to the files being edited wins.

This repository produces internal product-promotion announcements for **Slack**.
An AI agent reads raw material in `content/drafts/`, applies a template from
`content/templates/`, and produces a finished announcement in
`content/announcements/`, using `content/examples/` as the standard for what
"good" looks like.

## Repository layout

| Folder | Contents | Rules |
|---|---|---|
| `content/examples/` | Real announcements that performed well (numbered `NNN.md`) | Read-only reference. Never edit or delete. |
| `content/templates/` | Blank templates per tone: serious, fun-quirky, concise | Read-only scaffolding. Never edit unless asked. |
| `content/drafts/` | Drafts + the authoring guide `00-draft-template.md` (not an announcement; never process it) | Scratch space. Agents may create and edit files here. |
| `content/announcements/` | Finished, ready-to-post announcements | Final output only. Never leave placeholders or TBD here. |

## Workflow

1. **Read the brief.** Start with the draft file the user points to in `content/drafts/`.
   If the user names no draft, ask which one.
2. **Pick a template.** Match tone to content; see [Tone selection](#tone-selection).
   If the user specifies a tone, it wins.
3. **Study one or two examples** of the same shape before writing (see the example
   index below). Match their structure and voice, not their content.
4. **Write the announcement** into `content/announcements/` using the file format below.
5. **Check against the quality bar** before presenting it.
6. Announce the result: file path, template used, and any gaps the user must fill.

## Example index

| Example | Shape |
|---|---|
| `002.md`, `004.md`, `005.md` | Canonical: high-level top-level post + detailed thread reply |
| `001.md`, `003.md` | Multi-item roundup (assets, customer stories) |
| `008.md` | Fun/quirky, personal news |
| `006.md`, `007.md` | Email / long-form reference — NOT the Slack target format |

## Announcement structure (Slack)

Every announcement has exactly two parts:

1. **Top-level post** — the announcement itself. Self-contained: someone who reads
   only this understands what launched, why it matters, and where to click. Includes
   the primary links and the call to action.
2. **Thread reply** — the detail layer. Expanded context, full resource list,
   enablement, contacts. This is where people who want depth (or want to reply)
   go, which keeps the top-level post scannable.

Rules for both:

- Lead with one or two emoji + a headline sentence stating what is new.
- Use Slack emoji codes (`:rocket:`, `:link:`, `:white_check_mark:`) as visual
  bullets and section markers, as in the examples.
- Bold the first mention of the product or asset name.
- Every claim of value gets a concrete fact (number, date, quote) or it gets cut.
- Close the top-level post with a clear call to action (share, amplify, bookmark)
  and a questions/contact line, as in `004.md` and `005.md`.
- Never split one announcement across multiple top-level posts; use the thread.

## Tone selection

| Tone | Use when | Feel |
|---|---|---|
| Serious | Launches, releases, subscription/pricing, partner-facing | Confident, factual, minimal emoji |
| Fun/quirky | Team wins, promotions, milestones, celebrations | Energetic, celebratory (`008.md`) |
| Concise | Reminders, links-only shares, nudges | A few lines, links up front |

When tone is ambiguous, default to **serious** and say so.

## File format

- `content/drafts/`: one file per topic, any structure the author likes.
- `content/announcements/YYYY-MM-DD-<slug>.md`, e.g. `content/announcements/2026-11-11-ai-quickstarts-launch.md`.

Each announcement file uses this skeleton:

```markdown
<!-- tone: serious | fun-quirky | concise -->
<!-- template: content/templates/<name>.md -->

## Top-level post

<the Slack top-level message>

## Thread reply

<the Slack thread reply>
```

Content between the `##` headers must be paste-ready for Slack. Keep the two
comment lines at the top; they record provenance.

## Grounding rules (hard constraints)

- **Never invent facts.** Product names, dates, numbers, quotes, attributions,
  and links come only from the draft or from the user in conversation.
- Missing link, date, or name → use `TBD` in a **draft** and list it as a gap in
  your summary. A file in `content/announcements/` with `TBD` in it is not done.
- Do not add offers, roadmap claims, or customer names that are not in the source.
- Quotes must be verbatim from the draft, with the attribution exactly as given.
- Do not post to Slack or send anything anywhere. Output is files only.

## Quality bar (check before presenting)

- [ ] Top-level post is self-contained and scannable; detail lives in the thread reply.
- [ ] Every link in the draft appears exactly once, in the right layer.
- [ ] Call to action and contact line present.
- [ ] Emoji used as structure, not decoration noise.
- [ ] Tone matches the chosen template; no mixed registers.
- [ ] No invented facts, no placeholders left in `content/announcements/`.
- [ ] Filename follows `YYYY-MM-DD-<slug>.md`.
