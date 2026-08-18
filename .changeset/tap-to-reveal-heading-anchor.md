---
"gitbook": patch
---

Fix heading anchor links being unreachable on touch devices by adding a tap-to-reveal state. The anchor icon now appears after the heading text without wrapping onto an orphan line while retaining its existing desktop placement. Use `pointerup` for the dismiss listener to fix unreliable dismissal on iOS Safari, and enlarge the anchor's touch tap target to a square 24px area (meeting the WCAG 2.5.8 minimum) so the icon stays centered instead of overflowing shorter headings' line height.
