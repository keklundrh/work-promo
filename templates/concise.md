<!--
TEMPLATE: concise
Use when:  reminders, links-only shares, quick nudges
Voice:     plain and short. The headline does the work; links go up front.
Reference: examples/004.md (top-level brevity), examples/002.md (link line format)

HOW TO USE (agent)
1. Copy everything below the --- into announcements/YYYY-MM-DD-<slug>.md.
2. Replace {{SLOTS}} with facts from the draft. Never invent (AGENTS.md § Grounding rules).
3. Delete blocks marked OPTIONAL that the draft doesn't fill.
4. Customer-facing links only in the top-level post; internal-only links go to the thread reply.
5. Strip all HTML comments from the output, then run the AGENTS.md quality bar and report gaps.
-->

---

<!-- tone: concise -->
<!-- template: templates/concise.md -->

## Top-level post

:pushpin: **{{TITLE}}**: {{ONE_LINE_SUMMARY}}

{{LINK_LIST_SHORT}}

{{CTA}}

## Thread reply

<!-- OPTIONAL — delete if the draft has no extra detail -->
{{THREAD_DETAIL}}

Questions or feedback? Reach out to {{CONTACT}}.
