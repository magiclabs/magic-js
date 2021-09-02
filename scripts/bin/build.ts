#!/usr/bin/env ts-node-script

import ora from 'ora';
import execa from 'execa';
import { runAsyncProcess } from '../utils/run-async-process';
import { handleError } from '../utils/handle-script-error';
import { getTSConfigs, logTSConfigs } from '../utils/get-tsconfigs';
import { printSeparator } from '../utils/print-separator';

async function compileTypeScripts(tsconfigs: string[]) {
  const spinner = ora('Compiling TypeScripts...').start();
  await execa('tsc', ['-b', ...tsconfigs])
    .then(() => {
      spinner.succeed('TypeScripts successfully compiled!');
    })
    .catch(handleError(spinner, 'TypeScripts failed to compile.'));
}

async function bundleForCDN() {
  printSeparator('Building CDN bundles');
  await execa('yarn', ['--silent', 'wsrun', '--serial', `${process.env.INIT_CWD}/scripts/bin/wsrun/build:cdn.ts`], {
    stdio: 'inherit',
  })
    .then(() => console.log())
    .catch(handleError('CDN bundles failed to build.'));
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
  await compileTypeScripts(tsconfigs);
  await bundleForCDN();
  await injectENV(packages);
}

runAsyncProcess(main);
