---
"gitbook": patch
---

Introduce client-side content selection (`select`): a site-wide, recency-ordered list of selected slugs, persisted in localStorage and shareable via `?select=`, applied to `<html>` before first paint so the right variant renders with no flash. All variants stay server-rendered, so pages are byte-identical for every visitor (no cache impact).

Tabs now use it: switching a tab activates its slug, and every tab group offering that slug follows, across pages. Tabs no longer write to the URL fragment (`#` returns to anchors only); deep-links into a tab still activate and scroll to it.
