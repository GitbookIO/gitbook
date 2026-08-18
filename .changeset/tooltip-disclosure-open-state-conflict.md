---
"gitbook": patch
---

Fix chevrons and open-state styling incorrectly reacting to a tooltip opening on the same trigger, by switching from the shared Base UI `data-popup-open` attribute to `aria-expanded`.
