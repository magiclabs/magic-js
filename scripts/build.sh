#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CommonJS files..."
echo

paths=$(echo -e $(yarn --silent paths tsconfig.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$paths'.split(' ').reduce((prev, next) => prev + '\n - ' + next, '')"
echo

tsc -b $paths
echo "TypeScripts compiled."

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building ES module files..."
echo

paths=$(echo -e $(yarn --silent paths tsconfig.module.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$paths'.split(' ').reduce((prev, next) => prev + '\n - ' + next, '')"
echo

tsc -b $paths
echo "TypeScripts compiled."

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CDN bundles..."
echo
echo "You can safely ignore \`The 'this' keyword is equivalent to 'undefined'\` warnings"
echo

yarn wsrun --serial $INIT_CWD/scripts/build:cdn.sh

echo
echo "+------------------------------------------------------------------------------+"
echo "  Interpolating ENV variables..."
echo

paths=$(echo -e $(yarn --silent paths))

$INIT_CWD/scripts/env.ts $paths
echo
