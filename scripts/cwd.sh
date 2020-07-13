#!/usr/bin/env bash

# This script is run via `wsrun`, so it's working directory is
# relative to the package being processed.

node -pe "require('path').relative(process.env.INIT_CWD, process.cwd()) + ('$1' ? '/$1' : '');"
