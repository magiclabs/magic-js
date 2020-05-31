#!/usr/bin/env bash

echo
echo "Cleaning up generated files..."
echo

CLEAN_DIST=true
CLEAN_CACHE=false
CLEAN_TEST_ARTIFACTS=false
CLEAN_NODE_MODULES=false

set -e
while test $# -gt 0; do
  case "$1" in
    -cache | --cache)
      CLEAN_CACHE=true
      shift
      ;;

    -test | --test)
      CLEAN_TEST_ARTIFACTS=true
      shift
      ;;

    -deps | --deps)
      CLEAN_NODE_MODULES=true
      shift
      ;;

    *)
      break
      ;;
  esac
done

if [ $PKG ] ; then
  if [ $CLEAN_DIST = true ]; then lerna exec --scope $PKG -- rimraf dist ; fi
  if [ $CLEAN_CACHE = true ]; then lerna exec --scope $PKG -- rimraf node_modules/.cache ; fi
  if [ $CLEAN_TEST_ARTIFACTS = true ]; then lerna exec --scope $PKG -- rimraf coverage && rimraf .nyc_output ; fi
  if [ $CLEAN_NODE_MODULES = true ]; then lerna exec --scope $PKG -- rimraf node_modules ; fi
else
  if [ $CLEAN_DIST = true ]; then lerna exec -- rimraf dist ; fi
  if [ $CLEAN_CACHE = true ]; then lerna exec -- rimraf node_modules/.cache ; fi
  if [ $CLEAN_TEST_ARTIFACTS = true ]; then lerna exec -- rimraf coverage && rimraf .nyc_output ; fi
  if [ $CLEAN_NODE_MODULES = true ]; then lerna exec -- rimraf node_modules ; fi
fi
