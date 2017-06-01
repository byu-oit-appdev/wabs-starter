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
const childProcess  = require('child_process');
const copyDir       = require('copy-dir');
const fs            = require('fs');
const inquirer      = require('inquirer');
const path          = require('path');

const isWin = process.platform === 'win32';

inquirer.prompt(
    [
        { name: 'name', message: 'Application name:', validate: validName },
        { name: 'description', message: 'Description:' },
        { name: 'author', message: 'Author:' },
        { name: 'destination', message: 'Destination directory:', validate: required }
    ])
    .then(answers => {
        answers.destination = path.resolve(process.cwd(), answers.destination);

        // check that the destination is empty
        try {
            const destinationFiles = fs.readdirSync(answers.destination);
            if (destinationFiles.length > 0) {
                return inquirer.prompt(
                    [
                        {
                            name: 'confirm',
                            type: 'confirm',
                            message: 'Destination directory is not empty. Do you want to proceed?',
                            default: false
                        }
                    ])
                    .then(ans => {
                        answers.confirm = ans.confirm;
                    });
            }
        } catch (e) {
            if (e.code !== 'ENOENT') return Promise.reject(e);
            answers.confirm = true;
        }

        return answers;
    })
    .then(answers => {
        const source = path.resolve(__dirname, '../starter');
        const destination = answers.destination;

        // copy starter content
        copyDir.sync(source, destination);
        console.log('Application created at: ' + destination);

        // update package.json file
        const packagePath = path.resolve(destination, 'package.json');
        const pkgContent = fs.readFileSync(packagePath, 'utf8')
            .replace(/{{name}}/g, answers.name)
            .replace(/{{description}}/g, answers.description)
            .replace(/{{author}}/g, answers.author);
        fs.writeFileSync(packagePath, pkgContent);
        console.log('Updated package.json');

        // update the server/index.js
        const indexPath = path.resolve(destination, 'server/index.js');
        const indexContent = fs.readFileSync(indexPath, 'utf8')
            .replace(/{{name}}/g, answers.name);
        fs.writeFileSync(indexPath, indexContent);
        console.log('Updated server/index.js');

        // run npm install
        process.stdout.write('Running npm install. Please wait.');
        if (isWin) {
            const intervalId = setInterval(() => process.stdout.write('.'), 1000);
            childProcess.exec('npm install', { cwd: destination }, function(err, stdout, stderr) {
                clearInterval(intervalId);
                process.stdout.write('\r\n');
                console.log(stdout);
                console.error(stderr);
                if (err) {
                    console.error(err);
                } else {
                    console.log('Done');
                }
            });
        } else {
            process.stdout.write('\n');
            const child = childProcess.spawn('npm', ['install'], { cwd: destination });
            child.stdout.on('data', data => process.stdout.write(data.toString()));
            child.stderr.on('data', data => process.stderr.write(data.toString()));
            child.on('exit', code => {
                if (parseInt(code) === 0) {
                    console.log('Done.');
                } else {
                    console.log('Completed with exit code: ' + code);
                }
            });
        }
    })
    .catch(e => console.error(e.stack));


function required(value) {
    if (value.length === 0) return 'Input required';
    return true;
}

function validName(value) {
    if (value.length === 0) return 'Input required';
    if (!/^[a-z0-9-_]+$/.test(value)) return 'Invalid name. Must include only alpha-numeric characters, underscore, and dash.';
    return true;
}