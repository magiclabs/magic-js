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

  config.resolve.extensions.merge(['.ts', '.tsx', '.js']);

  return config;
}

/*
  We use Webpack to compile a CDN-compatible bundle for usage via `<script>`
  tags in HTML and a CJS bundle for consumption via NodeJS. We rely fully on
  TypeScript to build ESM files for distribution.
 */

const configCJS = configBase('tsconfig.cjs.json');
configCJS.name('cjs');
configCJS.entry('main').add('./src/index.ts');
configCJS.output
  .path(resolve(__dirname, '../dist/cjs'))
  .filename('index.js')
  .libraryTarget('commonjs2');

const configReactNative = configBase('tsconfig.react-native.json');
configReactNative.name('rn');
configReactNative.entry('main').add('./src/index.ts');
configReactNative.plugin('rn-environment').use(DefinePlugin, [
  {
    'process.env.IS_REACT_NATIVE': JSON.stringify(1),
  },
]);
configReactNative.externals({
  react: 'react',
  'react-native': 'react-native',
  'react-dom': 'react-dom',
  'react-native-webview': 'react-native-webview',
});
configReactNative.output
  .path(resolve(__dirname, '../RN'))
  .filename('index.js')
  .libraryTarget('commonjs2')
  .libraryExport('default');

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
