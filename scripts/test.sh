#!/usr/bin/env bash

echo
echo "Running unit tests..."
echo

# Turn a glob (`$1`) into a list of absolute file paths. The glob should be
# relative to the active `$PKG` directory.
glob() {
  ../../scripts/glob.js $1
}

# `cd` into the relevant project directory and set the appropriate TSCONFIG
# file.
setPackage() {
  cd ./packages/$1
  export TS_NODE_PROJECT="./test/tsconfig.json"
}

# Run tests for the project directory given by `$1`.
runTests() {
  setPackage $1
  input=$(echo $(glob $2))
  npx nyc --reporter=lcov --reporter=text-summary ava $input
  cd ../.. # Return to the original working directory
}

# Print a message indicating no tests are available for the given `$PKG`.
echoNoTests() {
  echo "No tests to run in package \`$PKG\`"
}

export NODE_ENV=test

case $PKG in
  "@magic-sdk/provider")
    runTests provider $1
    ;;

  "@magic-sdk/types")
    echoNoTests
    ;;

  "@magic-sdk/react-native")
    runTests react-native $1
    ;;

  "magic-sdk")
    runTests web $1
    ;;

  *)
    runTests provider $1
    runTests react-native $1
    runTests web $1
    ;;
esac
