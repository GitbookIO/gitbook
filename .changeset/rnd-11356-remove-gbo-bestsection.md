---
"gitbook": patch
---

Remove GBO's redundant re-selection of the best-scoring search section. The search API now returns a single highest-scoring section per page (and orders sections highest-score-first), so GBO no longer needs its own `getBestScoredResult` helper to pick the best section for the search and MCP previews. No user-visible change.
