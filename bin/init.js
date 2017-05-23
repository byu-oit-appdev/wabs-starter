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

const copyDir       = require('copy-dir');
const fs            = require('fs');
const inquirer      = require('inquirer');
const path          = require('path');
const spawn         = require('child_process').spawn;

inquirer.prompt(
    [
        { name: 'name', message: 'Application name:', validate: validName },
        { name: 'description', message: 'Description:' },
        { name: 'author', message: 'Author:' },
        { name: 'destination', message: 'Destination directory:', validate: required }
    ])
    .then(answers => {
        const source = path.resolve(__dirname, '../starter');
        const destination = path.resolve(process.cwd(), answers.destination);

        // copy starter content
        copyDir.sync(source, destination);

        // update package.json file
        const packagePath = path.resolve(destination, 'package.json');
        const pkgContent = fs.readFileSync(packagePath, 'utf8')
            .replace(/{{name}}/g, answers.name)
            .replace(/{{description}}/g, answers.description)
            .replace(/{{author}}/g, answers.author);
        fs.writeFileSync(packagePath, pkgContent);

        // update the server/index.js
        const indexPath = path.resolve(destination, 'server/index.js');
        const indexContent = fs.readFileSync(indexPath, 'utf8')
            .replace(/{{name}}/g, answers.name);
        fs.writeFileSync(indexPath, indexContent);

        // run npm install
        const child = spawn('npm', ['install'], { cwd: destination });
        child.stdout.on('data', data => process.stdout.write(data.toString()));
        child.stderr.on('data', data => process.stderr.write(data.toString()));
        child.on('exit', code => {
            if (parseInt(code) === 0) {
                console.log('Done.');
            } else {
                console.log('Completed with exit code: ' + code);
            }
        });
    });


function required(value) {
    if (value.length === 0) return 'Input required';
    return true;
}

function validName(value) {
    if (value.length === 0) return 'Input required';
    if (!/^[a-z0-9-_]+$/.test(value)) return 'Invalid name. Must include only alpha-numeric characters, underscore, and dash.';
    return true;
}