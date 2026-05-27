---
"gitbook": patch
---

Make `Tooltip` content non-interactive when `disableHoverableContent` is set, so its portaled popper wrapper no longer steals pointer events (e.g. hover-revealed controls) from the trigger.
