#!/usr/bin/env bash

# This script is run via `wsrun`, so it's working directory is
# relative to the package being processed.

if [[ -f "./tsconfig.cdn.json" ]] ; then
  microbundle build src/index.cdn.ts \
    --tsconfig tsconfig.cdn.json \
    --target web \
    --jsx React.createElement \
    --format iife \
    --sourcemap false \
    --external none \
    --output $(node -pe "require('./package.json')['umd:main']") \
    --name $(node -pe "require('./package.json').umdGlobal")
else
  echo "CDN bundle not required."
fi

