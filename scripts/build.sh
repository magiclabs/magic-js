#!/usr/bin/env bash

export NODE_ENV=production
export MAGIC_URL=https://auth.magic.link/
export MGBOX_URL=https://box.magic.link/
export SDK_NAME=$(node -pe "require('./package.json')['name']")
export SDK_VERSION=$(node -pe "require('./lerna.json')['version']")

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

echo
echo "Building packages for production, pointing to:"
echo
echo "    auth:    $MAGIC_URL"
echo "    mgbox:   $MGBOX_URL"
echo

if [ $PKG ] ; then
  lerna exec --scope $PKG -- yarn build
else
  lerna run build
fi

