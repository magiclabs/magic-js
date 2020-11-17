#!/usr/bin/env bash

CLEAN_DIST=true
CLEAN_CACHE=false
CLEAN_TEST_ARTIFACTS=false
CLEAN_NODE_MODULES=false
SHOW_HELP=false

# ---------------------------------------------------------------------------- #

set -e
while test $# -gt 0; do
  case "$1" in
    -cache | --cache)
      CLEAN_CACHE=true
      shift
      ;;

    -test-artifacts | --test-artifacts)
      CLEAN_TEST_ARTIFACTS=true
      shift
      ;;

    -deps | --deps)
      CLEAN_NODE_MODULES=true
      shift
      ;;

    -help | --help | -h)
      SHOW_HELP=true
      shift
      ;;

    *)
      break
      ;;
  esac
done

# ---------------------------------------------------------------------------- #

if [ $SHOW_HELP = true ]; then
  __usage="
    Usage: yarn clean [OPTIONS]

    Options:
      --cache                   Remove cache files.

      --test-artifacts          Remove coverage reports.

      --deps                    Remove node_modules (from all packages).

      -h, --help                Show this message. No cleaning happens if
                                this flag is present.
  "

  echo "$__usage"

  exit 0
fi

# ---------------------------------------------------------------------------- #

msg() {
  echo
  boxen --border-color cyan --dim-border --padding 1 "Cleaning $1..."
  echo
}

if [ $CLEAN_DIST = true ]; then msg "build files" && yarn wsrun --parallel -r rimraf dist ; fi
if [ $CLEAN_CACHE = true ]; then msg "caches" && yarn wsrun --parallel -r rimraf node_modules/.cache ; fi
if [ $CLEAN_TEST_ARTIFACTS = true ]; then msg "test artifacts" && (yarn wsrun --parallel -r rimraf coverage) && (yarn wsrun --parallel -r rimraf .nyc_output) ; fi
if [ $CLEAN_NODE_MODULES = true ]; then msg "node_modules" && yarn wsrun --parallel -r rimraf node_modules && rimraf node_modules ; fi
