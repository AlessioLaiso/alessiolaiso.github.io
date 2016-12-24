#!/bin/sh
# Installs dependencies and clones the master branch into the dist folder.

set -e

npm i
bower install
mkdir -p dist
rm -Rf dist/*
if [ -d "dist/.git" ]; then
  cd dist
  git reset --hard origin/master
else
  git clone git@github.com:AlessioLaiso/alessiolaiso.github.io.git -b master --single-branch dist
fi
