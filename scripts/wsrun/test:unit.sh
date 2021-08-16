#!/usr/bin/env bash

# This script is run via `wsrun`, so it's working directory is
# relative to the package being processed.

# Increase memory limit for Node
export NODE_OPTIONS=--max_old_space_size=4096

RAW_INPUT=$1

runTests() {
  export TS_NODE_PROJECT="./test/tsconfig.json"
  npx jest $@
}

echoNoTests() {
  echo "No tests to run."
}

if [[ ! -d "./test" ]] ; then
  echoNoTests
else
  runTests
fi
