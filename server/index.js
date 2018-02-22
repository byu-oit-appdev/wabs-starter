/**
 *  @license
 *    Copyright 2018 Brigham Young University
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
const config        = require('../config');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const wabs          = require('byu-wabs')(config.wabs);

// create the express app
const app = express();

// must parse cookies before wabs.init
app.use(cookieParser(wabs.config.encryptSecret));
app.use(wabs.init());

// add your own middleware here
//
//

// serve index.html and static files
const publicDirectoryPath = config.build.dest;
app.use(wabs.index({ render: publicDirectoryPath + '/index.html' }));
app.use(express.static(publicDirectoryPath));

// start listening for requests
const listener = app.listen(config.server.port, function(err) {
    if (err) throw err;

    const port = listener.address().port;
    console.log('Server listening on port: ' + port);
    if (process.send) process.send({ type: 'server-listening', port: port });
});