import { resolve } from 'path';
import { EnvironmentPlugin, DefinePlugin, NormalModuleReplacementPlugin } from 'webpack';
import Config from 'webpack-chain';
import envVariables from './env-variables.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Bootstraps a Webpack configuration with most of the common defaults.
 */
function configBase(name: 'cjs' | 'cdn' | 'react-native') {
  const isReactNative = name === 'react-native';
  const config = new Config();

  config.name(name);
  config.target(isReactNative ? 'node' : 'web');
  config.context(resolve(__dirname, '..'));
  config.mode(isDevelopment ? 'development' : 'production');
  config.entry('main').add(`./src/index.${name}.ts`);
  config.resolve.extensions.merge(['.ts', '.tsx', '.js']);

  config.module
    .rule('compile')
    .test(/.tsx?$/)
    .use('typescript')
    .loader('ts-loader')
    .options({ configFile: resolve(__dirname, `../config/tsconfig.${name}.json`) });

  config.plugin('environment').use(EnvironmentPlugin, [envVariables]);
  config.plugin('react-native-environment').use(DefinePlugin, [{ 'process.env.IS_REACT_NATIVE': isReactNative }]);

  if (isReactNative) {
    // In React Native environments, we expect the developer to provide their
    // own React dependencies, so we mark them as "externals".
    config.externals(/^(react|react-native|react-native-webview)$/);
  } else {
    // In browser environments, we must ensure that React dependencies are not
    // included or `required` anywhere, so we force these modules to be replaced
    // with an empty module.
    config
      .plugin('remove-react-dependencies')
      .use(NormalModuleReplacementPlugin, [
        /^(react|react-native|react-native-webview|whatwg-url)$/,
        resolve(__dirname, '../src/noop-module.ts'),
      ]);
  }

  return config;
}

/** CJS Bundler */
const configCJS = configBase('cjs');
configCJS.output
  .path(resolve(__dirname, '../dist/cjs'))
  .filename('index.js')
  .libraryTarget('commonjs2');

/** React Native Bundler */
const configReactNative = configBase('react-native');
configReactNative.performance.hints(false);
configReactNative.output
  .path(resolve(__dirname, '../dist/react-native'))
  .filename('index.js')
  .libraryTarget('commonjs2');

/** CDN Bundler */
const configCDN = configBase('cdn');
configCDN.output
  .path(resolve(__dirname, '../dist'))
  .filename('magic.js')
  .libraryTarget('window')
  .libraryExport('default')
  .library('Magic');

// Expose Webpack configurations for concurrent bundling
module.exports = [configCJS.toConfig(), configReactNative.toConfig(), configCDN.toConfig()];
