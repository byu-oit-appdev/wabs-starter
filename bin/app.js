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
const byuOauth = require('byu-wabs-oauth');
const config        = require('./config');
const inquirer      = require('inquirer');
const Table         = require('cli-table');

const nameRx = /^[A-Za-z_$-]+$/;

switch(process.argv[3]) {
    case 'create':
        create(exit);
        break;
    case 'update':
        update(exit);
        break;
    case 'rename':
        rename(exit);
        break;
    case 'delete':
        remove(exit);
        break;
    case 'list':
        list(exit);
        break;
    default:
        menu();
}

function create(next) {
    const data = config.read();
    const apps = Object.keys(data);

    reset('CREATE APP');

    const questions = config.questions();
    questions.unshift({
        type: 'input',
        name: 'name',
        message: 'App name:',
        validate: v => apps.indexOf(v) === -1
    });

    return inquirer.prompt(questions)
        .then(answers => {
            data[answers.name] = {
                consumerKey: answers.consumerKey,
                consumerSecret: answers.consumerSecret,
                encryptSecret: answers.encryptSecret
            };
            config.write(data);
            if (next) return next();
        });
}

function exit() {
    reset();
    process.exit();
}

function list(next) {
    const data = config.read();
    const apps = Object.keys(data);
    const wellKnownUrl = 'https://api.byu.edu/.well-known/openid-configuration';
    apps.sort();

    reset('DEFINED APPS');

    // check the consumer key and secret for each app
    const promises = [];
    apps.forEach(app => {
        const item = data[app];
        const oauth = byuOauth(item.consumerKey, item.consumerSecret, wellKnownUrl);
        const promise = oauth.getClientGrantAccessToken()
            .then(token => !!token)
            .catch(() => false)
            .then(hasToken => {
                return {
                    name: app,
                    consumerKey: item.consumerKey,
                    consumerSecret: item.consumerSecret,
                    encryptSecret: item.encryptSecret,
                    valid: hasToken
                };
            });
        promises.push(promise);
    });

    return Promise.all(promises)
        .then(apps => {
            const table = new Table({
                head: ['APP', 'CONSUMER KEY', 'CONSUMER SECRET', 'ENCRYPT SECRET', 'VALID'],
                colWidths: [10, 20, 20, 15, 8]
            });
            apps.forEach(app => {
                const item = data[app];
                table.push([
                    app.name,
                    app.consumerKey,
                    app.consumerSecret,
                    app.encryptSecret,
                    '\u001b[' + (app.valid ? '32m' : '31m') + app.valid.toString().toUpperCase() + '\u001b[39m'
                ]);
            });
            console.log(table.toString());

            if (next) {
                console.log('\nAny key to continue');
                process.stdin.setRawMode(true);
                process.stdin.resume();

                return new Promise(resolve => process.stdin.on('data', resolve)).then(() => next());
            } else {
                process.exit(0);
            }
        });
}

function menu() {
    const data = config.read();
    const apps = Object.keys(data);

    const choices = ['Define New App'];
    if (apps.length > 0) {
        choices.unshift('List Apps');
        choices.push('Update App', 'Rename App', 'Delete App');
    }
    choices.push('Exit');

    reset('MENU');

    const questions = [
        {
            type: 'list',
            name: 'menu',
            message: 'Select an action:',
            choices: choices
        }
    ];

    return inquirer.prompt(questions)
        .then(answers => {
            switch (answers.menu) {
                case 'List Apps': return list(menu);
                case 'Create New App': return create(menu);
                case 'Update App': return update(menu);
                case 'Rename App': return rename(menu);
                case 'Delete App': return remove(menu);
                case 'Exit':
                    reset();
                    process.exit(0);
            }
        });
}

function update(next) {
    const data = config.read();
    const apps = Object.keys(data);

    reset('UPDATE APP');

    const choices = apps.slice(0);
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Back to menu', value: '' });

    return inquirer.prompt(
        [
            {
                type: 'list',
                name: 'name',
                message: 'App name:',
                choices: choices
            }
        ])
        .then(ans => {
            const name = ans.name;
            if (name) {
                const questions = config.questions(data[name]);
                return inquirer.prompt(questions)
                    .then(answers => {
                        data[answers.name] = {
                            consumerKey: answers.consumerKey,
                            consumerSecret: answers.consumerSecret,
                            encryptSecret: answers.encryptSecret
                        };
                        config.write(data);
                        if (next) return next();
                    });
            } else if (next) {
                return next();
            }
        });
}

function rename(next) {
    const data = config.read();
    const apps = Object.keys(data);

    const choices = apps.slice(0);
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Back to menu', value: '' });

    reset('RENAME APP');

    const questions = [
        {
            type: 'list',
            name: 'app',
            message: 'App to rename:',
            choices: choices
        },
        {
            type: 'input',
            name: 'name',
            message: 'New app name:',
            validate: (v, ans) => ans.app === v || (nameRx.test(v) && apps.indexOf(v) === -1),
            when: a => a.app !== ''
        }
    ];

    return inquirer.prompt(questions)
        .then(answers => {
            const app = answers.app;
            if (app !== '') {
                data[answers.name] = data[app];
                delete data[app];
                config.write(data);
            }
            if (next) return next();
        });
}

function remove(next) {
    const data = config.read();
    const apps = Object.keys(data);

    const choices = apps.slice(0);
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Back to menu', value: '' });

    reset('DELETE APP');

    const questions = [
        {
            type: 'list',
            name: 'app',
            message: 'App to remove:',
            choices: choices
        }
    ];

    return inquirer.prompt(questions)
        .then(answers => {
            const app = answers.app;
            if (app !== '') {
                delete data[app];
                config.write(data);
            }
            if (next) return next();
        });
}

function reset(title) {
    process.stdout.write('\x1B[2J\x1B[0f\u001b[0;0H');
    if (title) console.log('=== ' + title + ' ===\n');
}