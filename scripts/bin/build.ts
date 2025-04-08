#!/usr/bin/env ts-node

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

  try {
    console.log(`Running build for package: ${PKG}`);
    console.log(`Command: pnpm --filter ${PKG} --recursive ${wsrunConcurrency} exec ${process.cwd()}/scripts/bin/wsrun/build-package.ts`);
    
    const result = await execa('pnpm', ['--filter', PKG, '--recursive', wsrunConcurrency, 'exec', `${process.cwd()}/scripts/bin/wsrun/build-package.ts`], {
      stdio: 'inherit',
      env: { PKG, DEBUG: 'true' },
    });
    
    console.log('Build completed successfully');
    return result;
  } catch (error) {
    console.error('Build failed with error:', error);
    handleError('Failed to build libraries.')(error);
    throw error;
  }
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
