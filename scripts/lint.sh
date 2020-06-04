#!/usr/bin/env bash

echo
echo "Running the linter."
echo

if [ $PKG ] ; then
  lerna exec --scope $PKG -- eslint --fix src/**/*.ts
else
  lerna exec -- eslint --fix src/**/*.ts
fi
