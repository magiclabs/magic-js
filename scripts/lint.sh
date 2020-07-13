#!/usr/bin/env bash

echo
echo "+------------------------------------------------------------------------------+"
echo "  Linting TypeScripts..."
echo

yarn wsrun --stages eslint --fix "**/src/**/*.ts"
