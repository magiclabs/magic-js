#!/usr/bin/env ts-node-script

/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-dynamic-require */

import execa from 'execa';

/**
 * The binary which `wsrun` uses to consume inputs and run actions.
 */
async function run() {
  let [cmd, ...args] = process.argv.slice(2);

  if (cmd === 'run') {
    [cmd, ...args] = args;
  }

  cmd = require(`${process.env.INIT_CWD}/package.json`).scripts[cmd] ?? cmd;

  return execa(cmd, args, { stdio: 'inherit' });
}

run();
