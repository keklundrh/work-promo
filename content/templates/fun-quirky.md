<!--
TEMPLATE: fun-quirky
Use when:  team wins, promotions, milestones, celebrations
Voice:     energetic, personal. Emoji and "!" welcome; @mention real handles from the draft only.
Reference: content/examples/008.md (celebration shape), content/examples/005.md (amplify CTA)

HOW TO USE (agent)
1. Copy everything below the --- into content/announcements/YYYY-MM-DD-<slug>.md.
2. Replace {{SLOTS}} with facts from the draft. Playful phrasing is fine; invented facts are not (AGENTS.md § Grounding rules).
3. Delete blocks marked OPTIONAL that the draft doesn't fill.
4. Strip all HTML comments from the output, then run the AGENTS.md quality bar and report gaps.
-->

---

<!-- tone: fun-quirky -->
<!-- template: content/templates/fun-quirky.md -->

## Top-level post

:raised_hands: :tada:

Hey {{AUDIENCE_HANDLE}}!

**{{TITLE}}**: {{ONE_LINE_SUMMARY}} {{CELEBRATION_LINE}}

:arrow_right: {{PRIMARY_LINK_LABEL}}: {{PRIMARY_LINK}}

{{CTA}}

## Thread reply

The story, for those who want it:

{{STORY_PARAGRAPH}}

**All links**
{{LINK_LIST}}

<!-- OPTIONAL — delete if the draft has no share push -->
:loudspeaker: Help us spread the word: {{SHARE_TARGET}}

Questions? Ping {{CONTACT}}.
