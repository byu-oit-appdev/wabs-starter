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
const fs            = require('fs');
const path          = require('path');
const os            = require('os');

const configDirectory = path.resolve(os.homedir(), '.wabs');
const configPath = path.resolve(configDirectory, 'config.json');

exports.read = function() {
    try {
        const content = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        return {};
    }
};

exports.write = function(data) {
    try {
        fs.statSync(configDirectory);
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        fs.mkdirSync(configDirectory);
    }

    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(configPath, content);
};