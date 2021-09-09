#!/usr/bin/env ts-node-script

/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import execa from 'execa';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import { handleError } from '../../utils/handle-script-error';
import { runAsyncProcess } from '../../utils/run-async-process';

function existsAsync(input: string) {
  return new Promise((resolve) => {
    fs.exists(input, (exists) => {
      resolve(exists);
    });
  });
}

type MicrobundleFormat = 'modern' | 'es' | 'cjs' | 'umd' | 'iife';

async function microbundle(
  options: { source?: string; format?: MicrobundleFormat; output?: string; sourcemap?: boolean; name?: string } = {},
) {
  if (options.output) {
    const peerDeps = Object.keys(require(`${process.cwd()}/package.json`).peerDependencies || {});

    /* eslint-disable prettier/prettier */
    const args = [
      'build', options.source ?? 'src/index.ts',
      '--tsconfig', 'tsconfig.json',
      '--target', require(`${process.cwd()}/package.json`).target ?? 'web',
      '--jsx', 'React.createElement',
      '--format', options.format ?? 'cjs',
      '--sourcemap', options.sourcemap ? 'true' : 'false',
      '--external', peerDeps.length ? peerDeps.join(',') : 'none',
      '--output', options.output,
      options.name && '--name', options.name,
    ].filter(Boolean);
    /* eslint-enable prettier/prettier */

    await execa('microbundle', args, { stdio: 'inherit' });
  }
}

async function cjs() {
  await microbundle({ format: 'cjs', output: require(`${process.cwd()}/package.json`).main, sourcemap: true });
}

async function esm() {
  await microbundle({ format: 'es', output: require(`${process.cwd()}/package.json`).module, sourcemap: true });
}

async function modern() {
  await microbundle({ format: 'modern', output: require(`${process.cwd()}/package.json`).exports, sourcemap: true });
}

async function cdn() {
  await microbundle({
    source: 'src/index.cdn.ts',
    format: 'iife',
    output: require(`${process.cwd()}/package.json`)['umd:main'],
    name: require(`${process.cwd()}/package.json`).umdGlobal,
    sourcemap: false,
  });
}

async function tsc() {
  const spinner = ora('Compiling TypeScripts...').start();

  const onCatch = handleError(spinner, 'TypeScripts failed to compile.');

  const compile = async (tsconfig: string) => {
    if (await existsAsync(tsconfig)) {
      /* eslint-disable prettier/prettier */
      const args = [
        '--project', tsconfig,
      ];
      /* eslint-enable prettier/prettier */

      await execa('tsc', args, { stdio: 'inherit' });
    }
  };

  await compile('tsconfig.json').catch(onCatch);
  await compile('tsconfig.cjs.json').catch(onCatch);

  spinner.succeed('TypeScripts compiled!');
}

async function main() {
  switch (require(`${process.cwd()}/package.json`).builder) {
    case 'tsc':
      await tsc();
      break;

    case 'microbundle':
    default:
      await Promise.all([cjs(), esm(), modern(), cdn()]);
      break;
  }
}

runAsyncProcess(main);
