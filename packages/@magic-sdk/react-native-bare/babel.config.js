module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-flow'
  ],
  plugins: [
    '@babel/plugin-transform-flow-strip-types'
  ]
};
