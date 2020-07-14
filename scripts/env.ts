#!/usr/bin/env ts-script

import { replaceInFile } from 'replace-in-file';
import path from 'path';

const environment = {
  WEB_VERSION: require(path.resolve(__dirname, '../packages/web/package.json')).version,
  REACT_NATIVE_VERSION: require(path.resolve(__dirname, '../packages/react-native/package.json')).version,
}

const files = process.argv.slice(2).map(f => path.resolve(__dirname, '..', f, 'dist/**/*'));

Object.keys(environment).forEach(async envVar => {
  if (environment[envVar]) {
    await replaceInFile({
      files,
      from: `process.env.${envVar}`,
      to: JSON.stringify(environment[envVar]),
      allowEmptyPaths: true,
    }).catch(console.log);

    console.log(`Injected ENV variable \`${envVar}\``)
  }
});
