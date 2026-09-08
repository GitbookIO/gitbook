---
"gitbook": patch
---

Fix pages resolving to "not found" when a root URL lookup resolves to a custom homepage, by no longer using the homepage pathname as a prefix for the requested page path.
