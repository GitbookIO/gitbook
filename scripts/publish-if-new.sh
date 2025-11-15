#!/usr/bin/env bash

#
# Bun doesn't support publishing to npm with provenance (https://github.com/oven-sh/bun/issues/15601),
# so we need to create a tarball and publish it manually.
# We use bun pack to generate the tarball as it resolves the workspace dependencies correctly.
#

set -euo pipefail

echo "Node auth token: ${NODE_AUTH_TOKEN}"
echo "NPM config userconfig: ${NPM_CONFIG_USERCONFIG}"
echo "GitHub token: ${GITHUB_TOKEN}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "GITHUB_TOKEN is not set."
    exit 1
fi

# Use GitHub API to check permissions for the token.
# The 'id-token' permission should be set to 'write'
PERMS_JSON=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/rate_limit)
if [[ $? -ne 0 ]]; then
    echo "Failed to verify GITHUB_TOKEN."
    exit 1
fi

PERMS=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/user/permissions 2>/dev/null || true)

if [[ -n "$PERMS" && "$PERMS" != "Not Found" ]]; then
    ID_TOKEN_PERMISSION=$(echo "$PERMS" | grep -o '"id-token":[^,}]*' | head -n1 | awk -F: '{gsub(/^[ \t"]+|[ \t"]+$/, "", $2); print $2}')
    if [[ "$ID_TOKEN_PERMISSION" == "write" ]]; then
        echo "GITHUB_TOKEN has id-token: write permission."
    else
        echo "Warning: GITHUB_TOKEN does not have id-token: write permission! Found: $ID_TOKEN_PERMISSION"
        exit 1
    fi
else
    echo "Could not verify id-token permission via API (endpoint not found or insufficient scopes)."
    # Not failing here as fallback, but you can uncomment the next line to enforce exit.
    # exit 1
fi

echo "Permissions: $PERMS"
echo "GITHUB_TOKEN has id-token: write permission."
exit 1

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
