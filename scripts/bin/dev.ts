#!/usr/bin/env ts-node-script

import execa from 'execa';
import chalk from 'chalk';
import { runAsyncProcess } from '../utils/run-async-process';
import { handleError } from '../utils/handle-script-error';
import { printSeparator } from '../utils/print-separator';
import { getPackages, printPackages, promptForPackage } from '../utils/workspace-helpers';
import { printEnvironment } from '../utils/environment';

async function buildDeps(PKG: string) {
  printSeparator('Building Dependencies');

  await execa('yarn', ['wsrun', '-r', '--stages', `${process.env.INIT_CWD}/scripts/bin/wsrun/build-package.ts`], {
    stdio: 'inherit',
    env: { PKG },
  }).catch(handleError('Failed to build dependencies.'));
}

async function startDevServer(PKG: string) {
  printSeparator(chalk`Starting Dev Server for {rgb(0,255,255) ${PKG}}`);

  await execa('yarn', ['wsrun', '--serial', `${process.env.INIT_CWD}/scripts/bin/wsrun/build-package.ts`], {
    stdio: 'inherit',
    env: { PKG, DEV_SERVER: 'true' },
  })
    .then(() => console.log())
    .catch(handleError('Failed to build dependencies.'));
}

async function main() {
  const PKG = await promptForPackage({ allowAll: false });
  const { packages, dependencies } = await getPackages(PKG);

  if (dependencies.length) {
    console.log(`\nFound ${dependencies.length} dependencies to build:`);
    printPackages(packages);

    console.log(`\nBuilding with the following environment:`);
    printEnvironment();

    await buildDeps(dependencies.join(','));
  } else {
    console.log(`\nBuilding with the following environment:`);
    printEnvironment();
  }

  await Promise.all([PKG, ...dependencies].map((pkg) => startDevServer(pkg)));
}

runAsyncProcess(main);
