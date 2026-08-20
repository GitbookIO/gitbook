---
"gitbook": patch
---

Fix code block syntax highlighting so comment delimiters (e.g. `//`, `/*`) use the same color as the rest of the comment. Previously the delimiter fell through to the generic punctuation scope, making it a different color from the comment body (most visible in dark mode).
