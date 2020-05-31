#!/usr/bin/env bash

echo
echo "Building Magic SDK packages for production."
echo

export NODE_ENV=production
export VERSION=$(node -pe "require('./lerna.json')['version']")
export ENV="process.env.VERSION=$VERSION"

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

if [ $PKG ] ; then
  lerna exec --scope $PKG -- yarn build
else
  lerna run build
fi

