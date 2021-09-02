#!/usr/bin/env ts-node-script

import ora from 'ora';
import execa from 'execa';
import TscWatchClient from 'tsc-watch/client';
import chalk from 'chalk';
import path from 'path';
import { runAsyncProcess } from './utils/run-async-process';

type CatchFn<TResult = never> = (reason: any) => TResult | PromiseLike<TResult>;

function handleError<TResult = never>(spinner?: ora.Ora, message?: string): CatchFn<TResult>;
function handleError<TResult = never>(message?: string): CatchFn<TResult>;
function handleError<TResult = never>(messageOrSpinner?: ora.Ora | string, message?: string): CatchFn<TResult> {
  return (err: any) => {
    if (messageOrSpinner) {
      if (typeof messageOrSpinner === 'string') {
        console.error(messageOrSpinner);
      } else {
        messageOrSpinner.fail(message);
      }
    }

    if (err) console.error(err);
    process.exit(1);
  };
}

async function getTSConfigs() {
  const spinner = ora('Determining TypeScript projects to build for development...').start();

  const [tsconfigs, allPkgs] = await Promise.all([
    execa('yarn', ['--silent', 'paths', 'tsconfig.json', 'tsconfig.cjs.json']).then((subprocess) =>
      subprocess.stdout.split('\n'),
    ),

    execa('yarn', ['--silent', 'paths']).then((subprocess) => subprocess.stdout.split('\n')),
  ])
    .then((res) => {
      spinner.succeed('Found TypeScript projects to build for development!');
      return res;
    })
    .catch(handleError(spinner, 'Failed to discover TypeScript project to build.'));

  return { tsconfigs, allPkgs };
}

async function injectENV(allPkgs: string[]) {
  await execa(`${process.env.INIT_CWD}/scripts/inject-env.ts`, [...allPkgs]).then(() => {
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
  const { tsconfigs, allPkgs } = await getTSConfigs();

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

  await runDevServer(tsconfigs, allPkgs);
}

runAsyncProcess(main);
