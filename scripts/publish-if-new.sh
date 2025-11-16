#!/usr/bin/env bash

#
# Bun doesn't support publishing to npm with provenance (https://github.com/oven-sh/bun/issues/15601),
# so we need to create a tarball and publish it manually.
# We use bun pack to generate the tarball as it resolves the workspace dependencies correctly.
#

set -euo pipefail

env

echo "Node auth token: ${NODE_AUTH_TOKEN}"
echo "NPM config userconfig: ${NPM_CONFIG_USERCONFIG}"

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

if npm view "${NAME}@${VERSION}" >/dev/null 2>&1; then
    echo "${NAME}@${VERSION} already published, skipping."
    exit 0
fi

# Sanitize the name to make it a valid filename as bun doesn't support @ in filenames
SANITIZED_NAME=${NAME//@/}
SANITIZED_NAME=${SANITIZED_NAME//\//-}
TARBALL_FILENAME="${SANITIZED_NAME}-${VERSION}.tgz"

bun pm pack --filename "${TARBALL_FILENAME}"

# We compute the workspace root relative to this script
WORKSPACE_ROOT=$(dirname $(dirname $(realpath $0)))

# Bun pack puts the tarball in the workspace root
TARBALL_PATH="${WORKSPACE_ROOT}/${TARBALL_FILENAME}"

if [[ ! -f "${TARBALL_PATH}" ]]; then
    echo "Failed to create tarball for ${NAME}@${VERSION}: ${TARBALL_PATH}" >&2
    exit 1
fi

# Clean up the tarball
trap 'rm -f "${TARBALL_PATH}"' EXIT

npm publish "${TARBALL_PATH}" --no-workspaces --provenance
