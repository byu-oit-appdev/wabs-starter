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

module.exports = {

    // build configuration
    build: {
        dest: path.resolve(__dirname, 'www'),
        main: path.resolve(__dirname, 'src/js/app.js'),
        src: path.resolve(__dirname, 'src')
    },

    // development settings
    development: {
        browserSync: true,
        host: 'http://localhost',
        port: 8460,
        serverArgs: ['--inspect'],
        serverSync: true
    },

    // environment
    production: (process.env.HANDEL_ENVIRONMENT_NAME || process.env.NODE_ENV) === 'production',

    // server settings
    server: {
        directory: path.resolve(__dirname, 'server'),
        main: path.resolve(__dirname, 'server/index'),
        port: 8461
    },

    // wabs configuration
    wabs: {
        appName: 'wabs-demo'    // <== change this value to your app name
    }

};