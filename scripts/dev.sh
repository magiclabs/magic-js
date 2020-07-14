#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Building for development..."
echo

define_paths=$(echo -e $(yarn --silent paths))
project_paths_cjs=$(echo -e $(yarn --silent paths tsconfig.json))
project_paths_esm=$(echo -e $(yarn --silent paths tsconfig.module.json))

echo "Compiling TypeScripts for the following projects:"
node -pe "'$project_paths_cjs $project_paths_esm'.split(' ').reduce((prev, next) => prev + '\n - ' + next, '')"
echo

sleep 3

tsc-watch --onSuccess "$INIT_CWD/scripts/env.ts $define_paths" -b -w $project_paths_cjs $project_paths_esm
