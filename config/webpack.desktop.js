const { CheckerPlugin } = require('awesome-typescript-loader');
var CopyPlugin = require('copy-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');

const CLIENT = process.env.CLIENT = 'desktop';

module.exports = [
  {
    name: "main",

    entry: {
      'index': './src/index.ts',
    },

    resolve: {
      extensions: ['', '.ts', '.js']
    },

    module: {
      loaders: [
        {
          test: /\.ts$/,
          loaders: [
            'awesome-typescript-loader',
          ]
        },
        {
          test: /angular\.(png|ico)$/,
          loader: 'file?name=[name].[ext]'
      },
      ]
    },

    node: {
      __dirname: false,
      __filename: false
    },

    plugins: [
      new CheckerPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'CLIENT': JSON.stringify(CLIENT)
        }
      }),
      new webpack.IgnorePlugin(new RegExp("^(spawn-sync|bufferutil|utf-8-validate)$")),
      // Electron uses package.json to find name and version
      new CopyPlugin([{from: './package.json'}])
    ],

    target: "electron"
  },
  webpackMerge(commonConfig, {
    name: "renderer",

    target: "electron-renderer"
  })
];
