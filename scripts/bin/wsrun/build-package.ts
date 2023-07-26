#!/usr/bin/env ts-node-script

/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import pLimit from 'p-limit';
import isCI from 'is-ci';
import { build, createTemporaryTSConfigFile, emitTypes } from '../../utils/esbuild';
import { runAsyncProcess } from '../../utils/run-async-process';

function getExternalsFromPkgJson(pkgJson: any): string[] {
  const dependencies = Object.keys(pkgJson.dependencies || []);
  const peerDependencies = Object.keys(pkgJson.peerDependencies || []);
  const includes = pkgJson.externals?.include || [];
  const excludes = pkgJson.externals?.exclude || [];

  const defaultExternals = [...dependencies, ...peerDependencies, ...includes];

  return defaultExternals.filter((dep) => !excludes.includes(dep));
}

async function cjs(watch?: boolean) {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await build({
    watch,
    format: 'cjs',
    target: pkgJson.target,
    output: pkgJson.exports?.require ?? pkgJson.main,
    externals: getExternalsFromPkgJson(pkgJson),
    sourcemap: true,
  });
}

async function esm(watch?: boolean) {
  const pkgJson = require(`${process.cwd()}/package.json`);
  await Promise.all([
    build({
      watch,
      format: 'esm',
      target: pkgJson.target,
      output: pkgJson.module,
      externals: getExternalsFromPkgJson(pkgJson),
      sourcemap: true,
    }),

    build({
      watch,
      format: 'esm',
      target: pkgJson.target,
      output: pkgJson?.exports?.import,
      externals: getExternalsFromPkgJson(pkgJson),
      sourcemap: true,
    }),
  ]);
}

async function cdn(watch?: boolean) {
  const pkgJson = require(`${process.cwd()}/package.json`);

  if (pkgJson.cdnGlobalName) {
    // For CDN targets outside of `magic-sdk` itself,
    // we assume `magic-sdk` & `@magic-sdk/commons` are external/global.
    const isMagicSDK = process.cwd().endsWith('packages/magic-sdk');
    const externals = isMagicSDK ? ['none'] : ['magic-sdk', '@magic-sdk/commons'];
    const globals = isMagicSDK ? undefined : { 'magic-sdk': 'Magic', '@magic-sdk/commons': 'Magic' };

    await build({
      watch,
      format: 'iife',
      target: 'browser',
      output: pkgJson.jsdelivr,
      name: pkgJson.cdnGlobalName,
      externals,
      globals,
      sourcemap: false,
    });
  }
}

async function reactNativeBareHybridExtension(watch?: boolean) {
  const pkgJson = require(`${process.cwd()}/package.json`);

  await build({
    watch,
    format: 'cjs',
    target: pkgJson.target,
    output: pkgJson['react-native-bare'],
    externals: getExternalsFromPkgJson(pkgJson),
    sourcemap: true,
  });
}

async function reactNativeExpoHybridExtension(watch?: boolean) {
  const pkgJson = require(`${process.cwd()}/package.json`);

  await build({
    watch,
    format: 'cjs',
    target: pkgJson.target,
    output: pkgJson['react-native-expo'],
    externals: getExternalsFromPkgJson(pkgJson),
    sourcemap: true,
  });
}

async function main() {
  await createTemporaryTSConfigFile();

  if (process.env.DEV_SERVER) {
    const builders = [cjs(true), esm(true), cdn(true), reactNativeBareHybridExtension(true), reactNativeExpoHybridExtension(true), emitTypes(true)];
    await Promise.all(builders);
  } else {
    // We need to limit concurrency in CI to avoid ENOMEM errors.
    const limit = pLimit(isCI ? 2 : 4);
    const builders = [limit(cjs), limit(esm), limit(cdn), limit(reactNativeBareHybridExtension), limit(reactNativeExpoHybridExtension), limit(emitTypes)];
    await Promise.all(builders);
  }
}

runAsyncProcess(main);
