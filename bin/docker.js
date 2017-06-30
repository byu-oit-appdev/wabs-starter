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

const docker = new Docker();

exports.exec = function(args) {
    ensureImageExists(pkg => {
        const dockerArgs = getDockerArgs({ applicationPath: pkg.applicationPath });
        if (args.length > 0) dockerArgs.push.apply(dockerArgs, args);
        spawn('docker', dockerArgs, { stdio: 'inherit' });
    });
};

exports.start = function(args) {
    if (args.help) {
        console.log('Usage:  wabs start [OPTIONS] [APP] ' +
            '\n\nRun the defined WABS application' +
            '\n\nOptions:' +
            '\n  -b, --browser-sync  Run browser sync' +
            '\n  -d, --debug <port>  The port to open for debugging. Defaults to 5858' +
            '\n  -n, --nodemon       Restart the server on file changes' +
            '\n  -p, --port <port>   The port to run the server on. Defaults to 8080');

    } else {
        ensureImageExists(() => {
            validate(args);
            const dockerArgs = getDockerArgs(args);
            dockerArgs.push('npm run start' + (args.debug ? ':debug' : ''));
            if (args.args.length > 0) dockerArgs.push.apply(dockerArgs, args.args);
            spawn('docker', dockerArgs, { stdio: 'inherit' });
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
        ensureImageExists(pkg => {
            const dockerArgs = getDockerArgs({ applicationPath: pkg.applicationPath });
            const image = dockerArgs.pop();
            dockerArgs.push('--entrypoint', '/bin/bash', image);
            spawn('docker', dockerArgs, { stdio: 'inherit' });
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
    const pkg = getPackageContent();
    getWabsImage()
        .then(image => {
            if (image) {
                callback(pkg);
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
        .then(images => images.filter(image => image.RepoTags.indexOf('wabs-starter:latest') !== -1)[0])
        .then(image => {
            if (image) return image;
            if (build) return buildWabsImage();
        });
}

function hasDebug(args) {
    return args.hasOwnProperty('debug') || args.hasOwnProperty('d');
}

function getDockerArgs(args) {
    const dockerArgs = [
        'run',
        '-it',
        '--rm',
        '-v', args.applicationPath + ':' + '/var/wabs',
        '-p',
        args.port || args.p || '8080'
    ];
    if (args.debug) dockerArgs.push('-p', args.debug);
    dockerArgs.push('wabs-starter:latest');
    return dockerArgs;
}

function validate(args) {
    const debug = hasDebug(args);

    args.source = path.resolve(process.cwd(), args.source || args.s || '');

    if (debug) {
        const debugArg = args.debug || args.d;
        args.debug = debugArg === true ? '5858': debugArg;
    }

    const pkg = getPackageContent();

    args.applicationPath = pkg.applicationPath;

    args.app = pkg.name;
}