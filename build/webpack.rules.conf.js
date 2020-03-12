let miniCssExtractPlugin = require('mini-css-extract-plugin');
let devMode = process.env.NODE_ENV !== 'production';
let rules = [{
  test: /\.css$/,
  use: [
    devMode ? 'style-loader' : {
      loader: miniCssExtractPlugin.loader,
      options: {
        publicPath: '../'
      }
    },
    'css-loader',
    'postcss-loader'
  ]
}, {
  test: /\.js$/,
  exclude: /node_modules/,
  use: [{
    loader: 'babel-loader'
  }]
}, {
  test: /\.(jpg|png|gif)$/,
  use: [{
    loader: 'url-loader',
    options: {
      limit: 5 * 1024,
      outputPath: 'images',
      esModule: false,
    }
  }]
}, {
  test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
  use: [{
    loader: 'url-loader',
    options: {
      limit: 10000
    }
  }]
}, {
  test: /\.html$/,
  use: ['html-withimg-loader']
}, {
  test: /\.less$/,
  use: [
    devMode ? 'style-loader' : {
      loader: miniCssExtractPlugin.loader,
      options: {
        publicPath: '../'
      }
    },
    'css-loader',
    'postcss-loader',
    {
      loader: "less-loader",
      options: {
        javascriptEnabled: true
      }
    }
  ]
}];

module.exports = rules;
