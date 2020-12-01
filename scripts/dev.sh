#!/usr/bin/env bash

echo
boxen --border-color cyan --dim-border --padding 1 "Building for development..."
echo

echo "🤔 Determining TypeScript projects to build..."
pkg_paths=$(echo -e $(yarn --silent paths))
tsconfig_paths=$(echo -e $(yarn --silent paths tsconfig.json tsconfig.module.json))


echo "  Compiling TypeScripts for the following projects:"
node -pe "'$tsconfig_paths'.split(' ').reduce((prev, next) => prev + '\n    - ' + next, '')"
echo

sleep 5

tsc-watch --onSuccess "$INIT_CWD/scripts/inject-env.ts $pkg_paths" -b -w $tsconfig_paths
