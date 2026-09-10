#!/usr/bin/env bash

set -o errexit
set -o pipefail

# Generate assets that the server loads by URL instead of bundling.
bun run generate:assets

# Copy the assets
gitbook-icons ./public/~gitbook/static/icons custom-icons
gitbook-math ./public/~gitbook/static/math
cp -r ../embed/standalone/ ./public/~gitbook/static/embed

# Generate the types
wrangler types
