---
"gitbook": patch
---

Persist previewed customization and theme overrides when navigating between pages inside the site preview, by sending the preview cookie with `SameSite=None; Secure` in production so it is not dropped inside the cross-site preview iframe.
