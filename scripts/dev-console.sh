#!/bin/sh
# Installs dependencies.

set -e

./scripts/setup.sh
docker run --rm -it -v $(pwd):/app:cached --name alessiolaiso.github.io-dev-console alessiolaiso.github.io