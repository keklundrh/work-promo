<!--
TEMPLATE: serious
Use when:  launches, releases, subscription/pricing, partner-facing news
Voice:     confident, factual. Emoji structure the post; at most one "!" per message.
Reference: examples/002.md (link layers + bookmark CTA), examples/004.md (why-it-matters bullets)

HOW TO USE (agent)
1. Copy everything below the --- into announcements/YYYY-MM-DD-<slug>.md.
2. Replace {{SLOTS}} with facts from the draft. Never invent (AGENTS.md § Grounding rules).
3. Delete blocks marked OPTIONAL that the draft doesn't fill; repeat :white_check_mark: lines as the draft's facts support.
4. Strip all HTML comments from the output, then run the AGENTS.md quality bar and report gaps.
-->

---

<!-- tone: serious -->
<!-- template: templates/serious.md -->

## Top-level post

{{AUDIENCE_GREETING}}

**{{TITLE}}** is now available{{DATE_PHRASE}}. {{ONE_LINE_SUMMARY}}

{{WHY_SENTENCE}}

<!-- PRIMARY_LINK must be customer-facing; internal/partner-only links go in the thread reply's All links list, never here -->
:arrow_right: {{PRIMARY_LINK_LABEL}}: {{PRIMARY_LINK}}

{{CTA}}

## Thread reply

More detail on **{{TITLE}}**:

**Why it matters**

:white_check_mark: {{BENEFIT_1}}
:white_check_mark: {{BENEFIT_2}}
:white_check_mark: {{BENEFIT_3}}

**All links**
{{LINK_LIST}}

<!-- OPTIONAL — delete if the draft has no quotes -->
**What people are saying**
:speech_balloon: "{{QUOTE}}" — {{ATTRIBUTION}}

<!-- OPTIONAL — delete if the draft has no resources -->
**Resources**
{{RESOURCES}}

Questions or feedback? Reach out to {{CONTACT}}.
