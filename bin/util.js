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
const byuOauth      = require('byu-wabs-oauth');
const fs            = require('fs');
const path          = require('path');

exports.getAppRoot = function() {
    let curr = path.resolve(process.cwd(), 'x');
    while (true) {
        curr = path.dirname(curr);
        const fullPath = path.resolve(curr, 'package.json');
        try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            if (content.wabs) return curr;
        } catch (e) {}
        if (curr === '/') return '';
    }
};

exports.getPackage = function() {
    const fullPath = exports.getAppRoot();
    return fullPath ? JSON.parse(fs.readFileSync(path.resolve(fullPath, 'package.json'), 'utf8')) : null;
};

exports.testWso2Credentials = function(consumerKey, consumerSecret) {
    const oauth = byuOauth(consumerKey, consumerSecret, 'https://api.byu.edu/.well-known/openid-configuration');
    return oauth.getClientGrantAccessToken()
        .then(function(token) {
            return token && token.accessToken && true;
        })
        .catch(() => {
            return false;
        });
};

exports.stringLength = function(value, length) {
    if (value.length > length) value = value.substr(0, length);
    while (value.length < length) value += ' ';
    return value;
};