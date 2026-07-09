---
"gitbook": patch
---

Fix the code-block copy button not copying (and logging a console error) in the AI Assistant embed. The async Clipboard API can be unavailable or rejected in cross-origin iframe / non-secure embed contexts; we now fall back to a legacy `execCommand('copy')` write and only show the "copied" state when the copy actually succeeds.
