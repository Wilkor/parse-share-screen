// webpack.config.js
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "process": require.resolve("process/browser"),
      "stream": require.resolve("stream-browserify")
      // Adicione outros fallbacks necessários aqui
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};
