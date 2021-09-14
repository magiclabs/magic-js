#!/usr/bin/env ts-node-script

/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import pLimit from 'p-limit';
import isCI from 'is-ci';
import { microbundle } from '../../utils/microbundle';
import { runAsyncProcess } from '../../utils/run-async-process';

async function cjs() {
  await microbundle('build', {
    format: 'cjs',
    target: require(`${process.cwd()}/package.json`).target,
    output: require(`${process.cwd()}/package.json`).main,
    sourcemap: true,
  });
}

async function esm() {
  await microbundle('build', {
    format: 'es',
    target: require(`${process.cwd()}/package.json`).target,
    output: require(`${process.cwd()}/package.json`).module,
    sourcemap: true,
  });
}

async function modern() {
  await microbundle('build', {
    format: 'modern',
    target: require(`${process.cwd()}/package.json`).target,
    output: require(`${process.cwd()}/package.json`).exports,
    sourcemap: true,
  });
}

async function cdn() {
  await microbundle('build', {
    source: 'src/index.cdn.ts',
    format: 'iife',
    target: require(`${process.cwd()}/package.json`).target,
    output: require(`${process.cwd()}/package.json`)['umd:main'],
    name: require(`${process.cwd()}/package.json`).umdGlobal,
    external: 'none',
    sourcemap: false,
  });
}

async function main() {
  // We need to limit concurrency in CI to avoid ENOMEM errors.
  const limit = pLimit(isCI ? 2 : 4);

  const builders = [limit(cjs), limit(esm), limit(modern), limit(cdn)];
  await Promise.all(builders);
}

runAsyncProcess(main);
