---
"gitbook": patch
---

Split the default-scope site search into two parallel API requests — one restricted to the current site space and one for the other site spaces — rendering each result set as soon as its response arrives. All results are ranked together by score, with the current site space scores boosted.
