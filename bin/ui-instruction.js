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
    const factory = {};

    const container = blessed.box(Object.assign({}, options, {
        bg: colors.blur.bg,
        fg: colors.blur.fg,
        scrollable: true
    }));

    const keysContainer = blessed.box({
        parent: container,
        top: 1,
        left: 1,
        right: 1,
        bottom: 0
    });

    const keys = {
        up:     { label: 'UP',      box: keyBox(0, 0),  default: 'N/A' },
        down:   { label: 'DN',      box: keyBox(0, 1),  default: 'N/A'  },
        left:   { label: 'LT',      box: keyBox(0, 2),  default: 'N/A'  },
        right:  { label: 'RT',      box: keyBox(0, 3),  default: 'N/A'  },
        enter:  { label: 'ENTER',   box: keyBox(1, 0),  default: 'N/A'  },
        esc:    { label: 'ESC',     box: keyBox(1, 1),  default: 'N/A'  },
        tab:    { label: 'TAB',     box: keyBox(1, 2),  default: 'N/A'  },
        exit:   { label: 'Q, ^C',   box: keyBox(1, 3),  default: 'Exit'  },
    };


    const message = blessed.box({
        parent: container,
        padding: 1,
        bg: 230,
        fg: 232,
        align: 'center'
    });
    message.hide();

    let timeoutId;

    factory.keys = function(config) {
        Object.keys(keys).forEach(key => {
            const item = keys[key];
            const value = config.hasOwnProperty(key) ? config[key] || item.default : item.default;
            const content = '{' + colors.focus.fg + '-fg}{' + colors.focus.bg + '-bg}' +
                item.label + '{/' + colors.focus.bg + '-bg}{/' + colors.focus.fg + '-fg}' +
                ' ' + value;
            item.box.setContent(content);
        });
        container.screen.render();
    };

    factory.message = function(data, time) {
        if (data && typeof data === 'object') {
            data = JSON.stringify(data);
        } else if (typeof data !== 'string') {
            data = String(data);
        }

        message.setContent(data);
        message.show();

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            message.hide();
            container.screen.render();
        }, time || 3000);
        container.screen.render();
    };

    function keyBox(row, column) {
        return blessed.box({
            parent: keysContainer,
            top: row,
            left: (100 * (column % 4) / 4) + '%',
            width: '25%',
            bg: colors.blur.bg,
            fg: colors.blur.fg,
            tags: true
        });
    }

    return factory;
};