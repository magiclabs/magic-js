#!/usr/bin/env bash

if [ $PKG ] ; then
  lerna exec --scope $PKG -- eslint --fix src/**/*.ts
else
  lerna exec -- eslint --fix src/**/*.ts
fi
