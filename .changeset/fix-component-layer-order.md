---
"gitbook": patch
---

Declare the Tailwind layer order in each component stylesheet, so a route whose first stylesheet is one of them still puts `base` before `components` and preflight does not strip their padding and borders.
