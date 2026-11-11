# AGENTS.md — Rules for app/code work in this repository

Scope: this file governs AI agents doing application/code work in this repo
(everything outside `content/`). For announcement-content work under
`content/`, see `content/AGENTS.md`. The nearest AGENTS.md to the files being
edited wins.

## Source of truth

1. GitHub issues in this repo are the **single source of truth** for what to
   build. Chat messages and PR threads are not requirements.
2. The codebase MUST match the requirements in the open issues.
   - On mismatch: update the issue **first** (comment + proposed requirement
     change), then change the code. Never hack code to match a stale issue and
     never silently rewrite requirements.
   - Stale issues are closed with a reason comment, never left open.
3. Decisions made in conversation or PR comments are written back into the
   relevant issue **before** any code change. Chat is never a second source of
   truth.

## Scope of action

4. Reading and commenting on any issue is always allowed.
5. Acting (writing code, creating files, opening/closing issues or PRs) is only
   allowed on **sub-issues linked from an EPIC**. EPICs carry the `epic` label.
6. No drive-by scope: every change must trace to a sub-issue (or an EPIC's
   acceptance criteria). No unrequested features, abstractions, refactors, or
   "improvements".
7. `main` is human-only. Agents NEVER commit or push to `main` and never merge
   PRs into it. Agents commit to `dev` or a feature branch; humans merge into
   `main`. Applies to all work in this repo, including `content/`.

## EPICs and sub-issues

8. Sub-issues are the unit of work; the EPIC is the tracker.
   - A sub-issue closes only via a merged PR that implements it and references
     the sub-issue number.
   - Sub-issues are never completed "on their own" (no closing without a PR).
   - Decision/definition sub-issues (issues that record decisions rather than
     ship code) close when the decision is recorded in the issue itself; they
     do not require a PR.
   - The EPIC closes only when all its sub-issues are closed **and** its
     acceptance criteria are demonstrably met.
9. Agents never edit EPIC scope. To change a requirement, comment on the EPIC
   proposing the change and wait for a human.

## Traceability and verification

10. Every commit and PR references the sub-issue it implements (`#123` in the
   message or PR body). Orphan changes are not allowed.
11. Nothing closes without verification evidence: run the changed surface, or
    the failing test/one-off script that proves it. Report what was run and
    what it showed.

## Documentation

12. Documentation lives in `docs/`.
13. Written for the **end consumer** (a person using the app or repo), never
    for AI.
14. No specs in docs — specifications live in issues. Usage/how-to lives only
    in docs. This pairing keeps rule 16 enforceable.
15. Concise. Every sentence earns its place.
16. No duplicate information anywhere in `docs/` — each fact has exactly one
    home.
17. Create a new doc file only for a genuinely new topic whose content is not
    already covered elsewhere; otherwise extend the existing file.

## Secrets and internal content

18. Never commit tokens, keys, or connection strings. Cluster config belongs in
    OpenShift secrets; local overrides in a gitignored `.env`.
19. Docs and code must never contain Red Hat-internal announcement content.
    Material under `content/examples/` is internal and must not be copied into
    docs, tests, screenshots, or fixtures.
