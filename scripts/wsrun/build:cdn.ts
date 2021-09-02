#!/usr/bin/env ts-node-script

/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import execa from 'execa';
import fs from 'fs';
import { runAsyncProcess } from '../utils/run-async-process';

function existsAsync(path: string) {
  return new Promise((resolve) => {
    fs.exists(path, (exists) => {
      resolve(exists);
    });
  });
}

async function main() {
  if (await existsAsync(`${process.cwd()}/tsconfig.cdn.json`)) {
    /* eslint-disable prettier/prettier */
    const args = [
      'build', 'src/index.cdn.ts',
      '--tsconfig', 'tsconfig.cdn.json',
      '--target', 'web',
      '--jsx', 'React.createElement',
      '--format', 'iife',
      '--sourcemap', 'false',
      '--external', 'none',
      '--output', require(`${process.cwd()}/package.json`)['umd:main'],
      '--name', require(`${process.cwd()}/package.json`).umdGlobal,
    ];
    /* eslint-enable prettier/prettier */

    await execa('microbundle', args, { stdio: 'inherit' });
  } else {
    console.log('CDN bundle not required.');
  }
}

runAsyncProcess(main);
