#!/bin/sh
# Builds the project, creates a new commit and pushes it to github.

set -e

./scripts/setup.sh
docker run \
  -v $(pwd):/app:cached \
  --rm \
  --name alessiolaiso.github.io-deploy \
  alessiolaiso.github.io \
  ash -c "gh auth login && gh auth setup-git && npm run deploy"
