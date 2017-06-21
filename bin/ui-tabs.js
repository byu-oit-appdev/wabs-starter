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

module.exports = function() {
    const factory = {};
    const store = [];
    let index = 0;

    factory.next = function() {
        index++;
        if (index >= store.length) index = 0;
        store[index].focus();
    };

    factory.previous = function() {
        index--;
        if (index < 0) index = store.length - 1;
        store[index].focus();
    };

    factory.push = function(item) {
        store.push(item);
        item.on('focus', () => {
            index = store.indexOf(item);
        })
    };

    factory.select = function(i) {
        index = i;
        store[i].focus();
    };

    return factory;
};