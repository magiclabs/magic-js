#!/usr/bin/env bash

echo
echo "Building Magic SDK packages for production."
echo

export NODE_ENV=production
export WEB_VERSION=$(node -pe "require('./packages/web/package.json')['version']")
export REACT_NATIVE_VERSION=$(node -pe "require('./packages/react-native/package.json')['version']")
export ENV="process.env.WEB_VERSION=$WEB_VERSION,process.env.REACT_NATIVE_VERSION=$REACT_NATIVE_VERSION"

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

if [ $PKG ] ; then
  lerna exec --scope $PKG -- yarn build
else
  lerna run build
fi

