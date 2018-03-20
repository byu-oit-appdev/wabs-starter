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
const path      = require('path');

const config = {

    // build configuration
    build: {
        dest: path.resolve(__dirname, 'www'),                   // where to output build file to
        main: path.resolve(__dirname, 'src/assets/js/app.js'),  // the main JavaScript file for your app
        src: path.resolve(__dirname, 'src')                     // the source directory to build from
    },

    // development settings - used with: npm run dev
    development: {
        browserSync: true,                  // whether to use browserSync
        host: 'http://localhost',           // the hostname
        port: 8460,                         // the port to run the development server on
        serverArgs: ['--inspect=9229'],     // arguments to pass to the server when started up - defaults to allow remote debugging on port 9229
        serverSync: true                    // whether to restart the server when code changes on it
    },

    // environment
    production: (process.env.HANDEL_ENVIRONMENT_NAME || process.env.NODE_ENV) === 'production',     // whether the environment is production or not

    // server settings
    server: {
        directory: path.resolve(__dirname, 'server'),   // the directory that the server resides within
        main: path.resolve(__dirname, 'server/index'),  // the main JavaScript file for the server
        port: 8461                                      // the port to run the server on
    },

    // wabs configuration - for full instructions see https://www.npmjs.com/package/byu-wabs
    wabs: {
        appName: 'wabs-demo'
    }

};

if (Array.from(process.argv).indexOf('--wabs-starter-dev') !== -1) {
    config.wabs.host = config.development.host + ':' + config.development.port;
}

module.exports = config;