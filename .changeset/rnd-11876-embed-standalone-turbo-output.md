---
"gitbook": patch
---

Fix the docs embed widget shipping a stale script: declare the embed package's `standalone/` bundle as a Turbo build output. Because it wasn't declared, changes confined to the standalone widget (which compiles to `standalone/` but not `dist/`) didn't invalidate the downstream `generate` cache that copies it into the app, so the deployed widget could lag the source — e.g. the `clipboard-write` permission on the widget iframe never reached production, breaking the copy button in the Assistant embed.
