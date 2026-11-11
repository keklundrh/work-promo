# work-promo

AI-assisted product-promotion announcements, targeted at **Slack**.

The standard shape: a high-level **top-level post** (everything you need to know
plus the key links) followed by a **thread reply** with the detail — so people
can comment directly and the top-level post stays scannable.

All announcement content lives under [`content/`](content/); application code
will live at the root as the repo evolves into an OpenShift web app.

## How it works

```
content/drafts/<topic>.md  ──►  content/templates/<tone>.md  ──►  content/announcements/YYYY-MM-DD-<slug>.md
   (your facts)                  (format + voice)                  (paste-ready Slack post)
```

1. **Write a draft** in `content/drafts/` using the skeleton in
   [`content/drafts/00-draft-template.md`](content/drafts/00-draft-template.md).
   Facts only — links, dates, quotes. `TBD` is fine for gaps.
2. **Ask the agent** to turn it into an announcement, optionally naming a tone.
3. **The agent** reads the draft, applies the matching template, writes the
   two-part announcement to `content/announcements/`, and reports anything missing.
4. **Review**, fill gaps, post to Slack.

The AI never invents facts, never posts anything anywhere, and never leaves
placeholders in `content/announcements/`. The rulebook for content work is
[`content/AGENTS.md`](content/AGENTS.md) — every folder with agent-driven work
gets its own AGENTS.md. Agents read it; humans only need it for the quality bar
and grounding rules.

## Folders

| Folder | What it holds |
|---|---|
| `content/examples/` | Real announcements that performed well. The reference standard. |
| `content/templates/` | Blank Slack formats the agent fills in (read-only). |
| `content/drafts/` | Your raw material. Includes `00-draft-template.md`, the authoring guide. |
| `content/announcements/` | Finished, ready-to-post output. Nothing else belongs here. |

## Templates (tone)

| File | Use for | Modeled on |
|---|---|---|
| [`content/templates/serious.md`](content/templates/serious.md) | Launches, releases, pricing, partner-facing | `content/examples/002.md`, `004.md` |
| [`content/templates/fun-quirky.md`](content/templates/fun-quirky.md) | Team wins, promotions, celebrations | `content/examples/008.md`, `005.md` |
| [`content/templates/concise.md`](content/templates/concise.md) | Reminders, links-only shares | `content/examples/004.md` |

Unsure which tone? Serious is the default.
