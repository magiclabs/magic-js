#!/usr/bin/env bash

echo
echo "Running unit tests..."
echo

export TS_NODE_PROJECT="test/tsconfig.json"
npx nyc --reporter=lcov --reporter=text-summary ava
