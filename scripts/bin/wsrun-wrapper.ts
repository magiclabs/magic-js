#!/usr/bin/env ts-node-script

import execa from 'execa';
import { flatten } from 'lodash';
import { promptForPackage } from '../utils/workspace-helpers';
import { runAsyncProcess } from '../utils/run-async-process';

/**
 * Wraps `wsrun` with a prompt for selecting which monorepo package to use.
 */
async function main() {
  const input = process.argv.slice(2);
  let PKG: string[] = ['*'];

  if (input[0] === '--all') {
    input.shift();
  } else {
    PKG = [await promptForPackage()];
  }

  if (PKG.length === 1 && PKG[0].includes(',')) {
    PKG = PKG[0].split(',');
  }

  const args = flatten([
    '--filter',
    ...PKG.filter((p) => p !== '*').map((p) => p),
    'exec',
    `${process.cwd()}/scripts/bin/wsrun/bin.ts`,
    ...input,
  ]).filter(Boolean);

  await execa('pnpm', args as any, {
    stdio: 'inherit',
    env: {
      PKG: PKG.join(','),
      NODE_OPTIONS: '--max_old_space_size=4096',
    },
  });
}

runAsyncProcess(main);
