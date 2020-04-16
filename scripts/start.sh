#!/usr/bin/env bash

export NODE_ENV=development
export MAGIC_URL=https://auth.magic.link

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

echo
echo "Building Magic SDK for development, pointing to $MAGIC_URL"
echo

export TS_NODE_PROJECT="webpack/tsconfig.json"
webpack --progress --colors --watch --config webpack/webpack.config.ts
