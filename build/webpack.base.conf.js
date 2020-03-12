let path = require('path');
let webpack = require('webpack');
let glob = require('glob');

// HTML模版
let HtmlWebpackPlugin = require('html-webpack-plugin');
// 消除冗余的css
let purifyCssWebpack = require('purifycss-webpack');
//静态资源输出
let copyWebpackPlugin = require("copy-webpack-plugin");

let rules = require('./webpack.rules.conf');

/**
 * 动态添加入口
 * @param pagesDir
 */
function getEntry (dir) {
  let entry = {}
  // 读取src目录所有page入口
  glob.sync(`${dir}**/*.js`)
    .forEach((filePath) => {
      let name = filePath.match(/\/pages\/(.+)\/index.js/);
      name = name[1];
      entry[name] = filePath;
    });
  return entry;
}

// 获取html-webpack-plugin参数的方法
let getHtmlConfig = function (name, chunks) {
  return {
    template: `./src/pages/${name}/index.html`,
    filename: `${name}.html`,
    // favicon: './favicon.ico',
    // title: title,
    inject: true,
    hash: true, //开启hash  ?[hash]
    chunks: chunks,
    minify: process.env.NODE_ENV === "development" ? false : {
      removeComments: true, //移除HTML中的注释
      collapseWhitespace: true, //折叠空白区域 也就是压缩代码
      removeAttributeQuotes: true, //去除属性引用
    },
  };
};

let entrys = getEntry('./src/pages/');

let webpackConfig = {
  entry: entrys,
  module: {
    rules: [...rules]
  },
  plugins: [
    // 静态资源输出
    new copyWebpackPlugin([{
      from: path.resolve(__dirname, "../src/assets"),
      to: './assets',
      ignore: ['.*']
    }]),
    // 消除冗余的css代码
    new purifyCssWebpack({
      paths: glob.sync(path.join(__dirname, "../src/pages/*/*.html"))
    })
  ]
};

// 修改 自动化配置页面
let htmlArray = Object.keys(entrys).map((item) => {
  return {
    name: item,
    title: '',
    chunks: [item]
  }
});

// 自动化生成HTML模板
htmlArray.forEach((item) => {
  webpackConfig.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(item.name, item.chunks)));
})

module.exports = webpackConfig;
