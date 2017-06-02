/**
 *  @license
 *    Copyright 2017 Brigham Young University
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

// look at command line args to possibly modify environment
const cliArgs = Array.from(process.argv).slice(2);
if (cliArgs.indexOf('--dev') !== -1) {
    process.env.NODE_ENV = 'development';
} else if (cliArgs.indexOf('--prod') !== -1) {
    process.env.NODE_ENV = 'production';
}

// set prod and dev environment variables
process.env.DEV_ENV = Number(process.env.NODE_ENV === 'development');
process.env.PROD_ENV = Number(process.env.NODE_ENV === 'production');

// dev mode enable hot reload for server
if (process.env.DEV_ENV) {
    console.log('Starting in development mode.\n' +
        '\tThe server will automatically restart when it crashes and when changes are made to server files.\n' +
        '\tThe font-end web app will implement hot module reloading.');
    autoRestart();
} else {
    console.log('Starting in production mode.');
    require('./server/index');
}



function autoRestart() {
    const chokidar      = require('chokidar');
    const fork          = require('child_process').fork;
    const path          = require('path');

    console.log('Please wait...');

    const fullPath = path.resolve(__dirname, 'server/index.js');
    const serverDirectory = path.resolve(__dirname, 'server');
    let instance;
    let debounce;
    let isRestartKill;
    let crashes = 0;
    let restartTimeoutId;

    // decrement crash count over time
    setInterval(() => {
        if (crashes > 0) crashes--;
    }, 15000);

    // current directory, ignores .dotfiles
    chokidar.watch(serverDirectory, {ignored: /(^|[\/\\])\../}).on('all', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            console.log((instance === undefined ? 'Starting' : 'Restarting') + ' server...');
            if (instance) {
                instance.kill();
                isRestartKill = true;
            } else {
                restart();
            }
        }, 500);
        crashes = 0;
        clearTimeout(restartTimeoutId);
    });

    function restart() {
        // start an instance
        instance = fork(fullPath);

        // if the server exits with an error code then restart it
        instance.on('exit', code => {
            if (code !== 0) {
                instance = null;
                crashes++;
                if (crashes > 10) {
                    console.log('Too many crashes. Waiting for file changes before next restart.');
                } else {
                    const delay = crashes * 300;
                    console.log('Application crashed. Restarting in ' + (delay/1000) + ' seconds.');
                    restartTimeoutId = setTimeout(restart, delay);
                }
            } else if (isRestartKill) {
                restart();
            }
        });
    }
}