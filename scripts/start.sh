#!/usr/bin/env bash

LOCAL_MAGIC_PORT=3014
LOCAL_MGBOX_PORT=3016

export NODE_ENV=development
export MAGIC_URL=https://auth.magic.link/
export MGBOX_URL=https://mgbox.io/
export SDK_NAME=$(node -pe "require('./package.json')['name']")
export SDK_VERSION=$(node -pe "require('./package.json')['version']")

set -e
while test $# -gt 0; do
  case "$1" in
    -ip | --ip)
      export MAGIC_URL=http://$(ipconfig getifaddr en0):$LOCAL_MAGIC_PORT/
      export MGBOX_URL=http://$(ipconfig getifaddr en0):$LOCAL_MGBOX_PORT/
      shift
      ;;

    -local | --local)
      export MAGIC_URL=http://localhost:$LOCAL_MAGIC_PORT/
      export MGBOX_URL=http://localhost:$LOCAL_MGBOX_PORT/
      shift
      ;;

    *)
      break
      ;;
  esac
done

echo
echo "Building Magic SDK for production, pointing to:"
echo
echo "    auth:    $MAGIC_URL"
echo "    mgbox:   $MGBOX_URL"
echo

export TS_NODE_PROJECT="webpack/tsconfig.json"
webpack --progress --colors --watch --config webpack/webpack.config.ts
