#!/bin/sh
# Builds the project, creates a new commit and pushes it to github.

set -e

if [ ! -d "dist/.git" ]; then
  ./setup.sh
fi
npm run build
cd dist
git add -A
git commit -m "Deployed on $(date -u -R)"
git push origin master
