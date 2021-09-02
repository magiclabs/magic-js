#!/usr/bin/env ts-node-script

import execa from 'execa';
import { printSeparator } from '../utils/print-separator';
import { runAsyncProcess } from '../utils/run-async-process';

async function main() {
  printSeparator('Linting TypeScripts');
  await execa('yarn', ['--silent', 'wsrun', '--stages', 'eslint', '--fix', '.'], { stdio: 'inherit' });
}

runAsyncProcess(main);
