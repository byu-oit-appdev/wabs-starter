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
const cookieParser      = require('cookie-parser');     // required by WABS middleware
const bodyParser        = require('body-parser');       // required by WABS middleware
const express           = require('express');
const path              = require('path');
const byuWabs           = require('byu-wabs');

module.exports = function(options) {

    // create the express app and middleware
    const app = express();
    const wabs = byuWabs(options);

    // cookie parser needed for wabs authentication tools (required)
    app.use(cookieParser(options.encryptSecret));

    // body parser needed for brownies (required)
    app.use(bodyParser.urlencoded({ extended: false, type: '*/x-www-form-urlencoded'}));
    app.use(bodyParser.json());

    // middleware for routes and adding req.wabs object, required for all other WABS middleware to function (required)
    app.use(wabs.init());

    // add API routers here for your local REST API endpoints
    app.use('/api/example', require('./routers/example'));

    // html5 routing for paths that should resolve to the index file (recommended)
    app.use(wabs.html5Router({ indexPath: 'www/index.html' }));

    // static file routing for static files (recommended)
    app.use(express.static(path.resolve(__dirname, '../www/')));

    // catch any 404s to provide a beautified 404 response (recommended)
    app.use(function(req, res) { res.sendStatus(404); });

    // catch any errors to provide a beautified 500 response (recommended)
    app.use(wabs.catch());


    return app;
};