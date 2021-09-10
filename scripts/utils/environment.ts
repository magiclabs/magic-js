/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import path from 'path';

export const environment = {
  WEB_VERSION: require(path.resolve(__dirname, '../../packages/magic-sdk/package.json')).version,
  REACT_NATIVE_VERSION: require(path.resolve(__dirname, '../../packages/@magic-sdk/react-native/package.json')).version,
};
