#!/bin/bash

set -o errexit
set -o pipefail

rm -rf ./.next
rm -rf ./public/~gitbook/static/icons
rm -rf ./public/~gitbook/static/math
rm -rf ./public/~gitbook/static/embed
rm -rf ./public/~gitbook/static/mermaid
rm -rf ./public/~gitbook/static/scalar
rm -rf ./public/~gitbook/static/shiki
rm -rf ./public/~gitbook/static/translations
