#!/usr/bin/env ts-node-script

import execa from 'execa';
import meow from 'meow';
import ora from 'ora';
import chalk from 'chalk';
import { runAsyncProcess } from '../utils/run-async-process';

const spinner = ora();

async function abstractCleanFn(patterns: string[]) {
  await Promise.all(
    patterns.map(async (pattern) => {
      await execa('yarn', ['wsrun:all', '--parallel', '-r', 'rimraf', pattern]);
    }),
  );
}

async function cleanDist() {
  await abstractCleanFn(['dist', 'node_modules/.temp']);
}

async function cleanCache() {
  await abstractCleanFn(['node_modules/.cache']);
}

async function cleanTestArtifacts() {
  await abstractCleanFn(['coverage', '.nyc_output']);
}

async function cleanNodeModules() {
  await Promise.all([execa('rimraf', ['**/node_modules'])]);
}

const helpText = `
  Usage: yarn clean [OPTIONS]

  Options:
    --cache                   Remove cache files.

    --test-artifacts          Remove coverage reports.

    --deps                    Remove node_modules (from all packages).

    -h, --help                Show this message. No cleaning happens if
                              this flag is present.
`;

async function main() {
  const cli = meow(helpText, {
    flags: {
      cache: {
        type: 'boolean',
        default: false,
      },

      testArtifacts: {
        type: 'boolean',
        default: false,
      },

      deps: {
        type: 'boolean',
        default: false,
      },

      help: {
        type: 'boolean',
        default: false,
        alias: 'h',
      },
    },
  });

  if (cli.flags.help) {
    cli.showHelp();
  }

  const enabledCleaners: string[] = [chalk.rgb(0, 255, 255)('dist')];
  const concurrent: (() => Promise<any>)[] = [cleanDist];
  const sequential: (() => Promise<any>)[] = [];

  if (cli.flags.cache) {
    enabledCleaners.push(chalk.rgb(0, 255, 255)('cache'));
    concurrent.push(cleanCache);
  }

  if (cli.flags.testArtifacts) {
    enabledCleaners.push(chalk.rgb(0, 255, 255)('test artifacts'));
    concurrent.push(cleanTestArtifacts);
  }

  if (cli.flags.deps) {
    enabledCleaners.push(chalk.rgb(0, 255, 255)('node_modules'));
    sequential.push(cleanNodeModules);
  }

  spinner.start(`Cleaning ${enabledCleaners.join(', ')}...`);

  const handleError = (err: any) => {
    spinner.fail('Failed!');
    if (err) console.error(err);
    process.exit(1);
  };

  await Promise.all(concurrent.map((p) => p())).catch(handleError);

  await new Promise<void>((resolve, reject) => {
    sequential
      .reduce(async (curr, next) => {
        return curr.then(next);
      }, Promise.resolve())
      .then(() => resolve())
      .catch(reject);
  })
    .then(() => {
      spinner.succeed(`Cleaned ${enabledCleaners.join(', ')}!`);
    })
    .catch(handleError);
}

runAsyncProcess(main);
