#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CommonJS files for development..."
echo

paths=$(echo -e $(yarn --silent paths tsconfig.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$paths'.split(' ').reduce((prev, next) => prev + '\n - ' + next, '')"
echo

sleep 3

tsc -b -w $paths
