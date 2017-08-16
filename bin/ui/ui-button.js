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
const blessed       = require('blessed');
const colors        = require('./ui-colors');

module.exports = function(options) {
    const button = blessed.button(Object.assign({}, options, {
        bg: colors.focus.bg,
        fg: colors.focus.fg,
        height: 1,
        align: 'center'
    }));

    button.on('focus', () => {
        button.style.bg = colors.selected.bg;
        button.style.fg = colors.selected.fg;
        //button.render();
    });

    button.on('blur', () => {
        button.style.bg = colors.focus.bg;
        button.style.fg = colors.focus.fg;
        //button.render();
    });

    return button;
};