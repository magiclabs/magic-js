#!/usr/bin/env ts-script

/*
  eslint-disable

  global-require,
  import/no-dynamic-require,
  @typescript-eslint/no-var-requires
*/

import { replaceInFile } from 'replace-in-file';
import path from 'path';

/**
 * Environment variables to be interpolated into the built files. Interpolations
 * occur where `"%VARIABLE_NAME%"` is found.
 */
const environment = {
  WEB_VERSION: require(path.resolve(__dirname, '../packages/web/package.json')).version,
  REACT_NATIVE_VERSION: require(path.resolve(__dirname, '../packages/react-native/package.json')).version,
};

const files = process.argv.slice(2).map((f) => path.resolve(__dirname, '..', f, 'dist/**/*'));

Object.keys(environment).forEach(async (envVar) => {
  if (environment[envVar]) {
    await replaceInFile({
      files,
      from: `%${envVar}%`,
      to: environment[envVar],
      allowEmptyPaths: true,
    }).catch(console.error);

    console.log(`Injected ENV variable \`${envVar}\``);
  }
});
