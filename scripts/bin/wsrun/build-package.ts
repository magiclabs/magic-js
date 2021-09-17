#!/usr/bin/env ts-node-script

/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import pLimit from 'p-limit';
import isCI from 'is-ci';
import { build } from '../../utils/microbundle';
import { runAsyncProcess } from '../../utils/run-async-process';

function getExternalsFromPkgJson(pkgJson: any): string {
  const dependencies = Object.keys(pkgJson.dependencies || []);
  const peerDependencies = Object.keys(pkgJson.peerDependencies || []);
  const includes = pkgJson.externals?.include || [];
  const excludes = pkgJson.externals?.exclude || [];

  const defaultExternals = [...dependencies, ...peerDependencies, ...includes];

  return defaultExternals.filter((dep) => !excludes.includes(dep)).join(',');
}

async function cjs() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'cjs',
    target: pkgJson.target,
    output: pkgJson.exports?.require ?? pkgJson.main,
    external: getExternalsFromPkgJson(pkgJson),
    sourcemap: true,
  });
}

async function esm() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'es',
    target: pkgJson.target,
    output: pkgJson.module,
    external: getExternalsFromPkgJson(pkgJson),
    sourcemap: true,
  });
}

async function modern() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'modern',
    target: pkgJson.target,
    output: typeof pkgJson.exports === 'string' ? pkgJson.exports : pkgJson.exports?.import,
    external: getExternalsFromPkgJson(require(`${process.cwd()}/package.json`)),
    sourcemap: true,
  });
}

async function cdn() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'iife',
    target: pkgJson.target,
    output: pkgJson['umd:main'],
    name: pkgJson.umdGlobal,
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
