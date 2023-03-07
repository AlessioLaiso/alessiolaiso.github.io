#!/bin/sh
# Installs dependencies.

set -e

./scripts/setup.sh
docker run -p 8080:8080 \
  -p 35729:35729 \
  -v $(pwd):/app:cached \
  --rm \
  --name alessiolaiso.github.io-start \
  alessiolaiso.github.io \
  npm start