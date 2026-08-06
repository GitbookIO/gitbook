---
"gitbook": patch
---

Keep Shiki out of the initial page bundle by splitting the highlighter from the plain-text token helpers, so client code no longer pulls the engine and language bundles in through a shared import.
