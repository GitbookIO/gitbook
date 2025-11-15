#!/usr/bin/env bash

set -euo pipefail

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

if npm view "${NAME}@${VERSION}" >/dev/null 2>&1; then
    echo "${NAME}@${VERSION} already published, skipping."
    exit 0
fi

TARBALL=$(bun pm pack --quiet --dirname ./.publish)

npm publish "${TARBALL}" --no-workspaces --provenance
