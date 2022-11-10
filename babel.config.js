module.exports = {
  presets: ['@babel/preset-typescript', '@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
  ],
  env: {
    esm: {
      presets: [['@babel/preset-env', { modules: false }]],
      plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
    },
  },
}
