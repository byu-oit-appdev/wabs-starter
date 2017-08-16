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
const config        = require('./config');
const inquirer      = require('inquirer');
const util          = require('./util');

module.exports = function() {
    const store = config.read();
    const pkg = util.getPackage();
    const defaults = {
        appId: '',
        consumerKey: '',
        consumerSecret: '',
        encryptSecret: '',
        port: 8000,
        debugPort: 9229,
        title: '',
        author: '',
        email: '',
        destination: ''
    };
    const result = {};

    // if within wabs app then we're making an update
    if (pkg) {
        const appId = pkg.name;
        defaults.appId = appId;

        // get destination
        defaults.destination = util.getAppRoot();

        // get author and email
        const match = /^([\s\S]*?) ?(<[\s\S]*?>)$/.exec(pkg.author || '');
        if (match) {
            defaults.author = match[1];
            defaults.email = match[2];
        }
    }

    const question = {
        name: 'appId',
        message: 'Application ID:',
        default: defaults.appId,
        validate: function(value) {
            if (!/^[a-z][a-z-]*$/.test(value)) return 'Must be all lowercase letters and dashes (-). Cannot start with dash.';
            if (value.length > 214) return 'Must have length less than 215';
            return true;
        }
    };
    return inquirer([question])

        // get application title if start from nothing
        .then(function(answers) {
            Object.assign(result, answers);
            if (pkg) return {};
            return inquirer.prompt([{
                name: 'title',
                message: 'Application Title:'
            }]);
        })

        // get author and ports
        .then(function(answers) {
            Object.assign(result, answers);

            // get app details from store
            if (store.hasOwnProperty(answers.appId)) {
                const item = store[answers.appId];
                defaults.consumerKey = item.consumerKey;
                defaults.consumerSecret = item.consumerSecret;
                defaults.encryptSecret = item.encryptSecret;
                defaults.port = item.port;
                defaults.debugPort = item.debugPort;
            }

            const questions = [
                {
                    name: 'author',
                    message: 'Author Name: ',
                    default: defaults.author
                },
                {
                    name: 'email',
                    message: 'Author Email: ',
                    default: defaults.email
                },
                {
                    name: 'port',
                    message: 'Default Server Port: ',
                    default: defaults.port
                },
                {
                    name: 'debugPort',
                    message: 'Default Debug Port: ',
                    default: defaults.debugPort
                }
            ];
            return inquirer.prompt(questions);
        })

        // get WSO2 credentials
        .then(function(answers) {
            Object.assign(result, answers);
            return getWso2Credentials(defaults);
        })

        // get encrypt secret
        .then(function(answers) {
            Object.assign(result, answers);
            if (!result.consumerKey && !result.consumerSecret) return {};
            const questions = [
                {
                    name: 'encryptSecret',
                    message: 'Encrypt Secret: ',
                    default: defaults.encryptSecret
                }
            ];
            return inquirer.prompt(questions);
        })

        // get output directory
        .then(function(answers) {
            Object.assign(result, answers);
            return getDestination(defaults);
        })


};

function getDestination() {

}

function getWso2Credentials(defaults) {
    const questions = [
        {
            name: 'consumerKey',
            message: 'WSO2 Consumer Key: ',
            default: defaults.consumerKey
        },
        {
            name: 'consumerSecret',
            message: 'WSO2 Consumer Secret: ',
            default: defaults.consumerSecret
        }
    ];
    return inquirer.prompt(questions)
        .then(function(answers) {
            // TODO: validate key and secret, if failure ask for re-entry
        });
}