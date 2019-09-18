var path = require('path');
var webpack = require('webpack');

module.exports = {
  module: {
    loaders: [
      {
        loader: "babel-loader",
        // Skip any files outside of your project's `src` directory
        include: [
          path.resolve(__dirname, "public/js"),
        ],
        // Only run `.js` and `.jsx` files through Babel
        test: /\.jsx?$/,
        // Options to configure babel with
        query: {
          plugins: ['@babel/plugin-transform-runtime'],
          presets: ['@babel/preset-env', '@babel/preset-react'],
        }
      }
    ],
    rules: [
      {
        test: /\.css$/i,
        loader: 'css-loader',
        options: {
          import: true,
          modules: true,
        },
      },
    ],
  },
  output: {
    filename: './public/js/bundle.js'
  },
  entry: [
    './public/js/app.js'
  ]
};
