#!/usr/bin/env ts-node-script

import execa from 'execa';
import { printSeparator } from '../utils/print-separator';
import { runAsyncProcess } from '../utils/run-async-process';

async function main() {
  printSeparator('Running tests');
  const args = process.argv.slice(2);

  await execa(
    'yarn',
    ['--silent', 'wsrun', '--serial', `${process.env.INIT_CWD}/scripts/bin/wsrun/test:unit.ts`, ...args],
    {
      stdio: 'inherit',
    },
  );
}

runAsyncProcess(main);
