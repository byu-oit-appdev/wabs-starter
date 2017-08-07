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

exports.bash = function(args) {
    if (args.help) {
        console.log('Usage:  wabs bash [OPTIONS] ' +
            '\n\nStart the docker container in an interactive terminal' +
            '\n\nOptions:' +
            '\n  -P, --prod   Disable auto restarting the server and hot reloading on the browser.');
    } else {
        docker(args, { entrypoint: '/bin/bash' });
    }
};

exports.exec = function(command) {
    const match = /^(?:-P)|(?:--prod) /.exec(command);
    let args = { args: [] };
    if (match) {
        command = command.substr(match[0].length);
        args.args.push('-P');
    }
    docker(args, { entrypoint: '/bin/bash', command: command, escapable: true });
};

exports.run = function(args) {
    if (args.help) {
        help('run', 'run [OPTIONS] SCRIPT');
    } else {
        docker(args, { entrypoint: '/bin/bash', command: 'npm run ' + args.args.join(' '), escapable: true });
    }
};

exports.start = function(args) {
    if (args.help) {
        help('start', 'start [OPTIONS]');
    } else {
        docker(args, { entrypoint: '/bin/bash', command: 'npm start', escapable: true });
    }
};

exports.test = function(args) {
    if (args.help) {
        help('test', 'test [OPTIONS]');
    } else {
        docker(args, { entrypoint: '/bin/bash', command: 'npm test', escapable: true });
    }
};


/**
 * Execute docker container
 * returns {Function}
 */
function docker(args, config) {
    let Docker;
    if (/^win/.test(process.platform)) {
        Docker = require('./docker/windows');
    } else {
        Docker = require('./docker/unix');
    }
    return new Docker().start(args, config).catch(err => console.error(err.stack));
}

function help(name, usage) {
    console.log('Usage:  wabs ' + usage +
        '\n\nWithin docker container execute npm ' + name +
        '\n\nOptions:' +
        '\n  -d, --debug [PORT]      The port to open for debugging. Defaults to 9229' +
        '\n  -k, --debug-brk [PORT]  The port to open for debugging in break mode. Defaults to 9229' +
        '\n  -p, --port [PORT]       The port to run the server on. Defaults to 8080' +
        '\n  -P, --prod              Disable auto restarting the server and hot reloading on the browser.');
}