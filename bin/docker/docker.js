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
const commandExists     = require('command-exists');
const fs                = require('fs');
const os                = require('os');
const path              = require('path');
const wabs              = require('byu-wabs');

module.exports = Docker;

/**
 * Produce a docker controller instance
 * @constructor
 * @returns {Docker}
 */
function Docker() {

}

/**
 * Get WABS config path
 * @name Docker#CONFIG_PATH
 * @type {string}
 */
Object.defineProperty(Docker.prototype, 'CONFIG_PATH', { value: path.resolve(os.homedir(), '.wabs/config.json'), enumerable: true });

/**
 * Get WABS container name
 * @name Docker#IMAGE_NAME
 * @type {string}
 */
Object.defineProperty(Docker.prototype, 'IMAGE_NAME', { value: 'wabs-starter', enumerable: true });

/**
 * Build the docker image.
 * @param {String} version
 * @returns {Promise}
 */
Docker.prototype.buildImage = function(version) {
    return Promise.reject(Error('buildImage not implemented'));
};

/**
 * Get the label from the Dockerfile that specifies the version
 * @returns {Promise<string>}
 */
Docker.prototype.getBuildVersion = function() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(__dirname, '../../Dockerfile'), 'utf8', function(err, data) {
            if (err) return reject(err);
            const match = /^LABEL version="([\s\S]*?)"/m.exec(data);
            resolve(match ? match[1] : '');
        });
    })
};

/**
 * Get details about all docker images.
 * @param {String} [version]
 * @returns {Promise<Array>}
 */
Docker.prototype.getImage = function(version) {
    return Promise.reject(Error('getImage not implemented'));
};

Docker.prototype.getOptions = function(args, config) {
    const pkg = getPackageContent();
    config.pkg = pkg;
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

    return wabs.getOptions(pkg.name)
        .then(function(opts) {

            // environment variables
            const name = pkg.name.replace(/-/g, '_').toUpperCase();
            const env = Object.assign({}, config.env);
            if (opts.hasOwnProperty('consumerKey')) env[name + '__CONSUMER_KEY'] = opts.consumerKey || '';
            if (opts.hasOwnProperty('consumerSecret')) env[name + '__CONSUMER_SECRET'] = opts.consumerSecret || '';
            if (opts.hasOwnProperty('encryptSecret')) env[name + '__ENCRYPT_SECRET'] = opts.encryptSecret || '';

            return config;
        });
};

/**
 * Check to see if docker is available.
 * @returns {Promise}
 */
Docker.prototype.isRunning = function() {
    return commandExists('docker')
        .catch(err => {
            throw Error('Docker does not seem to be installed or is not running.')
        });
};

Docker.prototype.init = function(args, config) {
    let version;
    return this.getBuildVersion()
        .then(v => {
            version = v;
            return this.getImage(v)
        })
        .then(image => {
            if (image) {
                console.log('Image is current.');
            } else {
                console.log('Building new docker image');
                return this.buildImage(version);
            }
        })
        .then(() => this.getOptions(args, config))
        .then(options => {
            console.log('Starting container');
            return this.run(options);
        });
};

Docker.prototype.run = function(config) {
    return Promise.reject(Error('run not implemented'));
};




function getPackageContent() {
    let dirPath = process.cwd();
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

function hasArg(args) {
    const length = arguments.length;
    for (let i = 1; i < length; i++) {
        if (args.hasOwnProperty(arguments[i])) return true;
    }
    return false;
}
