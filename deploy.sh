#!/bin/bash

set -o errexit
set -o pipefail

gcloud run deploy gitbook-open-test --source=. --project=getsquad-dev-samy --region=us-central1 --allow-unauthenticated
