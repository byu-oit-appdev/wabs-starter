/**
 *  @license
 *    Copyright 2018 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';
const config    = require('../config');
const webpack   = require('webpack');

const appPath = config.build.main;

exports.config = {
    entry: config.production
        ? { app: appPath }
        : { app: [ appPath, 'webpack/hot/dev-server', 'webpack-hot-middleware/client' ] },

    output: {
        filename: 'bundle.js',
        path: config.build.dest
    },

    context: config.build.dest,

    devtool: config.production ? 'none' : 'eval-source-map',

    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
        }
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    { loader: "style-loader" }, // creates style nodes from JS strings
                    { loader: "css-loader" },   // translates CSS into CommonJS
                    { loader: "sass-loader" }   // compiles Sass to CSS
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },

    plugins: config.production
        ? [
            new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
            new webpack.optimize.UglifyJsPlugin()
        ]
        : [ new webpack.HotModuleReplacementPlugin() ]
};

exports.build = function () {
    return new Promise((resolve, reject) => {
        webpack(exports.config, err => {
            if (err) return reject(err);
            resolve()
        });
    });
};
