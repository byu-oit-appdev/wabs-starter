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
const wabs      = require('byu-wabs');

const docker = new Docker();
const version = require('../package.json').version;
const imageNamePrefix = 'wabs-starter';
const imageName = imageNamePrefix + ':' + version;

exports.bash = function(args) {
    if (args.help) {
        console.log('Usage:  wabs terminal ' +
            '\n\nStart the docker container in an interactive terminal');
    } else {
        ensureImageExists(() => {
            run({ entrypoint: '/bin/bash' });
        });
    }
};

exports.exec = function(command) {
    ensureImageExists(() => run({ command: command }));
};

exports.run = function(args) {
    if (args.help) {
        help('run', 'run [OPTIONS] SCRIPT');
    } else {
        ensureImageExists(() => {
            const config = { command: 'npm run ' + args.args.join(' ') };
            applyConfigArgs(config, args);
            run(config, true);
        });
    }
};

exports.start = function(args) {
    if (args.help) {
        help('start', 'start [OPTIONS]');
    } else {
        ensureImageExists(() => {
            const config = { command: 'npm start' };
            applyConfigArgs(config, args);
            run(config, true);
        });
    }
};

exports.test = function(args) {
    if (args.help) {
        help('test', 'test [OPTIONS]');
    } else {
        ensureImageExists(() => {
            const config = { command: 'npm test' };
            applyConfigArgs(config, args);
            run(config, true);
        });
    }
};





function applyConfigArgs(config, args) {
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
    config.env.NODE_ENV = hasArg(args, 'v', 'dev') ? 'development' : 'production';
}

function buildWabsImage() {
    return new Promise(function(resolve, reject) {
        console.log('Building new ' + imageNamePrefix + ' docker image\n');
        const dockerPath = path.resolve(__dirname, '../Dockerfile');
        const stream = build(dockerPath, { t: imageName });

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
                console.error('Unable to find docker image: ' + imageName);
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

        // filter images
        .then(images => {
            return images.filter(image => {
                if (!image || !image.RepoTags) return;
                const length = image.RepoTags.length;
                for (let i = 0; i < length; i++) {
                    const tag = image.RepoTags[i];
                    if (tag.indexOf(imageNamePrefix) === 0) return true;
                }
                return false;
            });
        })

        // separate current image from old images, removing old
        .then(images => {
            const promises = [];
            let current = null;

            images.forEach(image => {
                const length = image.RepoTags.length;
                let found = false;
                for (let i = 0; i < length; i++) {
                    const tag = image.RepoTags[i];
                    if (tag === imageName) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    current = image;
                } else if (build) {
                    promises.push(docker.getImage(image.Id).remove({ f: true }));
                }
            });

            return Promise.all(promises).then(() => current);
        })

        .then(current => {
            if (current) return current;
            if (build) return buildWabsImage();
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
        '\n  -v, --dev               Enable auto restarting the server and hot reloading on the browser.' +
        '\n  -p, --port [PORT]       The port to run the server on. Defaults to 8080');
}

function run(config) {
    const pkg = getPackageContent();

    console.log('Context: ' + pkg.name + '\n');

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
            args.push('-p', config.port + ':' + config.port);
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
            spawn('docker', args, {
                env: env,
                stdio: 'inherit'
            });

        });
}