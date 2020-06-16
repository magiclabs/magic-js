#!/usr/bin/env bash

echo
echo "Running unit tests..."
echo

# Run tests for the project directory given by `$1`.
runTests() {
  # Set the package directory and TSConfig file.
  cd ./packages/$1
  export TS_NODE_PROJECT="./test/tsconfig.json"

  # Parse a glob of input test files (relative to the package directory).
  input=$(echo $(../../scripts/glob.js $2))

  # Run tests, with coverage.
  npx nyc --reporter=lcov --reporter=text-summary ava $input

  # Return to the original working directory
  cd ../..
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
