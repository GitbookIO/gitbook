---
"@gitbook/react-contentkit": patch
---

Let ContentKit webframes dispatch the built-in `@ui.*` actions. Actions posted from a webframe were forwarded to the integration as a plain re-render instead of being handled, so `@ui.modal.open`, `@ui.modal.close` and `@ui.url.open` did nothing — most visibly, an integration could not close a modal from inside its own webframe.

Keep `null` values and class instances such as `Date` intact when resolving dynamic bindings in an action, instead of throwing or flattening them to `{}`.
