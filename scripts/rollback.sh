#!/bin/sh
# Rollback the previous deploy

set -e

git add .
git checkout master
git fetch
git reset --hard origin/master~1
git push -f
git checkout source
