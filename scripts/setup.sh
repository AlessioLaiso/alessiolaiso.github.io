#!/bin/sh
# Installs dependencies and clones the master branch into the dist folder.

set -e

npm i
bower install
mkdir -p dist
if [ -d "dist/.git" ]; then
  rm -Rf dist/*
  cd dist
  git fetch
  git reset --hard origin/master
else
  rm -Rf dist
  git clone git@github.com:AlessioLaiso/alessiolaiso.github.io.git -b master --single-branch dist
fi
