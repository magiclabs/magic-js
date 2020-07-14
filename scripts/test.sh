#!/usr/bin/env bash

# This script is run via `wsrun`, so it's working directory is
# relative to the package being processed.

RAW_INPUT=$1

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

runTests() {
  # Parse a glob of input test files (relative to the package directory).
  input=$(echo $($INIT_CWD/scripts/glob.ts $RAW_INPUT))

  export TS_NODE_PROJECT="./test/tsconfig.json"

  # Run tests, with coverage.
  npx nyc --reporter=lcov --reporter=text-summary  ava -T 120000 $input || exit 1
}

echoNoTests() {
  echo "No tests to run."
}

if [[ ! -d "./test" ]] ; then
  echoNoTests
else
  runTests
fi
