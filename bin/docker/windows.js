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
const Docker            = require('./docker');
const path              = require('path');
const { spawn }         = require('child_process');

module.exports = Windows;

/**
 * Windows specific docker.
 * @constructor
 * @augments Docker
 */
function Windows() {}

Windows.prototype = Object.assign({}, Docker.prototype);
Windows.prototype.constructor = Windows;

Windows.prototype.buildImage = function(version) {
    const dockerPath = path.resolve(__dirname, '../..');
    return new Promise((resolve, reject) => {
        const child = spawn('docker', ['build', '-t', this.IMAGE_NAME + ':' + version, dockerPath]);

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.on('error', reject);

        child.on('close', code => {
            if (code !== 0) return reject(Error('Unable to build docker image.'));
            resolve();
        });
    });
};

Windows.prototype.getImage = function(version) {
    return new Promise((resolve, reject) => {
        const child = spawn('docker', ['images']);
        let stdout = '';

        child.stdout.on('data', (data) => {
            data = data.toString();
            stdout += data;
            //process.stdout.write(data);
        });

        child.stderr.pipe(process.stderr);

        child.on('error', reject);

        child.on('close', (code) => {
            if (code === 0) {
                const parsed = parse(stdout);
                const filtered = parsed.filter(image => image.repository === this.IMAGE_NAME && image.tag === version);
                return resolve(filtered[0]);
            } else {
                reject(Error('Error processing stream: ' + code));
            }
        });
    });
};

Windows.prototype.run = function(options, version) {
    const args = [
        'run',
        '-it',
        '--rm',
        '-v', options.pkg.applicationPath + ':/var/wabs'
    ];

    // open ports
    if (options.port) args.push('-p', options.port + ':' + options.port);
    if (options.debug) args.push('-p', options.debug + ':' + options.debug);

    // set entry point
    if (options.entrypoint) args.push('--entrypoint', options.entrypoint);

    // set environment variables
    Object.keys(options.env).forEach(key => args.push('-e', key + '=' + options.env[key]));

    // specify image
    args.push(this.IMAGE_NAME + ':' + version);

    // command and command arguments
    if (options.command) args.push.apply(args, options.command.split(/\s+/));

    // output the docker command
    console.log('\ndocker ' + args.join(' ') + '\n');

    // start the docker container
    const child = spawn('docker', args, {
        //env: env,
        stdio: 'inherit'
    });

    child.on('error', err => console.error(err));
};



function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
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
        columns.push(toCamelCase(match[0].replace(/\s+$/, '').toLowerCase()));
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