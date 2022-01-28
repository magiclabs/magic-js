/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import chalk from 'chalk';
import path from 'path';

export const environment = {
  WEB_VERSION: require(path.resolve(__dirname, '../../packages/magic-sdk/package.json')).version,
  REACT_NATIVE_VERSION: require(path.resolve(__dirname, '../../packages/@magic-sdk/react-native/package.json')).version,
};

export function printEnvironment() {
  console.log(
    Object.entries(environment)
      .map(([key, value]) => {
        return chalk`{rgb(0,255,255) ${key}}{gray :} ${value}`;
      })
      .reduce((prev, next, i) => {
        if (i === 0) return chalk`${prev}    {gray -} ${next}`;
        return chalk`${prev}\n    {gray -} ${next}`;
      }, ''),
  );
}
