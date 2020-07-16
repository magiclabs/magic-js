#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building TypeScripts..."
echo

tsconfig_paths=$(echo -e $(yarn --silent paths tsconfig.json tsconfig.module.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$tsconfig_paths'.split(' ').reduce((prev, next) => prev + '\n  - ' + next, '')"
echo

tsc -b $tsconfig_paths
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

pkg_paths=$(echo -e $(yarn --silent paths))

$INIT_CWD/scripts/env.ts $pkg_paths
echo
