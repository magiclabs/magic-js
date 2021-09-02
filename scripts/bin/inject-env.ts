#!/usr/bin/env ts-node-script

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import { replaceInFile } from 'replace-in-file';
import path from 'path';
import { runAsyncProcess } from '../utils/run-async-process';

/**
 * Environment variables to be interpolated into the built files. Interpolations
 * occur where `%VARIABLE_NAME%` is found.
 *
 * (FYI: it's best to encapsulate the interpolation as a string, i.e.: `"%VARIABLE_NAME%"`).
 */
const environment = {
  WEB_VERSION: require(path.resolve(__dirname, '../../packages/magic-sdk/package.json')).version,
  REACT_NATIVE_VERSION: require(path.resolve(__dirname, '../../packages/@magic-sdk/react-native/package.json')).version,
};

async function main() {
  const files = process.argv.slice(2).map((f) => path.resolve(__dirname, '..', f, 'dist/**/*'));

  Object.keys(environment).forEach(async (envVar) => {
    if (environment[envVar]) {
      await replaceInFile({
        files,
        from: `%${envVar}%`,
        to: environment[envVar],
        allowEmptyPaths: true,
      }).catch(console.error);
    }
  });
}

runAsyncProcess(main);
