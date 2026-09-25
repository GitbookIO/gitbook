---
"gitbook": patch
---

Fix previewed customization and theme overrides being lost when navigating between pages inside the site preview. The preview cookie was scoped to the site's canonical base path instead of the preview route it is actually served under, so the browser dropped it on the next in-preview navigation.
