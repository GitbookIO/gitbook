#!/usr/bin/env bash

#
# Bun doesn't support publishing to npm with provenance (https://github.com/oven-sh/bun/issues/15601),
# so we need to create a tarball and publish it manually.
# We use bun pack to generate the tarball as it resolves the workspace dependencies correctly.
#

set -euo pipefail

DRY_RUN=false
for arg in "$@"; do
    if [[ "${arg}" == "--dry-run" ]]; then
        DRY_RUN=true
        break
    fi
done

NAME=$(node -p "require('./package.json').name")
VERSION=$(node -p "require('./package.json').version")

if npm view "${NAME}@${VERSION}" >/dev/null 2>&1; then
    echo "${NAME}@${VERSION} already published, skipping."
    exit 0
fi

# We compute the workspace root relative to this script
WORKSPACE_ROOT=$(dirname $(dirname $(realpath $0)))

# Strip development exports before packing and restore afterward.
PACKAGE_JSON_PATH="${PWD}/package.json"
PACKAGE_JSON_BACKUP=$(mktemp)
cp "${PACKAGE_JSON_PATH}" "${PACKAGE_JSON_BACKUP}"

cleanup() {
    if [[ -n "${TARBALL_PATH:-}" && -f "${TARBALL_PATH}" ]]; then
        rm -f "${TARBALL_PATH}"
    fi
    if [[ -f "${PACKAGE_JSON_BACKUP}" ]]; then
        mv "${PACKAGE_JSON_BACKUP}" "${PACKAGE_JSON_PATH}"
    fi
}

trap cleanup EXIT

node "${WORKSPACE_ROOT}/scripts/strip-development-exports.mjs" "${PACKAGE_JSON_PATH}"

# Sanitize the name to make it a valid filename as bun doesn't support @ in filenames
SANITIZED_NAME=${NAME//@/}
SANITIZED_NAME=${SANITIZED_NAME//\//-}
TARBALL_FILENAME="${SANITIZED_NAME}-${VERSION}.tgz"

bun pm pack --filename "${TARBALL_FILENAME}"

# Bun pack puts the tarball in the workspace root
TARBALL_PATH="${WORKSPACE_ROOT}/${TARBALL_FILENAME}"

if [[ ! -f "${TARBALL_PATH}" ]]; then
    echo "Failed to create tarball for ${NAME}@${VERSION}: ${TARBALL_PATH}" >&2
    exit 1
fi

# Publish with verbose logging to aid debugging
if [[ "${DRY_RUN}" == "true" ]]; then
    echo "npm publish \"${TARBALL_PATH}\" --no-workspaces --provenance"
else
    npm publish "${TARBALL_PATH}" --no-workspaces --provenance
fi
