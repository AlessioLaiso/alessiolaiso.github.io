# alessiolaiso.github.io

[alessiolaiso.com](https://alessiolaiso.com)

## Repository setup

The `source` branch is the default branch.
It contains the actual source for the web site.
When developing this is where the code needs to go.

The `master` branch contains the precompiled static site ready to be deployed.
This branch is used by github pages for deployment.

## Installation

```sh
./scripts/setup.sh
```

## Running

```sh
./scripts/start.sh
```

This script starts a webserver using live-reload with `dist` as server root.

## Deploy

```sh
./scripts/deploy.sh
```

This script builds/compiles the website into the `dist` directory, creates a new commit on the `master` branch containing the changes in `dist` and pushes on github.

## Rollback

```sh
./scripts/rollback.sh
```

This script will rollback the latest commit on the `master` branch and change its state back to the previous commit.
