#!/usr/bin/env bash

export NODE_ENV=development
export WEBPACK_ENV=development
export BABEL_ENV=development

export LOCAL_MAGIC_PORT=3014

set -e
while test $# -gt 0; do
  case "$1" in
    -ip | --ip)
      export MAGIC_URL=http://$(ipconfig getifaddr en0):$LOCAL_MAGIC_PORT
      shift
      ;;

    -local | --local)
      export MAGIC_URL=http://localhost:$LOCAL_MAGIC_PORT
      shift
      ;;

    -dev | --dev | -development | --development)
      export MAGIC_URL=https://auth.dev.fortmatic.com
      shift
      ;;

    -stagef | --stagef)
      export MAGIC_URL=https://auth.stagef.fortmatic.com
      shift
      ;;

    *)
      break
      ;;
  esac
done

# Fallback
if [ -z "$MAGIC_URL" ]; then
  export MAGIC_URL=https://auth.fortmatic.com
fi

echo
echo "Building Fortmatic SDK for development, pointing to $MAGIC_URL"
echo

export TS_NODE_PROJECT="webpack/tsconfig.json"
webpack --progress --colors --watch --config webpack/webpack.config.ts
