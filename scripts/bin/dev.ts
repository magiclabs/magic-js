#!/usr/bin/env ts-node-script

import ora from 'ora';
import execa from 'execa';
import TscWatchClient from 'tsc-watch/client';
import chalk from 'chalk';
import path from 'path';
import { runAsyncProcess } from '../utils/run-async-process';
import { getTSConfigs, logTSConfigs } from '../utils/get-tsconfigs';

async function injectENV(allPkgs: string[]) {
  await execa(`${process.env.INIT_CWD}/scripts/bin/inject-env.ts`, [...allPkgs]).then(() => {
    console.log('Environment variables successfully injected!');
  });
}

async function runDevServer(tsconfigs: string[], allPkgs: string[]) {
  const spinner = ora();

  [
    [5, 0],
    [4, 1000],
    [3, 2000],
    [2, 3000],
    [1, 4000],
  ].forEach(([countdown, timeout]) => {
    if (!spinner.isSpinning) spinner.start();

    setTimeout(() => {
      spinner.text = `Starting TypeScript development server in ${countdown}...`;
    }, timeout);
  });

  setTimeout(() => {
    spinner.succeed('Starting TypeScript development server...');

    const watch = new TscWatchClient();
    watch.on('success', async () => injectENV(allPkgs));
    watch.start('-b', ...tsconfigs);
  }, 5000);
}

async function main() {
  const { tsconfigs, packages } = await getTSConfigs(['tsconfig.json', 'tsconfig.cjs.json']);

  logTSConfigs(tsconfigs);
  await runDevServer(tsconfigs, packages);
}

runAsyncProcess(main);
