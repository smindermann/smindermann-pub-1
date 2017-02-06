var ElectronConnectPlugin = require('./electron-connect-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var desktopConfig = require('./webpack.desktop.js');
var helpers = require('./helpers');
var webpackMerge = require('webpack-merge');

var mainConfig = desktopConfig.filter((item) => item.name === "main");
var rendererConfig = desktopConfig.filter((item) => item.name === "renderer");

var electronConnectPlugin = new ElectronConnectPlugin(['--remote-debugging-port=8315'],
  {
    logLevel: 0,
    path: helpers.root('dist'),
    stopOnClose: true,
  }
);
var mainPlugin = electronConnectPlugin.mainPlugin;
var rendererPlugin = electronConnectPlugin.rendererPlugin;

module.exports = [
  webpackMerge(mainConfig, {
    output: {
      path: helpers.root('dist'),
      filename: '[name].js',
    },
    plugins: [
      mainPlugin,
    ]
  }),
  webpackMerge(rendererConfig, {
    devtool: 'source-map',

    output: {
      path: helpers.root('dist'),
      filename: '[name].[hash].js',
      chunkFilename: '[id].[hash].chunk.js'
    },

    plugins: [
      new ExtractTextPlugin('[name].css'),
      rendererPlugin,
    ],
  })
];
