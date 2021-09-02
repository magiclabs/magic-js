#!/usr/bin/env ts-node-script

import ora from 'ora';
import execa from 'execa';
import chalk from 'chalk';
import path from 'path';
import { runAsyncProcess } from './utils/run-async-process';
import { handleError } from './utils/handle-script-error';

async function getTSConfigs() {
  const spinner = ora('Determining TypeScript projects to build...').start();

  const tsconfigs = await execa('yarn', ['--silent', 'paths', 'tsconfig.json', 'tsconfig.cjs.json'])
    .then((subprocess) => {
      spinner.succeed('Found TypeScript projects to build!');
      return subprocess.stdout.split('\n');
    })
    .catch(handleError(spinner, 'Failed to discover TypeScript projects to build.'));

  return tsconfigs;
}

async function compileTypeScripts(tsconfigs: string[]) {
  const spinner = ora('Compiling TypeScripts...').start();
  await execa('tsc', ['-b', ...tsconfigs])
    .then(() => {
      spinner.succeed('TypeScripts successfully compiled!');
    })
    .catch(handleError(spinner, 'TypeScripts failed to compile.'));
}

async function bundleForCDN() {
  console.log(chalk`\n{dim ❮❮❮} Building CDN bundles {dim ❯❯❯}\n`);
  await execa('yarn', ['--silent', 'wsrun', '--serial', `${process.env.INIT_CWD}/scripts/wsrun/build:cdn.ts`], {
    stdio: 'inherit',
  })
    .then(() => console.log())
    .catch(handleError('CDN bundles failed to build.'));
}

async function injectENV() {
  const spinner = ora('Injecting environment variables...').start();
  const onCatch = handleError(spinner, 'Failed to inject environment variables.');
  const allPkgs = await execa('yarn', ['--silent', 'paths'])
    .then((subprocess) => subprocess.stdout.split('\n'))
    .catch(onCatch);

  await execa(`${process.env.INIT_CWD}/scripts/inject-env.ts`, [...allPkgs])
    .then(() => {
      spinner.succeed('Environment variables successfully injected!');
    })
    .catch(onCatch);
}

async function main() {
  const tsconfigs = await getTSConfigs();

  console.log(
    tsconfigs
      .slice()
      .sort()
      .map((cfgPath) => {
        const prefix = 'packages/';
        const basename = `/${path.basename(cfgPath)}`;
        return cfgPath.replace(prefix, chalk`{gray ${prefix}}`).replace(basename, chalk`{gray ${basename}}`);
      })
      .reduce((prev, next) => chalk`${prev}\n    {gray -} ${next}`, ''),
    '\n',
  );

  await compileTypeScripts(tsconfigs);
  await bundleForCDN();
  await injectENV();
}

runAsyncProcess(main);
