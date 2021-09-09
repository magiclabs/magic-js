#!/usr/bin/env ts-node-script

import ora from 'ora';
import execa from 'execa';
import { runAsyncProcess } from '../utils/run-async-process';
import { handleError } from '../utils/handle-script-error';
import { getTSConfigs, logTSConfigs } from '../utils/get-tsconfigs';
import { printSeparator } from '../utils/print-separator';

async function buildPkgs() {
  printSeparator('Building libraries');
  await execa(
    'yarn',
    ['--silent', 'wsrun', '-r', '--serial', `${process.env.INIT_CWD}/scripts/bin/wsrun/build-package.ts`],
    {
      stdio: 'inherit',
    },
  )
    .then(() => console.log())
    .catch(handleError('Failed to build libraries.'));
}

async function injectENV(allPkgs: string[]) {
  const spinner = ora('Injecting environment variables...').start();
  const onCatch = handleError(spinner, 'Failed to inject environment variables.');

  await execa(`${process.env.INIT_CWD}/scripts/bin/inject-env.ts`, [...allPkgs])
    .then(() => {
      spinner.succeed('Environment variables successfully injected!');
    })
    .catch(onCatch);
}

async function main() {
  const { tsconfigs, packages } = await getTSConfigs(['tsconfig.json', 'tsconfig.cjs.json']);

  logTSConfigs(tsconfigs);
  await buildPkgs();
  await injectENV(packages);
}

runAsyncProcess(main);
