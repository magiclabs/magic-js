#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CommonJS files..."
echo

tsc -b $(yarn --silent paths)

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building ES module files..."
echo

tsc -b $(yarn --silent paths tsconfig.module.json)

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CDN bundles..."
echo "  (You can safely ignore \`The 'this' keyword is equivalent to 'undefined'\`"
echo "   warnings"
echo

yarn wsrun --serial $INIT_CWD/scripts/build:cdn.sh
