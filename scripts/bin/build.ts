#!/usr/bin/env ts-node-script

import execa from 'execa';
import { runAsyncProcess } from '../utils/run-async-process';
import { handleError } from '../utils/handle-script-error';
import { printSeparator } from '../utils/print-separator';
import { getPackages, logPackages, promptForPackage } from '../utils/workspace-helpers';

async function buildPkgs(PKG: string) {
  printSeparator('Building');
  await execa('yarn', ['wsrun', '-r', '--stages', `${process.env.INIT_CWD}/scripts/bin/wsrun/build-package.ts`], {
    stdio: 'inherit',
    env: { PKG },
  })
    .then(() => console.log())
    .catch(handleError('Failed to build libraries.'));
}

async function main() {
  const PKG = await promptForPackage();
  const { packages } = await getPackages(PKG);

  console.log(`\nFound ${packages.length} packages to build:\n`);
  logPackages(packages);

  await buildPkgs(PKG);
}

runAsyncProcess(main);
