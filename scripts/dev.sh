#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building for development..."
echo

pkg_paths=$(echo -e $(yarn --silent paths))
tsconfig_paths=$(echo -e $(yarn --silent paths tsconfig.json tsconfig.module.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$tsconfig_paths'.split(' ').reduce((prev, next) => prev + '\n  - ' + next, '')"
echo

sleep 3

tsc-watch --onSuccess "$INIT_CWD/scripts/env.ts $pkg_paths" -b -w $tsconfig_paths
