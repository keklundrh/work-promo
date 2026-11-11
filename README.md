# promo-template

AI-assisted product-promotion announcements, targeted at **Slack**.

The standard shape: a high-level **top-level post** (everything you need to know
plus the key links) followed by a **thread reply** with the detail — so people
can comment directly and the top-level post stays scannable.

## How it works

```
drafts/<topic>.md  ──►  templates/<tone>.md  ──►  announcements/YYYY-MM-DD-<slug>.md
   (your facts)         (format + voice)            (paste-ready Slack post)
```

1. **Write a draft** in `drafts/` using the skeleton in
   [`drafts/00-draft-template.md`](drafts/00-draft-template.md). Facts only —
   links, dates, quotes. `TBD` is fine for gaps.
2. **Ask the agent** to turn it into an announcement, optionally naming a tone.
3. **The agent** reads the draft, applies the matching template, writes the
   two-part announcement to `announcements/`, and reports anything missing.
4. **Review**, fill gaps, post to Slack.

The AI never invents facts, never posts anything anywhere, and never leaves
placeholders in `announcements/`. The full rulebook is
[`AGENTS.md`](AGENTS.md) — the agent reads it; humans only need it for the
quality bar and grounding rules.

## Folders

| Folder | What it holds |
|---|---|
| `examples/` | Real announcements that performed well. The reference standard. |
| `templates/` | Blank Slack formats the agent fills in (read-only). |
| `drafts/` | Your raw material. Includes `00-draft-template.md`, the authoring guide. |
| `announcements/` | Finished, ready-to-post output. Nothing else belongs here. |

## Templates (tone)

| File | Use for | Modeled on |
|---|---|---|
| [`templates/serious.md`](templates/serious.md) | Launches, releases, pricing, partner-facing | `examples/002.md`, `004.md` |
| [`templates/fun-quirky.md`](templates/fun-quirky.md) | Team wins, promotions, celebrations | `examples/008.md`, `005.md` |
| [`templates/concise.md`](templates/concise.md) | Reminders, links-only shares | `examples/004.md` |

Unsure which tone? Serious is the default.
=======
# work-promo
