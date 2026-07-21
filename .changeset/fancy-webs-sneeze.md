---
"gitbook": patch
---

Add the client-side `select` store foundation: a recency-ordered list of selected slugs, persisted in localStorage and shareable via `?select=`, applied to `<html>` before first paint so the right content variant renders with no flash. Internal groundwork — no user-visible feature yet.
