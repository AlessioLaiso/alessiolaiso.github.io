#!/bin/sh
# Installs dependencies.

set -e

docker build -t alessiolaiso.github.io .
docker run -v $(pwd):/app:cached --rm --name alessiolaiso.github.io-setup alessiolaiso.github.io npm i
