#!/bin/bash

set -o errexit
set -o pipefail

rm -rf ./.next
rm -rf ./public/~gitbook/static/icons
rm -rf ./public/~gitbook/static/math
rm -rf ./public/~gitbook/static/embed
