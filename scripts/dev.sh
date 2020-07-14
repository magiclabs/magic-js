#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building CommonJS files for development..."
echo

define_paths=$(echo -e $(yarn --silent paths))
project_paths=$(echo -e $(yarn --silent paths tsconfig.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$project_paths'.split(' ').reduce((prev, next) => prev + '\n - ' + next, '')"
echo

sleep 3

tsc-watch --onSuccess "$INIT_CWD/scripts/env.ts $define_paths" -b -w $project_paths
# tsc-watch --onSuccess "echo here" -b -w $project_paths
