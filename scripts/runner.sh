#!/usr/bin/env bash

# This script is the binary which `wsrun` uses to consume
# inputs and run actions.

export PATH=$PWD/node_modules/.bin:$INIT_CWD/node_modules/.bin:$PATH

VERBOSE='1'
if [ "$1" == 'silent' ]; then VERBOSE=''; shift; fi
if [ "$1" == 'run' ]; then shift; fi

RUNCMD=$(node -pe "require('$INIT_CWD/package.json').scripts['$1']")

if [ "xundefined" = "x$RUNCMD" ]
then
  RUNCMD=$1
fi

BASHCMD="$RUNCMD ${@:2}"
if [ $VERBOSE ]; then echo '$' $BASHCMD; fi;
exec bash -c "$BASHCMD"
