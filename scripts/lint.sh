#!/usr/bin/env bash

echo
boxen --border-color cyan --dim-border --padding 1   "Linting TypeScripts..."
echo

yarn wsrun --stages eslint --fix "**/src/**/*.ts"
