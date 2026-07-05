---
"gitbook": patch
---

Add a `data-testid` to the admin toolbar so e2e tests can assert its presence while hiding it from visual screenshots (it animates open, causing flaky diffs).
