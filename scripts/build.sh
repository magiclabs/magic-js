#!/usr/bin/env bash

export NODE_ENV=production
export WEB_VERSION=$(node -pe "require('./packages/web/package.json')['version']")
export REACT_NATIVE_VERSION=$(node -pe "require('./packages/react-native/package.json')['version']")
export ENV="process.env.WEB_VERSION=$WEB_VERSION,process.env.REACT_NATIVE_VERSION=$REACT_NATIVE_VERSION"

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CommonJS files..."
echo

tsc -b $(yarn --silent paths)

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building ES files..."
echo

tsc -b $(yarn --silent paths tsconfig.module.json)

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CDN bundles..."
echo

yarn wsrun --serial $INIT_CWD/scripts/build:cdn.sh
