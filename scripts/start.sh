#!/usr/bin/env bash

LOCAL_MAGIC_PORT=3014
LOCAL_MGBOX_PORT=3016

export NODE_ENV=development
export MAGIC_URL=https://auth.magic.link/
export MGBOX_URL=https://box.magic.link/
export SDK_NAME=$(node -pe "require('./package.json')['name']")
export SDK_VERSION=$(node -pe "require('./package.json')['version']")

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

echo
echo "Building Magic SDK for production, pointing to:"
echo
echo "    auth:    $MAGIC_URL"
echo "    mgbox:   $MGBOX_URL"
echo

export TS_NODE_PROJECT="webpack/tsconfig.json"
webpack --progress --colors --watch --config webpack/webpack.config.ts
