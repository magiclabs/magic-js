#!/usr/bin/env bash

echo
echo "Building Magic SDK packages for development."
echo

# `cd` into the relevant project directory.
setPackage() {
  cd ./packages/$1
}

# Run tests for the project directory given by `$1`.
buildForDev() {
  setPackage $1
  yarn run dev
  cd ../.. # Return to the original working directory
}

export NODE_ENV=development
export WEB_VERSION=$(node -pe "require('./packages/web/package.json')['version']")
export REACT_NATIVE_VERSION=$(node -pe "require('./packages/react-native/package.json')['version']")
export ENV="process.env.WEB_VERSION=$WEB_VERSION,process.env.REACT_NATIVE_VERSION=$REACT_NATIVE_VERSION"

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

case $PKG in
  "@magic-sdk/provider")
    buildForDev provider
    ;;

  "@magic-sdk/types")
    buildForDev types
    ;;

  "@magic-sdk/react-native")
    buildForDev react-native
    ;;

  "magic-sdk")
    buildForDev web
    ;;

  *)
    echo "Set the \$PKG environment variable before running \`yarn dev\`."
    exit 1
    ;;
esac
