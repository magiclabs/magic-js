/* eslint-disable import/no-extraneous-dependencies */

import { resolve } from 'path';
import { EnvironmentPlugin, DefinePlugin } from 'webpack';
import Config from 'webpack-chain';
import envVariables from './env-variables.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

function configBase(tsconfig: string, transpileOnly = false) {
  const config = new Config();

  config.context(resolve(__dirname, '..'));
  config.mode(isDevelopment ? 'development' : 'production');

  config.module
    .rule('compile')
    .test(/.tsx?$/)
    .use('typescript')
    .loader('ts-loader')
    .options({ transpileOnly, configFile: resolve(__dirname, `../config/${tsconfig}`) });

  config.plugin('environment').use(EnvironmentPlugin, [envVariables]);

  config.externals({
    react: 'react',
    'react-native': 'react-native',
    'react-native-webview': 'react-native-webview',
  });

  config.resolve.extensions.merge(['.ts', '.tsx', '.js']);

  return config;
}

const configCJS = configBase('tsconfig.cjs.json');
configCJS.name('cjs');
configCJS.entry('main').add('./src/index.cjs.ts');
configCJS.output
  .path(resolve(__dirname, '../dist/cjs'))
  .filename('index.js')
  .libraryTarget('commonjs2');

const configReactNative = configBase('tsconfig.react-native.json');
configReactNative.name('react-native');
configReactNative.entry('main').add('./src/index.react-native.ts');
configReactNative.plugin('rn-environment').use(DefinePlugin, [{ 'process.env.IS_REACT_NATIVE': true }]);
configReactNative.output
  .path(resolve(__dirname, '../dist/react-native'))
  .filename('index.js')
  .libraryTarget('commonjs2');

const configCDN = configBase('tsconfig.cdn.json');
configCDN.name('cdn');
configCDN.entry('main').add('./src/index.cdn.ts');
configCDN.output
  .path(resolve(__dirname, '../dist'))
  .filename('magic.js')
  .libraryTarget('window')
  .libraryExport('default')
  .library('Magic');

module.exports = [configCJS.toConfig(), configReactNative.toConfig(), configCDN.toConfig()];
