---
name: write-pr-description
description: Write a concise, product-focused PR description from the changes and available discussion. Use when asked for a PR summary or description.
---

# Write a PR description

Read the full branch diff and commit history against the PR's base branch, not just the latest commit. Use the PR discussion and linked issues for context when available. The PR's changes are the source of truth for what ships if an issue describes something different.

Write for contributors and reviewers who may not know the area. Lead with what changes, prefer user or product impact when supported, and include implementation details only when they help review. Keep the proposed changes short, using bullets only when useful.

Include relevant validation and screenshots when available. Do not claim checks passed unless they ran. Use only information appropriate for a public repository; do not copy private issue details or customer information into the description.

## Template and changelog

Read `.github/pull_request_template.md` immediately before writing. Preserve its required section names and order. Include `Proposed changes` and `Changelog`; omit `Demo` when there is nothing to show. Add optional `Context` before `Changelog` only when it meets the rule below.

Write a short changelog entry describing what shipped. Use `[Feature]` for user-facing additions or improvements, `[Fix]` for user-facing bug fixes, and `[Chore]` for internal maintenance. For features and fixes, say what users can do or what no longer goes wrong in plain words. Keep chores useful to teammates without inventing user impact. Remove unused examples and placeholders. Usually one entry is enough; use more only for distinct changes. The PR changelog does not replace any changeset required by `AGENTS.md`.

## Optional context

Write `Proposed changes` and `Changelog` first. Add `Context` only when it tells someone unfamiliar with the area something material that the changelog does not. `Problem` names a concrete failure or limitation supported by the PR or discussion. `Outcome` names what this PR delivers at its actual scope. Omit the section if either field would repeat the changelog, describe only implementation, or guess at an impact.

```markdown
## Context

**Problem:** <concrete failure or limitation>

**Outcome:** <result delivered by this PR>
```

Keep each field to 1–2 short, non-technical sentences. Prefer user or product impact when supported. For infrastructure changes, explain the failure or limitation they caused. Do not invent an actor, customer segment, ownership, or impact, or force the change into a user story. Do not turn a preparatory change into a claim that the whole workflow is fixed. Keep the roles distinct: `Context` explains why this matters, `Changelog` says what shipped, and `Proposed changes` can explain implementation.

Examples:

- A dependency bump with no demonstrated user effect needs no `Context`.
- If creating the first change request leaves the user on an empty screen, say that it now opens after creation. Leave the animation-listener details in `Proposed changes`.
- If a PR indexes links for later checks, describe the indexing result. Do not claim every link has already been checked.

## Writing pass

- Use plain words and direct verbs: "use" instead of "leverage", "help" instead of "facilitate". Prefer active voice when the actor is known.
- Name the concrete behavior instead of saying "improves the experience" or "makes it more robust". Support performance claims with measurements.
- Cut filler, promotional language, and generic conclusions. If a sentence could fit almost any PR, make it specific or delete it.
- Keep one idea per sentence and use consistent names. Remove redundant hedging without hiding real uncertainty.
- Avoid "not just X, but Y", forced groups of three, em dashes, decorative emojis, and unnecessary bold text.

Return the description in a Markdown code block unless asked to update the PR. When asked to update it, apply the description with `gh pr edit` using a body file.
