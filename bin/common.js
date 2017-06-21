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

exports.button      = require('./ui-button');
exports.colors      = require('./ui-colors');
exports.list        = require('./ui-list');
exports.form        = require('./ui-form');
exports.tabs        = require('./ui-tabs');

exports.selectable = function() {
    const store = { items: [] };
    let index = 0;

    // changing action index changes focused item
    Object.defineProperty(store, 'index', {
        get: () => index,
        set: i => {
            if (i >= 0 && i < store.items.length) {
                index = i;
                store.items[i].focus();
            }
        }
    });

    return store;
};

exports.views = function() {
    const factory = {};
    const store = [];
    let active = null;

    Object.defineProperty(factory, 'active', { enumerable: true, get: () => active });

    factory.set = function(parent, view) {
        view.hide();
        store.push({ parent: parent, view: view });

        parent.on('focus', () => {
            factory.show(parent);
        });
    };

    factory.show = function(parent) {
        active = null;
        store.forEach(item => {
            if (item.parent === parent) {
                active = item;
                item.view.show();
            } else {
                item.view.hide();
            }
        });
    };

    return factory;
};