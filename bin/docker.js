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
const build     = require('dockerode-build');
const Docker    = require('dockerode');
const fs        = require('fs');
const path      = require('path');
const spawn     = require('child_process').spawn;
const wabsMw    = require('wabs-middleware');

const docker = new Docker();

exports.exec = function(command) {
    ensureImageExists(() => {
        run({ command: command });
    });
};

exports.start = function(args) {
    if (args.help) {
        console.log('Usage:  wabs start [OPTIONS] [APP] ' +
            '\n\nRun the defined WABS application' +
            '\n\nOptions:' +
            '\n  -b, --browser-sync  Run browser sync' +
            '\n  -d, --debug [PORT]  The port to open for debugging. Defaults to 5858' +
            '\n  -n, --nodemon       Restart the server on file changes' +
            '\n  -p, --port [PORT]   The port to run the server on. Defaults to 8080');

    } else {
        ensureImageExists(() => {
            const config = {
                command: 'npm run ' + (args.nodemon || args.n ? 'nodemon' : 'start'),
                debug: hasDebug(args) ? args.debug || args.d : '',
                port: args.port || args.p
            };
            if (config.debug) config.command += ':debug';
            if (args['browser-sync'] || args.b) process.env.BROWSER_SYNC = true;

            run(config, true);
        });
    }
};

exports.test = function(args) {
    if (args.help) {
        console.log('Usage:  wabs test [OPTIONS] [APP] ' +
            '\n\nRun the mocha tests for the defined WABS application' +
            '\n\nOptions:' +
            '\n  -d, --debug <port>   The port to open for debugging. Defaults to 5858' +
            '\n  -p, --port <port>    The port to run the server on. Defaults to 8080');
    }
};

exports.terminal = function(args) {
    if (args.help) {
        console.log('Usage:  wabs terminal ' +
            '\n\nStart the docker container in an interactive terminal');
    } else {
        ensureImageExists(() => {
            run({ entrypoint: '/bin/bash' });
        });
    }
};

function buildWabsImage() {
    return new Promise(function(resolve, reject) {
        const dockerPath = path.resolve(__dirname, '../Dockerfile');
        const stream = build(dockerPath, { t: 'wabs-starter:latest' });

        stream.pipe(process.stdout);

        stream.on('error', err => {
            reject(err);
        });

        stream.on('complete', () => {
            getWabsImage(false).then(resolve);
        });
    });
}

function ensureImageExists(callback) {
    getWabsImage()
        .then(image => {
            if (image) {
                callback();
            } else {
                console.error('Unable to find docker image: wabs-starter:latest');
                process.exit(1);
            }
        });
}

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

function getWabsImage(build) {
    if (arguments.length === 0) build = true;
    return docker.listImages()
        .then(images => images.filter(image => image && image.RepoTags && image.RepoTags.indexOf('wabs-starter:latest') !== -1)[0])
        .then(image => {
            if (image) return image;
            if (build) return buildWabsImage();
        });
}

function hasDebug(args) {
    return args.hasOwnProperty('debug') || args.hasOwnProperty('d');
}

function run(config, server) {
    const pkg = getPackageContent();

    console.log('Context: ' + pkg.name + '\n');

    wabsMw.getOptions(pkg.name)
        .then(function(opts) {

            // environment variables
            const name = pkg.name.replace(/-/g, '_').toUpperCase();
            const env = {};
            if (opts.hasOwnProperty('consumerKey')) env[name + '__CONSUMER_KEY'] = opts.consumerKey || '';
            if (opts.hasOwnProperty('consumerKey')) env[name + '__CONSUMER_SECRET'] = opts.consumerSecret || '';
            if (opts.hasOwnProperty('consumerKey')) env[name + '__ENCRYPT_SECRET'] = opts.encryptSecret || '';

            const args = [
                'run',
                '-it',
                '--rm',
                '-v', pkg.applicationPath + ':' + '/var/wabs'
            ];

            // open ports
            if (server) {
                const port = config.port ? (config.port === true ? '8080' : config.port) : '8080';
                env.WABS_PORT = port;
                args.push('-p', port + ':' + port);

                const debugPort = config.debug === true ? '9229' : config.debug;
                if (config.debug) {
                    env.WABS_DEBUG_PORT = debugPort;
                    args.push('-p', debugPort + ':' + debugPort);
                }
            }

            // docker arguments
            if (config.entrypoint) args.push('--entrypoint', config.entrypoint);
            Object.keys(env).forEach(key => args.push('-e', key));

            // docker image
            args.push('wabs-starter:latest');

            // command and command arguments
            if (config.command) args.push.apply(args, config.command.split(/\s+/));

            console.log('\ndocker ' + args.join(' ') + '\n');

            spawn('docker', args, {
                env: env,
                stdio: 'inherit'
            });

        });
}