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
const http              = require('http');
const path              = require('path');
const pkg               = require('./package.json');
const wabs              = require('byu-wabs');

process.on('unhandledRejection', e => {
    console.error(e.stack);
    process.exit(1);
});

console.log('ENV: ' + process.env.NODE_ENV);

wabs.getOptions(pkg.name)
    .then(options => {
        console.log(' ');
        const devMode = process.env.NODE_ENV === 'development';
        let app;
        let dirty;

        const server = http.createServer(function(req, res, next) {
            app(req, res, next);
        });

        const listener = server.listen(process.env.WABS_PORT, function(err) {
            if (err) {
                console.error(err.stack);
                process.exit(1);
            } else {
                console.log('Server listening on port ' + listener.address().port + '\n');
                load();
            }
        });

        if (devMode) {
            console.log('Starting server app hot reload\n');

            const chokidar = require('chokidar');
            let ready = false;
            let timeoutId;
            dirty = {};

            chokidar.watch(path.resolve(__dirname, 'server'))
                .on('all', (event, partialPath) => {
                    if (!ready) return;
                    switch (event) {
                        case 'add':
                        case 'change':
                        case 'unlink':
                            if (/.+\.js$/.test(partialPath)) {
                                const fullPath = path.resolve(__dirname, partialPath);
                                clearTimeout(timeoutId);
                                timeoutId = setTimeout(load, 300);
                                if (!dirty[fullPath]) dirty[fullPath] = null;
                            }
                            break;
                    }
                })
                .on('ready', () => {
                    ready = true;
                    console.log('Server app hot reload ready\n');
                });
        }

        function error(req, res, next) {
            res.write('Internal Server Error');
            res.end();
        }

        function load() {

            // clear require cache for changed files
            const cache = require.cache;
            Object.keys(dirty).forEach(path => {
                dirty[path] = cache[path];
                delete cache[path]
            });

            // attempt to load the app
            console.log('Server app ' + (app ? 're' : '') + 'loading...\n');
            try {
                app = require('./server/index')(options);
                console.log('========================================\nServer app loaded\n');
                return true;
            } catch (err) {
                app = error;
                console.error('Could not load server app:');
                console.error(err.stack + '\n');

                if (devMode) {
                    console.error('The server is still running, you do not need to restart it. ' +
                        'Fix the error and save for automatic reload.\n');
                }
            }
        }
    });