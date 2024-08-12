// config-overrides.js
const path = require('path');
const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    "process": require.resolve("process/browser"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/")
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ];

  return config;
};
