#!/usr/bin/env ts-node-script

import execa from 'execa';
import isCI from 'is-ci';
import { runAsyncProcess } from '../utils/run-async-process';
import { handleError } from '../utils/handle-script-error';
import { printSeparator } from '../utils/print-separator';
import { getPackages, printPackages, promptForPackage } from '../utils/workspace-helpers';
import { printEnvironment } from '../utils/environment';

async function buildPkgs(PKG: string) {
  printSeparator('Building');

  // We need to limit concurrency in CI to avoid ENOMEM errors.
  const wsrunConcurrency = isCI ? '--serial' : '--stages';

  await execa('yarn', ['wsrun', '-r', wsrunConcurrency, `${process.env.INIT_CWD}/scripts/bin/wsrun/build-package.ts`], {
    stdio: 'inherit',
    env: { PKG },
  })
    .then(() => console.log())
    .catch(handleError('Failed to build libraries.'));
}

async function main() {
  const PKG = await promptForPackage();
  const { packages } = await getPackages(PKG);

  console.log(`\nFound ${packages.length} packages to build:`);
  printPackages(packages);

  console.log(`\nBuilding with the following environment:`);
  printEnvironment();

  await buildPkgs(PKG);
}

runAsyncProcess(main);
