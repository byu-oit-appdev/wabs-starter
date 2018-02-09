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
const browserSync           = require('browser-sync').create();
const config                = require('../config');
const fork                  = require('child_process').fork;
const gulp                  = require('gulp');
const webpack               = require('webpack');
const webpackConfig         = require('./webpack').config;
const webpackDevMiddleware  = require('webpack-dev-middleware');
const webpackHotMiddleware  = require('webpack-hot-middleware');

const bundler = webpack(webpackConfig);

module.exports = function () {

    // enable server sync
    let promise = config.development.serverSync ? runServerSync() : Promise.resolve();

    // enable browser sync
    if (config.development.browserSync) promise = promise.then(() => runBrowserSync());

    promise.catch(err => {
        console.error(err.stack);
        process.exit(1);
    });
};

function runBrowserSync() {
    let browserTimeoutId;

    // configure browser sync
    browserSync.init({
        open: false,                    // auto-open browser window
        port: config.development.port,  // browser-sync port
        proxy: {
            target: config.development.host + ':' + config.server.port,     // express server endpoint
            proxyReq: [function(proxyReq) {                                 // add x-forwarded-port on each request
                proxyReq.setHeader('X-Forwarded-Port', config.development.port);
            }]
        },
        middleware: [
            webpackDevMiddleware(bundler, { /* options */ }),
            webpackHotMiddleware(bundler)
        ],
    });

    // watch for changes to src directory and reload browser sync
    gulp.watch(config.build.src + '/*.js').on('change', () => {
        clearTimeout(browserTimeoutId);
        browserTimeoutId = setTimeout(() => browserSync.reload(), 250);
    });
}

function runServerSync() {
    return new Promise((resolve, reject) => {
        const args = config.development.serverArgs || [];
        let serverTimeoutId;
        let server;
        let sent;

        function load() {
            const server = fork(config.server.main, { execArgv: args });

            server.on('error', err => {
                if (!sent) {
                    sent = true;
                    return reject(err);
                }
                console.error(err.stack);
                process.exit(1);
            });

            server.on('exit', code => {
                console.log('Server process exited with code: ' + code);
                if (code) sent ? process.exit(1) : reject(Error('Unable to start server.'));
                sent = true;
            });

            // listen for the server to be ready
            server.on('message', m => {
                if (m.type === 'server-listening') {
                    if (sent) {
                        console.log('For BrowserSync use port: ' + config.development.port);
                    } else {
                        sent = true;
                        resolve(m.port);
                    }
                }
            });

            return server;
        }

        // start the server
        server = load();

        // if server directory changes then reload server
        gulp.watch(config.server.directory + '/*').on('change', () => {
            clearTimeout(serverTimeoutId);
            serverTimeoutId = setTimeout(() => {
                server.kill();
                server = load();
            }, 250);
        });
    });
}