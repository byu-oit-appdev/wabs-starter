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

const fs        = require('fs');

try {
    fs.accessSync('docker', fs.constants.X_OK)
} catch (e) {
    if (e.code === 'ENOENT') {
        console.error('Error: Missing required dependency: docker. Please install docker prior to installing wabs-starter.');
    } else {
        console.warn('Error: Unable to execute docker.');
    }
    process.exit(1);
}