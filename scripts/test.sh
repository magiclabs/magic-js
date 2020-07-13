#!/usr/bin/env bash

# This script is run via `wsrun`, so it's working directory is
# relative to the package being processed.

RAW_INPUT=$1

runTests() {
  # Parse a glob of input test files (relative to the package directory).
  input=$(echo $($INIT_CWD/scripts/glob.ts $RAW_INPUT))

  export TS_NODE_PROJECT="./test/tsconfig.json"

  # Run tests, with coverage.
  npx nyc --reporter=lcov --reporter=text-summary  ava $input || exit 1
}

echoNoTests() {
  echo "No tests to run."
}

if [[ ! -d "./test" ]] ; then
  echoNoTests
else
  runTests
fi
