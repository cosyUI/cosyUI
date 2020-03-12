let path = require('path');
let merge = require('webpack-merge');

// 清除目录
let { CleanWebpackPlugin } = require("clean-webpack-plugin");

//4.x之后用以压缩
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let optimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
//4.x之后提取css
let miniCssExtractPlugin = require('mini-css-extract-plugin');

let webpackConfigBase = require('./webpack.base.conf');

let webpackConfigProd = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: './js/[name].[chunkhash:8].js',
    publicPath: './'
  },
  module: {
    rules: []
  },
  plugins: [
    //删除dist目录
    new CleanWebpackPlugin({
      // verbose Write logs to console.
      verbose: false, //开启在控制台输出信息
      // dry Use boolean "true" to test/emulate delete. (will not remove files).
      // Default: false - remove files
      dry: true,
    }),
    // 分离css插件参数为提取出去的路径
    new miniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].min.css',
    }),
    //压缩css
    new optimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
  ],
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  }
};

if (process.env.npm_config_report) {//打包后模块大小分析//npm run build --report
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfigProd.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = merge(webpackConfigBase, webpackConfigProd);
