#!/usr/bin/env ts-node-script

import execa from 'execa';
import { existsAsync } from '../../utils/exists-async';
import { runAsyncProcess } from '../../utils/run-async-process';

async function main() {
  const args = process.argv.slice(2);

  if (await existsAsync(`${process.cwd()}/test`)) {
    await execa('jest', args, {
      stdio: 'inherit',
      env: {
        TS_NODE_PROJECT: './test/tsconfig.json',
      },
    });
  } else {
    console.log('No tests to run.');
  }
}

runAsyncProcess(main);
