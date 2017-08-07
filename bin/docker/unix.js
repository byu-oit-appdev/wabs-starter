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
const dockerode         = require('dockerode');
const Docker            = require('./docker');
const path              = require('path');

const docker = new dockerode();
const CTRL_C = '\u0003';

module.exports = Unix;

/**
 * Unix specific docker.
 * @constructor
 * @augments Docker
 */
function Unix() {}

Unix.prototype = Object.assign({}, Docker.prototype);
Unix.prototype.constructor = Unix;

Unix.prototype.buildImage = function(version) {
    const dockerPath = path.resolve(__dirname, '../..');
    const config = {
        context: dockerPath,
        src: ['Dockerfile']
    };
    return docker.buildImage(config, { t: this.IMAGE_NAME + ':' + version })
        .then(stream => {
            return new Promise((resolve, reject) => {

                stream.on('data', event => {
                    const str = event.toString();
                    try {
                        const o = JSON.parse(str);
                        if (o.stream) process.stdout.write(o.stream);
                    } catch (e) {
                        process.stdout.write(str);
                    }
                });

                stream.on('end', resolve);
                stream.on('aborted', event => reject(Error('Unable to complete build: ' + event.toString())));
                stream.on('close', resolve);

            });
        });
};

Unix.prototype.getImage = function(version) {
    const image = docker.getImage(this.IMAGE_NAME + ':' + version);
    return image.inspect()
        .then(data => data, err => null);
};

Unix.prototype.run = function(options, version) {
    const config = {
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: true,
        Env: [],
        Cmd: [],
        Image: this.IMAGE_NAME + ':' + version,
        ExposedPorts: {},
        HostConfig: {
            AutoRemove: true,
            Binds: [
                options.pkg.applicationPath + ':/var/wabs'
            ],
            PortBindings: {}
        }
    };

    // open ports
    if (options.port) {
        config.ExposedPorts[options.port + '/tcp'] = {};
        config.HostConfig.PortBindings[options.port + '/tcp'] = [{ HostPort: options.port }];
    }
    if (options.debug) {
        config.ExposedPorts[options.debug + '/tcp'] = {};
        config.HostConfig.PortBindings[options.debug + '/tcp'] = [{ HostPort: options.debug }];
    }

    // set entry point
    if (options.entrypoint) config.Entrypoint = options.entrypoint;

    // set environment variables
    Object.keys(options.env).forEach(key => config.Env.push(key + '=' + options.env[key]));

    // set the command
    if (options.command) config.Cmd = options.command.split(/\s+/);

    // start the container
    const isRaw = process.isRaw;
    let container;
    let stream;
    return docker.createContainer(config)
        .then(c => {
            container = c;
            return container.attach({stream: true, stdin: true, stdout: true, stderr: true});
        })
        .then(s => {
            stream = s;

            // pipe output - TODO: split stdout and stderr
            stream.pipe(process.stdout);

            /*let header = null;
            stream.on('readable', function() {
                header = header || stream.read(8);
                while (header !== null) {
                    const type = header.readUInt8(0);
                    const payload = stream.read(header.readUInt32BE(4));
                    if (payload === null) break;
                    if (type == 2) {
                        process.stderr.write(payload);
                    } else {
                        process.stdout.write(payload);
                    }
                    header = stream.read(8);
                }
            });*/


            // connect to stdin
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.setRawMode(true);
            process.stdin.pipe(stream);

            // exit docker container if Ctrl-C is hit twice in a row
            let previousKey;
            process.stdin.on('data', function(key) {
                if (key === CTRL_C && previousKey === CTRL_C) {
                    process.stdout.write('\n');
                    exit(stream, isRaw);
                } else if (key === CTRL_C) {
                    console.log('\n\nHit Ctrl-C again to exit docker container.');
                }
                previousKey = key;
            });

            return container.start();
        })
        .then(() => {
            resize();
            process.stdout.on('resize', resize);

            container.wait(function() {
                console.log('Stopping container\n');
                exit(stream, isRaw);
            });
        });

    function resize() {
        const dimensions = {
            h: process.stdout.rows,
            w: process.stderr.columns
        };

        if (dimensions.h !== 0 && dimensions.w !== 0) {
            container.resize(dimensions, function() {});
        }
    }

    function exit() {
        process.stdout.removeListener('resize', resize);
        process.stdin.removeAllListeners();
        process.stdin.setRawMode(isRaw);
        process.stdin.resume();
        stream.end();
        container.stop()
            .catch(() => null)
            .then(() => process.exit());
    }
};