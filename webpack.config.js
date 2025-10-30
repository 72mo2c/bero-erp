const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url"),
      "querystring": require.resolve("querystring-es3"),
      "assert": require.resolve("assert"),
      "constants": require.resolve("constants-browserify"),
      "util": require.resolve("util/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "fs": false, // لا حاجة لـ fs في المتصفح
      "net": false, // لا حاجة لـ net في المتصفح
      "tls": false  // لا حاجة لـ tls في المتصفح
    }
  }
};