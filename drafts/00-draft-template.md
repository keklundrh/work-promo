# How to write a draft announcement — start here

This file is the **authoring guide and copy-paste skeleton** for humans. It is
not a draft itself.

Two different kinds of templates live in this repo — don't mix them up:

| | Who uses it | What it is |
|---|---|---|
| `drafts/00-draft-template.md` (this file) | **You**, the author | Input skeleton: raw material the AI needs |
| `templates/` | **The AI agent** | Output templates: serious, fun/quirky, concise Slack formats |

## The flow

1. **Copy the skeleton** (everything below `THE SKELETON`) into a new file in
   this folder, e.g. `drafts/ai-quickstarts.md`. One file per announcement topic.
2. **Fill it in.** Only real facts: the AI is not allowed to invent names, dates,
   numbers, quotes, or links. Whatever you write here is the single source of truth.
3. **Missing something?** Leave `TBD`. `TBD` is fine in a draft — it just means
   the AI will flag it as a gap. (`TBD` in `announcements/` is never fine.)
4. **Tell the agent**, e.g.:
   > Make an announcement from `drafts/ai-quickstarts.md`, tone: serious.
5. The AI picks the matching template, writes the Slack announcement (top-level
   post + thread reply) to `announcements/YYYY-MM-DD-<slug>.md`, and reports any
   remaining gaps.
6. **Review the output**, fix the gaps, copy it into Slack. The draft stays here
   as your source of record — keep or delete, it's scratch space.

## The rules, in one box

- **Target is Slack.** Email examples in `examples/` are reference only.
- **Shape is always the same:** high-level top-level post (everything you need to
  know + the key link) with the detail in a thread reply — so people can comment
  directly. See `examples/002.md` for the model.
- **The AI invents nothing.** Facts, quotes (verbatim), and attributions come
  from you, here or in chat.
- **Output is a markdown file.** Nothing is ever posted anywhere by the AI.
- **Minimum viable draft:** what it is, one link, who it's for, tone, contact.
  Everything else is nice-to-have — raw notes are fine too; the AI will ask for
  whatever's missing.

## Section guide

| Section | Required? | Feeds |
|---|---|---|
| Basics | yes | Template + tone choice, opening line of the post |
| Links | yes (≥1) | Top-level post link + thread-reply link list |
| Why it matters | recommended | The `:white_check_mark:` bullets |
| Quotes | optional | Social-proof block (verbatim only) |
| Resources | optional | Thread-reply long list (FAQs, channels, videos) |
| Call to action | recommended | Closing line of the top-level post |
| Contact | recommended | "Questions? Reach out to …" line |

---

## THE SKELETON — copy everything below the line into a new draft

<!-- ✂️ copy from here -->

# DRAFT: <announcement title>

## Basics

<!-- tone: serious | fun-quirky | concise — pick one; if unsure, leave blank and the AI defaults to serious -->
<!-- audience: who is this post for? e.g. Sales Specialists, AI BU, partners -->
<!-- post date: YYYY-MM-DD or TBD -->

- Product / asset name:
- One-line summary: <!-- what is new, in one sentence a stranger understands -->
- Announcement date:

## Links

<!-- Every link that may appear in the announcement. One per row. -->
<!-- Label it and mark the audience; the template decides whether it leads the -->
<!-- top-level post or sits in the thread reply (internal-only links never lead). -->
<!-- Leave emoji blank to let the AI pick, or specify e.g. :rocket: -->

| Label | URL | Audience | Emoji |
|---|---|---|---|
| <!-- e.g. Blog post --> | | <!-- customer-facing / internal / partner --> | |

## Why it matters

<!-- One bullet per benefit. Concrete beats vague: numbers, dates, outcomes. -->

-
-

## Quotes

<!-- Verbatim only, exact attribution as given. Delete this section if none. -->

> "<quote>"
> — <name, title>

## Resources (thread-reply detail)

<!-- The long list: FAQs, Slack channels, blogs, podcasts, enablement, demos. -->

-
-

## Call to action

<!-- What should readers do: share, amplify, bookmark, reply in thread? -->

-

## Contact

<!-- Who fields questions? Shown at the end of the announcement. -->

-

## Notes for the AI

<!-- Anything else: context, constraints, things NOT to say, related past -->
<!-- announcements, links that must go together. Delete if empty. -->

-
