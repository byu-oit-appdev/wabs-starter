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
const { spawn }         = require('child_process');

module.exports = Unix;

function Unix() {}

Unix.prototype = Object.assign({}, Docker.prototype);
Unix.prototype.constructor = Unix;

Unix.prototype.buildImage = function(version) {
    const dockerPath = path.resolve(__dirname, '../..');
    const config = {
        context: dockerPath,
        src: ['Dockerfile']
    };
    const docker = new dockerode();
    return docker.buildImage(config, { t: this.IMAGE_NAME + ':' + version });
};

Unix.prototype.getImage = function(version) {
    const docker = new dockerode();
    const image = docker.getImage(this.IMAGE_NAME + ':' + version);
    return image.inspect()
        .then(data => data, err => null);
};

Unix.prototype.run = function(config) {
    const args = [
        'run',
        '-it',
        '--rm',
        '-v', config.pkg.applicationPath + ':' + '/var/wabs',
        '-v', this.CONFIG_PATH + ':' + '/root/.wabs/config.json'
    ];

    // open ports
    if (config.port) args.push('-p', config.port + ':' + config.port);
    if (config.debug) args.push('-p', config.debug + ':' + config.debug);

    // docker arguments
    const env = config.env;
    if (config.entrypoint) args.push('--entrypoint', config.entrypoint);
    Object.keys(env).forEach(key => args.push('-e', key + '=' + env[key]));
    // docker image
    args.push(this.IMAGE_NAME);

    // command and command arguments
    if (config.command) args.push.apply(args, config.command.split(/\s+/));

    // output the docker command
    console.log('\ndocker ' + args.join(' ') + '\n');

    // start the docker container
    const child = spawn('docker', args, {
        //env: env,
        stdio: 'inherit'
    });

    child.on('error', err => console.error(err));
};