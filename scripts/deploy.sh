#!/bin/sh
# Builds the project, creates a new commit and pushes it to github.

set -e

./scripts/setup.sh
npm run deploy
cd dist
git add -A
git commit -m "Deployed on $(date -u -R)"
git push origin master
