#!/bin/sh
# Installs dependencies and clones the master branch into the dist folder.

set -e

npm i
rm -Rf dist
git clone git@github.com:AlessioLaiso/alessiolaiso.github.io.git -b master --single-branch dist
