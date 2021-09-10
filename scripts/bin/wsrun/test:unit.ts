#!/usr/bin/env ts-node-script

import execa from 'execa';
import fs from 'fs';
import { runAsyncProcess } from '../../utils/run-async-process';

function existsAsync(input: string) {
  return new Promise((resolve) => {
    fs.exists(input, (exists) => {
      resolve(exists);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (await existsAsync(`${process.cwd()}/test`)) {
    await execa('yarn', ['jest', ...args], {
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
