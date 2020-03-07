/* eslint-disable import/no-extraneous-dependencies */

import { resolve } from 'path';
import { EnvironmentPlugin } from 'webpack';
import Config from 'webpack-chain';
import envVariables from './env-variables.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

function configBase(transpileOnly = false) {
  const config = new Config();

  config.context(resolve(__dirname, '..'));
  config.mode(isDevelopment ? 'development' : 'production');

  /* eslint-disable prettier/prettier */
  config.module
    .rule('compile')
      .test(/.tsx?$/)
      .use('typescript')
        .loader('ts-loader')
        .options({ transpileOnly });
  /* eslint-enable prettier/prettier */

  config.plugin('environment').use(EnvironmentPlugin, [envVariables]);

  config.resolve.extensions.merge(['.ts', '.tsx', '.js']);

  return config;
}

/*
  We use Webpack to compile a CDN-compatible bundle for usage via `<script>`
  tags in HTML and a CJS bundle for consumption via NodeJS. We rely fully on
  TypeScript to build ESM files for distribution.
 */

const configCJS = configBase();
configCJS.name('cjs');
configCJS.entry('main').add('./src/index.ts');
configCJS.output
  .path(resolve(__dirname, '../dist/cjs'))
  .filename('magic.js')
  .libraryTarget('commonjs2')
  .libraryExport('default');

const configCDN = configBase();
configCDN.name('cdn');
configCDN.entry('main').add('./src/index.cdn.ts');
configCDN.output
  .path(resolve(__dirname, '../dist'))
  .filename('magic.js')
  .libraryTarget('window')
  .libraryExport('default')
  .library('Magic');

module.exports = [configCJS.toConfig(), configCDN.toConfig()];
