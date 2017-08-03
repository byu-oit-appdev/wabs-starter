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
const exists                = require('command-exists');
const fs                    = require('fs');
const path                  = require('path');
const { spawn, execSync }   = require('child_process');
const wabs                  = require('byu-wabs');

const docker = dockerCommandPath();
const version = require('../package.json').version;
const imageNamePrefix = 'wabs-starter';
const imageName = imageNamePrefix + ':' + version;

exports.bash = function(args) {
    if (args.help) {
        console.log('Usage:  wabs bash [OPTIONS] ' +
            '\n\nStart the docker container in an interactive terminal' +
            '\n\nOptions:' +
            '\n  -P, --prod   Disable auto restarting the server and hot reloading on the browser.');
    } else {
        ensureImageExists(() => {
            const config = {
                entrypoint: '/bin/bash',
                env: { NODE_ENV: hasArg(args, 'P', 'prod') ? 'production' : 'development' }
            };
            run(args, config);
        });
    }
};

exports.exec = function(command) {
    ensureImageExists(() => {
        const match = /^(?:-P)|(?:--prod) /.exec(command);
        if (match) command = command.substr(match[0].length);

        const config = {
            command: command,
            env: { NODE_ENV: match ? 'production' : 'development' }
        };
        run(args, config)
    });
};

exports.run = function(args) {
    if (args.help) {
        help('run', 'run [OPTIONS] SCRIPT');
    } else {
        ensureImageExists(() => {
            const config = { command: 'npm run ' + args.args.join(' ') };
            run(args, config);
        });
    }
};

exports.start = function(args) {
    if (args.help) {
        help('start', 'start [OPTIONS]');
    } else {
        ensureImageExists(() => {
            const config = { command: 'npm start' };
            run(args, config);
        });
    }
};

exports.test = function(args) {
    if (args.help) {
        help('test', 'test [OPTIONS]');
    } else {
        ensureImageExists(() => {
            const config = { command: 'npm test' };
            run(args, config);
        });
    }
};


/**
 * Take words with spaces and convert to single camel-case word.
 * @param {string} str
 * @returns {string}
 */
function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
}

function dockerCommandPath() {
    let command = 'docker';

    const isOSX = /darwin/.test(require('os').platform());
    if (!isOSX) return command;

    try {
        const stdout = execSync('which docker').toString();
        if (!/^which/.test(stdout)) command = stdout;
    } catch (e) {
        throw Error('Cannot find "docker" command');
    }

    return command;
}

/**
 * Ensure that the wabs-starter image exists before calling the callback
 * @param {Function} callback
 */
function ensureImageExists(callback) {
    return exists(docker)
        .then(() => getWabsImage(true), () => { throw Error('Command "docker" is not defined. Is it installed? Is it running?'); })
        .then(callback)
        .catch(err => console.error(err.stack));
}

/**
 * Traverse upward in the directory until a package.json is found where property "wabs" is true.
 * @param {string} [dirPath] Start directory.
 * @returns {Object} package.json object
 */
function getPackageContent(dirPath) {
    if (arguments.length === 0) dirPath = process.cwd();
    let prev;
    do {
        prev = dirPath;
        try {
            const content = fs.readFileSync(path.resolve(dirPath, 'package.json'), 'utf8');
            const data = JSON.parse(content);
            if (data.wabs) {
                data.applicationPath = dirPath;
                return data;
            }
        } catch (e) {}
        dirPath = path.resolve(dirPath, '..');
    } while (prev !== dirPath);

    console.error('Error: The current directory (' + process.cwd() + ') is not part of a WABS full stack application.');
    process.exit(1);
}

/**
 * Get the wabs-start image that is the correct version and build new version if needed.
 * @param {boolean} [build=false] Set to true to cause an image build to occur if not found.
 * @returns {Promise}
 */
function getWabsImage(build) {

    const child = spawn(docker, ['images']);
    return promisifyChild(child)
        .then(data => {
            const parsed = parse(data.stdout);
            return parsed.filter(item => item.repository === imageNamePrefix && item.tag === version)[0];
        })
        .then(image => {
            if (image) {
                console.log('Found ' + imageNamePrefix + ' image.\n');

            } else if (build) {
                console.log('Building new ' + imageNamePrefix + ' docker image\n');

                const dockerPath = path.resolve(__dirname, '..');
                const promise = new Promise((resolve, reject) => {
                    const child = spawn(docker, ['build', '-t', imageNamePrefix + ':' + version, dockerPath]);

                    child.stdout.pipe(process.stdout);

                    child.on('error', err => reject(err));

                    child.on('close', code => {
                        if (code !== 0) return reject(code);
                        resolve();
                    });
                });

                return promise.then(() => getWabsImage(false));

            } else {
                return Promise.reject(Error('Unable find nor create wabs-starter image.'));
            }
        });
}

function hasArg(args) {
    const length = arguments.length;
    for (let i = 1; i < length; i++) {
        if (args.hasOwnProperty(arguments[i])) return true;
    }
    return false;
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

function parse(data) {
    const columns = [];
    const lines = data.split('\n');
    const results = [];

    // determine title spacing
    const rxTitles = /[A-Z ]+?(?:\s{2,}|$)/g;
    const titleLine = lines.shift();
    let match;
    while (match = rxTitles.exec(titleLine)) {
        columns.push(camelize(match[0].replace(/\s+$/, '').toLowerCase()));
    }

    lines.forEach(line => {
        const rxColumns = /[\S\s]+?(?:\s{2,}|$)/g;
        const o = {};
        let match;
        let index = 0;
        let content = false;

        while (match = rxColumns.exec(line)) {
            content = true;
            o[columns[index++]] = match[0].replace(/\s+$/, '').toLowerCase();
        }
        if (content) results.push(o);
    });

    return results;
}

function run(args, config) {
    const pkg = getPackageContent();
    console.log('Context: ' + pkg.name + '\n');

    if (!config.env) config.env = {};
    let debugMode;

    // set the port
    config.port = args.port || args.p;
    if (config.port === true || !config.port) config.port = '8080';
    config.env.WABS_PORT = config.port;

    // set the debug port and mode
    if (hasArg(args, 'debug-brk', 'k')) {
        config.debug = args['debug-brk'] || args.k;
        debugMode = '--inspect-brk';
    } else if (hasArg(args, 'debug', 'd')) {
        config.debug = args.debug || args.d;
        debugMode = '--inspect';
    }
    if (debugMode) {
        if (config.debug === true) config.debug = '9229';
        config.env.WABS_INSPECT = debugMode + '=0.0.0.0:' + config.debug;
        config.env.WABS_DEBUG_PORT = config.debug;
    }

    // set environment
    config.env.NODE_ENV = hasArg(args, 'P', 'prod') ? 'production' : 'development';

    wabs.getOptions(pkg.name)
        .then(function(opts) {

            // environment variables
            const name = pkg.name.replace(/-/g, '_').toUpperCase();
            const env = Object.assign({}, config.env);
            if (opts.hasOwnProperty('consumerKey')) env[name + '__CONSUMER_KEY'] = opts.consumerKey || '';
            if (opts.hasOwnProperty('consumerSecret')) env[name + '__CONSUMER_SECRET'] = opts.consumerSecret || '';
            if (opts.hasOwnProperty('encryptSecret')) env[name + '__ENCRYPT_SECRET'] = opts.encryptSecret || '';

            const args = [
                'run',
                '-it',
                '--rm',
                '-v', pkg.applicationPath + ':' + '/var/wabs'
            ];

            // open ports
            if (config.port) args.push('-p', config.port + ':' + config.port);
            if (config.debug) args.push('-p', config.debug + ':' + config.debug);

            // docker arguments
            if (config.entrypoint) args.push('--entrypoint', config.entrypoint);
            Object.keys(env).forEach(key => args.push('-e', key));
            // docker image
            args.push(imageName);

            // command and command arguments
            if (config.command) args.push.apply(args, config.command.split(/\s+/));

            // output the docker command
            console.log('\ndocker ' + args.join(' ') + '\n');

            // start the docker container
            const child = spawn(docker, args, {
                env: env,
                stdio: 'inherit'
            });

            child.on('error', err => console.error(err));

        });
}

function promisifyChild(child) {
    return new Promise(function(resolve, reject) {
        const result = { stdout: '', stderr: '', common: '' };

        child.stdout.on('data', (data) => {
            data = data.toString();
            result.stdout += data;
            result.common += data;
        });

        child.stderr.on('data', (data) => {
            data = data.toString();
            result.stderr += data;
            result.common += data;
        });

        child.on('error', err => {
            result.error = err;
            reject(err);
        });

        child.on('close', (code) => {
            result.code = code;
            if (code === 0) return resolve(result);

            console.log(result.common);
            const err = result.error || Error('Error processing stream: ' + code);
            reject(err);
        });
    });
}