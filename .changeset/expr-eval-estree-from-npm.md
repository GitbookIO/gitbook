---
"@gitbook/expr": patch
---

Depend on `eval-estree-expression` from the npm registry (`^3.0.1`) instead of a pinned GitHub commit. The published `3.0.1` release is built from the exact commit the package was pinned to, so the code is unchanged — this only removes the fragile git/tarball dependency so consumers install it from npm like any other package.
