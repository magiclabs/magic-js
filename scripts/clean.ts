#!/usr/bin/env ts-node-script

import execa from 'execa';
import meow from 'meow';
import ora from 'ora';
import chalk from 'chalk';
import { runAsyncProcess } from './utils/run-async-process';

const spinner = ora();

async function abstractCleanFn(label: string, patterns: string[]) {
  await Promise.all(
    patterns.map(async (pattern) => {
      await execa('yarn', ['wsrun', '--parallel', '-r', 'rimraf', pattern]);
    }),
  );
}

async function cleanDist() {
  await abstractCleanFn('dist files', ['dist']);
}

async function cleanCache() {
  await abstractCleanFn('cache files', ['node_modules/.cache']);
}

async function cleanTestArtifacts() {
  await abstractCleanFn('test artifacts', ['coverage', '.nyc_output']);
}

async function cleanNodeModules() {
  await Promise.all([
    execa('yarn', ['wsrun', '--parallel', '-r', 'rimraf', 'node_modules']),
    execa('rimraf', ['node_modules']),
  ]);
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
  const promises: (() => Promise<any>)[] = [cleanDist];

  if (cli.flags.cache) {
    enabledCleaners.push(chalk.rgb(0, 255, 255)('cache'));
    promises.push(cleanCache);
  }

  if (cli.flags.testArtifacts) {
    enabledCleaners.push(chalk.rgb(0, 255, 255)('test artifacts'));
    promises.push(cleanTestArtifacts);
  }

  if (cli.flags.deps) {
    enabledCleaners.push(chalk.rgb(0, 255, 255)('node_modules'));
    promises.push(cleanNodeModules);
  }

  spinner.start(`Cleaning ${enabledCleaners.join(', ')}...`);

  Promise.all(promises.map((p) => p()))
    .then(() => {
      spinner.succeed(`Cleaned ${enabledCleaners.join(', ')}!`);
    })
    .catch((err) => {
      spinner.fail('Failed!');
      if (err) console.error(err);
      process.exit(1);
    });
}

runAsyncProcess(main);
