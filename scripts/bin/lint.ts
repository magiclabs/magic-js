#!/usr/bin/env ts-node-script

import execa from 'execa';
import { printSeparator } from '../utils/print-separator';
import { runAsyncProcess } from '../utils/run-async-process';
import { promptForPackage } from '../utils/workspace-helpers';

async function main() {
  const PKG = await promptForPackage();

  printSeparator('Linting TypeScripts');
  await execa('yarn', ['wsrun', '--serial', 'eslint', '--fix', './**/*.ts', '.'], {
    stdio: 'inherit',
    env: { PKG },
  });
}

runAsyncProcess(main);
