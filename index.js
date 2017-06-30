#!/usr/bin/env node
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
const docker        = require('./bin/docker');
const version       = require('./package.json').version;

console.log('WABS Starter v' + version + '\n');

const args = getCliArgs();
const command = args.command || 'help';

switch (command) {
    case 'start':
    case 'terminal':
    case 'test':
        docker[command](args);
        break;
    case 'manage':
        require('./bin/ui-main');
        break;
    case 'help':
        console.log('Usage:  wabs [COMMAND]' +
            '\n\nA tool for managing local development for WABS full stack single page applications' +
            '\n\nCommands:' +
            '\n  manage    Start the WABS application management tool' +
            '\n  start     Run a WABS application' +
            '\n  terminal  Start the docker container in an interactive terminal' +
            '\n  test      Run the tests that are part of the WABS application' +
            '\n\nRun \'wabs COMMAND --help\` for more information on one of these commands.' +
            '\n\nAny other command will execute within the docker container. Omitting the command will start the container in an interactive terminal.');
        break;
    default:
        docker.exec(process.argv.slice(2));
        break;
}



function getCliArgs() {
    const args = Array.prototype.slice.call(process.argv, 2);
    const length = args.length;
    const result = {
        command: '',
        args: []
    };
    let key = '';

    for (let i = 0; i < length; i++) {
        const arg = args[i];
        if (arg[0] === '-') {
            key = arg.replace(/^-+/, '');
            result[key] = true;
        } else if (key) {
            result[key] = arg;
            key = '';
        } else if (i === 0) {
            result.command = arg;
        } else {
            result.args = args.slice(i);
            break;
        }
    }

    return result;
}


/*
const version       = require('./package.json').version;

console.log('WABS Starter (version ' + version + ')');

const arg = process.argv[2];
switch(arg) {
    case 'app':
        require('./bin/app');
        break;
    case 'init':
        require('./bin/init');
        break;
    default:
        console.log('Command not defined: ' + arg + '. Try one of: app, init');
}*/
