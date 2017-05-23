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
const fork          = require('child_process').fork;
const path          = require('path');
const util          = require('./util');

console.log('Please wait...');

const appDirectory = util.getAppRoot();
if (appDirectory === '') {
    console.log('Could not find wabs full-stack application root directory in: ' + process.cwd());
    process.exit(1);
}

const pkg = util.getPackage();
const start = pkg.scripts.start;
const fullPath = path.resolve(appDirectory, start.split(' ')[1]);

fork(fullPath, start.split(' ').slice(2));

/*
// if the server exits with an error code then restart it
instance.on('exit', code => {
    if (code !== 0) {
        instance = null;
        restart();
    } else if (isRestartKill) {
        restart();
    }
});*/
