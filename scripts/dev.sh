#!/usr/bin/env bash

LOCAL_MAGIC_PORT=3014
LOCAL_MGBOX_PORT=3016

export NODE_ENV=development
export VERSION=$(node -pe "require('./lerna.json')['version']")
export ENV="process.env.VERSION=$VERSION"

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

echo
echo "Building Magic SDK packages for development."
echo


if [ $PKG ] ; then
  lerna exec --scope $PKG -- yarn dev
else
  lerna run dev
fi

