let path = require('path');
let webpack = require('webpack');
let merge = require('webpack-merge');
let webpackConfigBase = require('./webpack.base.conf');
let webpackConfigDev = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  output: {
    publicPath: './',
    path: path.resolve(__dirname, '../dist'),
    filename: './js/[name].bundle.js'
  },
  devServer: {
    publicPath: '/',
    contentBase: path.join(__dirname, '../src'),
    host: '0.0.0.0',
    port: '8096',
    overlay: true, // 浏览器页面上显示错误
    open: true, // 开启浏览器
    hot: true // 开启热更新
  },
  module: {
    rules: []
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};

module.exports = merge(webpackConfigBase, webpackConfigDev);
