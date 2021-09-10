#!/usr/bin/env ts-node-script

import execa from 'execa';
import { printSeparator } from '../utils/print-separator';
import { runAsyncProcess } from '../utils/run-async-process';
import { promptForPackage } from '../utils/workspace-helpers';

async function main() {
  const PKG = await promptForPackage();

  printSeparator('Running tests');
  const args = process.argv.slice(2);

  await execa('yarn', ['wsrun', '--serial', `${process.env.INIT_CWD}/scripts/bin/wsrun/test:unit.ts`, ...args], {
    stdio: 'inherit',
    env: { PKG },
  });
}

runAsyncProcess(main);
