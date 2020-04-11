/* eslint-disable import/no-extraneous-dependencies */

import { resolve } from 'path';
import { EnvironmentPlugin, DefinePlugin, NormalModuleReplacementPlugin } from 'webpack';
import Config from 'webpack-chain';
import envVariables from './env-variables.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

function configBase(tsconfig: string, isReactNative = false) {
  const config = new Config();

  config.context(resolve(__dirname, '..'));
  config.mode(isDevelopment ? 'development' : 'production');

  config.module
    .rule('compile')
    .test(/.tsx?$/)
    .use('typescript')
    .loader('ts-loader')
    .options({ configFile: resolve(__dirname, `../config/${tsconfig}`) });

  config.plugin('environment').use(EnvironmentPlugin, [envVariables]);
  config.plugin('react-native-environment').use(DefinePlugin, [{ 'process.env.IS_REACT_NATIVE': isReactNative }]);

  if (isReactNative) {
    // In React Native environments, we expect the developer to provide their
    // own React dependencies, so we mark them as "externals".
    config.externals({
      react: 'react',
      'react-native': 'react-native',
      'react-native-webview': 'react-native-webview',
    });
  } else {
    // In browser environments, we must ensure that React dependencies are not
    // included or `required` anywhere, so we force these modules to be replaced
    // with an empty module.
    config
      .plugin('mock-react-dependencies')
      .use(NormalModuleReplacementPlugin, [
        /(react|react-native|react-native-webview)/,
        resolve(__dirname, '../src/noop-module.ts'),
      ]);
  }

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

const configReactNative = configBase('tsconfig.react-native.json', true);
configReactNative.name('react-native');
configReactNative.entry('main').add('./src/index.react-native.ts');
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
