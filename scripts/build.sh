#!/usr/bin/env bash

echo
boxen --border-color cyan --dim-border --padding 1 "Building TypeScripts..."
echo

tsconfig_paths=$(echo -e $(yarn --silent paths tsconfig.json tsconfig.module.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$tsconfig_paths'.split(' ').reduce((prev, next) => prev + '\n  - ' + next, '')"
echo

tsc -b $tsconfig_paths
echo "TypeScripts compiled."

# ---------------------------------------------------------------------------- #

echo
boxen --border-color cyan --dim-border --padding 1 "Building CDN bundles..."
echo

echo "You can safely ignore \`The 'this' keyword is equivalent to 'undefined'\` warnings"
echo

yarn wsrun --serial $INIT_CWD/scripts/wsrun/build:cdn.sh

# ---------------------------------------------------------------------------- #

echo
boxen --border-color cyan --dim-border --padding 1 "Interpolating ENV variables..."
echo

pkg_paths=$(echo -e $(yarn --silent paths))

$INIT_CWD/scripts/inject-env.ts $pkg_paths
echo
