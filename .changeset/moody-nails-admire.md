---
"gitbook": patch
---

Persist content selection (tabs and other `select` blocks) in localStorage only, dropping the `?select=` query parameter from the URL. A tab click still writes the tab's hash, so a copied URL lands on that tab and reactivates it on load.
