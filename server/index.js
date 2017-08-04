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
const express       = require('express');
const fs            = require('fs');
const http          = require('http');
const path          = require('path');

const wwwDir = path.resolve(__dirname, '../www');
const indexPath = path.resolve(wwwDir, 'index.html');

module.exports = function(port) {
    return new Promise((resolve, reject) => {
        const app = express();
        const server = http.createServer(app);

        app.use(html5Router());

        const listener = server.listen(port || 0, function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('Server listening on port ' + listener.address().port + '\n');
                resolve(server);
            }
        });
    });
};

module.exports(8000);

function html5Router() {
    const staticRouter = express.static(wwwDir);
    return function(req, res, next) {
        if (path.extname(req.path)) {
            staticRouter(req, res, next);
        } else {
            fs.stat(indexPath, function(err) {
                if (err && err.code === 'ENOENT') {
                    staticRouter(req, res, next);
                } else if (err) {
                    next(err);
                } else {
                    res.sendFile(indexPath);
                }
            });
        }
    }
}