import { resolve } from 'path';
import { EnvironmentPlugin, DefinePlugin, NormalModuleReplacementPlugin } from 'webpack';
import Config from 'webpack-chain';
import envVariables from './env-variables.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Bootstraps a Webpack configuration with most of the common defaults.
 */
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

  const reactDependencyRegex = /^(react|react-native|react-native-webview)$/;

  if (isReactNative) {
    // In React Native environments, we expect the developer to provide their
    // own React dependencies, so we mark them as "externals".
    config.externals(reactDependencyRegex);
  } else {
    // In browser environments, we must ensure that React dependencies are not
    // included or `required` anywhere, so we force these modules to be replaced
    // with an empty module.
    config
      .plugin('remove-react-dependencies')
      .use(NormalModuleReplacementPlugin, [reactDependencyRegex, resolve(__dirname, '../src/noop-module.ts')]);
  }

  config.resolve.extensions.merge(['.ts', '.tsx', '.js']);

  return config;
}

/** CJS Bundler */
const configCJS = configBase('tsconfig.cjs.json');
configCJS.name('cjs');
configCJS.entry('main').add('./src/index.cjs.ts');
configCJS.output
  .path(resolve(__dirname, '../dist/cjs'))
  .filename('index.js')
  .libraryTarget('commonjs2');

/** React Native Bundler */
const configReactNative = configBase('tsconfig.react-native.json', true);
configReactNative.name('react-native');
configReactNative.entry('main').add('./src/index.react-native.ts');
configReactNative.output
  .path(resolve(__dirname, '../dist/react-native'))
  .filename('index.js')
  .libraryTarget('commonjs2');

/** CDN Bundler */
const configCDN = configBase('tsconfig.cdn.json');
configCDN.name('cdn');
configCDN.entry('main').add('./src/index.cdn.ts');
configCDN.output
  .path(resolve(__dirname, '../dist'))
  .filename('magic.js')
  .libraryTarget('window')
  .libraryExport('default')
  .library('Magic');

// Expose Webpack configurations for concurrent bundling
module.exports = [configCJS.toConfig(), configReactNative.toConfig(), configCDN.toConfig()];
