#!/usr/bin/env ts-node-script

/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import pLimit from 'p-limit';
import isCI from 'is-ci';
import { build, createTemporaryTSConfigFile } from '../../utils/microbundle';
import { runAsyncProcess } from '../../utils/run-async-process';

function getExternalsFromPkgJson(pkgJson: any): string[] {
  const dependencies = Object.keys(pkgJson.dependencies || []);
  const peerDependencies = Object.keys(pkgJson.peerDependencies || []);
  const includes = pkgJson.externals?.include || [];
  const excludes = pkgJson.externals?.exclude || [];

  const defaultExternals = [...dependencies, ...peerDependencies, ...includes];

  return defaultExternals.filter((dep) => !excludes.includes(dep));
}

async function cjs() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'cjs',
    target: pkgJson.target,
    output: pkgJson.exports?.require ?? pkgJson.main,
    externals: getExternalsFromPkgJson(pkgJson),
    alias: { '%HYBRID_MAGIC_SDK_IMPORT%': 'magic-sdk' },
    sourcemap: true,
  });
}

async function esm() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'es',
    target: pkgJson.target,
    output: pkgJson.module,
    externals: getExternalsFromPkgJson(pkgJson),
    alias: { '%HYBRID_MAGIC_SDK_IMPORT%': 'magic-sdk' },
    sourcemap: true,
  });
}

async function modern() {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    format: 'modern',
    target: pkgJson.target,
    output: typeof pkgJson.exports === 'string' ? pkgJson.exports : pkgJson.exports?.import,
    externals: getExternalsFromPkgJson(pkgJson),
    alias: { '%HYBRID_MAGIC_SDK_IMPORT%': 'magic-sdk' },
    sourcemap: true,
  });
}

async function cdn() {
  const pkgJson = require(`${process.cwd()}/package.json`);

  await build({
    format: 'iife',
    target: pkgJson.target,
    output: pkgJson.jsdelivr,
    name: pkgJson.cdnGlobalName,
    // For CDN targets, we assume `magic-sdk` & `@magic-sdk/react-native` are external/global.
    externals: ['magic-sdk', '%HYBRID_MAGIC_SDK_IMPORT%'],
    globals: { 'magic-sdk': 'Magic', '%HYBRID_MAGIC_SDK_IMPORT%': 'Magic' },
    sourcemap: false,
  });
}

async function reactNativeHybridExtension() {
  const pkgJson = require(`${process.cwd()}/package.json`);

  await build({
    format: 'cjs',
    target: pkgJson.target,
    output: pkgJson['react-native'],
    externals: getExternalsFromPkgJson(pkgJson),
    alias: { '%HYBRID_MAGIC_SDK_IMPORT%': '@magic-sdk/react-native' },
    sourcemap: true,
  });
}

async function main() {
  await createTemporaryTSConfigFile();

  // We need to limit concurrency in CI to avoid ENOMEM errors.
  const limit = pLimit(isCI ? 2 : 4);
  const builders = [limit(cjs), limit(esm), limit(modern), limit(cdn), limit(reactNativeHybridExtension)];
  await Promise.all(builders);
}

runAsyncProcess(main);
