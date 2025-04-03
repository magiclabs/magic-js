module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-flow'
  ],
  plugins: [
    '@babel/plugin-transform-flow-strip-types'
  ],
  babelrcRoots: ['.', 'node_modules/@react-native', 'node_modules/@react-native/js-polyfills']
};
