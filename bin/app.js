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

const nameRx = /^[A-Za-z_$-]+$/;

menu();

function create() {

}

function menu() {
    const data = config.read();
    const apps = Object.keys(data);

    const choices = ['Define New App'];
    if (apps.length > 0) choices.push('Update App', 'Rename App', 'Delete App');
    choices.push('Exit');

    console.log('=== MENU ===');

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
                case 'Define New App': return create();
                case 'Update App': return update();
                case 'Rename App': return rename();
                case 'Delete App': return remove();
                case 'Exit': return;
            }
        });
}

function update() {

}

function rename() {
    const data = config.read();
    const apps = Object.keys(data);

    const choices = apps.slice(0);
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Back to menu', value: '' });

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
            validate: v => nameRx.test(v),
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
            return menu();
        });
}

function remove() {
    const data = config.read();
    const apps = Object.keys(data);

    const choices = apps.slice(0);
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Back to menu', value: '' });

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
            return menu();
        });
}