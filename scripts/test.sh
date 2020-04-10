#!/usr/bin/env bash

echo
echo "Running unit tests..."
echo

export SDK_NAME=$(node -pe "require('./package.json')['name']")
export SDK_VERSION=$(node -pe "require('./package.json')['version']")

if [ -n "$1" ]; then
  input=$(echo $(npx glob $1))
fi

export TS_NODE_PROJECT="test/tsconfig.json"
npx nyc --reporter=lcov --reporter=text-summary ava $input
