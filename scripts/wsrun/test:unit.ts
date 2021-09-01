#!/usr/bin/env ts-node-script

import execa from 'execa';
import fs from 'fs';

function existsAsync(path: string) {
  return new Promise((resolve) => {
    fs.exists(path, (exists) => {
      resolve(exists);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (await existsAsync(`${process.cwd()}/test`)) {
    await execa('yarn', ['--silent', 'jest', ...args], {
      stdio: 'inherit',
      env: {
        TS_NODE_PROJECT: './test/tsconfig.json',
      },
    });
  } else {
    console.log('No tests to run.');
  }
}

main();
