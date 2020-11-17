#!/usr/bin/env bash

echo
boxen --border-color cyan --dim-border --padding 1 "Running tests..."
echo

yarn wsrun --serial $INIT_CWD/scripts/wsrun/test:unit.sh $@
