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
    const handlers = {
        added: [],
        change: [],
        focus: [],
        removed: []
    };
    const items = [];
    const boxes = new WeakMap();
    const keys = [];
    let active = null;
    let hasFocus = false;

    const container = blessed.box(Object.assign({}, options, {
        bg: colors.focus.bg,
        fg: colors.focus.fg,
        scrollable: true
    }));

    container.on('click', e => {
        const index = e.y - container.top + container.getScroll();
        if (index >= 0 && items.length > index) factory.index = index;
        factory.focus();
    });

    container.key(['up', 'down'], (ch, key) => {
        switch (key.name) {
            case 'up':
                process.nextTick(() => factory.index--);
                break;
            case 'down':
                factory.index++;
                break;
        }
        factory.focus();
    });


    Object.defineProperties(factory, {
        active: {
            get: () => active,
            set: v => {
                const index = items.indexOf(v);
                if (index !== -1) {
                    active = v;
                    const box = boxes.get(active);
                    box.focus();
                    emit('change', {
                        box: box,
                        index: index,
                        item: active
                    });
                } else {
                    active = null;
                    emit('change', null);
                }
            }
        },
        index: {
            get: () => items.indexOf(active),
            set: i => {
                if (i >= 0 && i < items.length) {
                    active = items[i];
                    const box = boxes.get(active);
                    box.focus();
                    emit('change', {
                        box: box,
                        index: i,
                        item: active
                    });
                } else if (i === -1) {
                    emit('change', null);
                }
            }
        },
        items: {
            get: () => items.slice(0)
        },
        length: {
            get: () => items.length
        }
    });

    factory.add = function(item) {
        items.push(item);

        const index = items.length - 1;

        const box = blessed.box({
            parent: container,
            top: index,
            height: 1,
            bg: colors.focus.bg,
            fg: colors.focus.fg,
            content: item.name
        });

        box.on('focus', () => {
            box.style.bg = colors.selected.bg;
            box.style.fg = colors.selected.fg;
        });

        box.on('blur', () => {
            box.style.bg = colors.focus.bg;
            box.style.fg = colors.focus.fg;
        });

        box.key(['up', 'down'], (ch, key) => {
            switch (key.name) {
                case 'up':
                    process.nextTick(() => factory.index--);
                    break;
                case 'down':
                    factory.index++;
                    break;
            }
            factory.focus();
        });

        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const k = keys[i];
            box.key(k.keys, k.callback);
        }

        boxes.set(item, box);

        container.append(box);

        emit('added', {
            box: box,
            index: index,
            item: item
        });
    };

    factory.focus = function() {
        factory.purge();
        if (items.length > 0 && factory.index !== -1) {
            const index = factory.index;
            const item = items[index];
            const box = boxes.get(item);
            box.focus();
            emit('focus', {
                box: box,
                index: index,
                item: item
            });
        } else {
            container.focus();
            emit('focus', null);
        }
        hasFocus = true;
    };

    factory.key = function(ar, callback) {
        const length = items.length;
        keys.push({ keys: ar, callback: callback });
        for (let i = 0; i < length; i++) boxes.get(items[i]).key(ar, callback);
    };

    factory.nameAvailable = function(name) {
        const length = items.length;
        for (let i = 0; i < length; i++) {
            if (items[i].name === name) return false;
        }
        return true;
    };

    factory.on = function(type, callback) {
        if (handlers.hasOwnProperty(type)) handlers[type].push(callback);
    };

    factory.purge = function() {
        items.forEach(item => {
            if (item.$new) factory.remove(item);
        });
    };

    factory.remove = function(itemOrIndex) {
        const item = typeof itemOrIndex === 'number' ? items[itemOrIndex] : itemOrIndex;
        const box = boxes.get(item);
        if (box) {
            const index = items.indexOf(item);
            const length = items.length;
            for (let i = index; i < length; i++) boxes.get(items[i]).position.top--;
            items.splice(index, 1);
            container.remove(box);
            emit('removed', {
                box: box,
                index: index,
                item: item
            });

            factory.index = index < items.length ? index : index - 1;
        }
    };

    factory.sort = function() {
        const length = items.length;
        items.sort((a, b) => {
            const ax = [];
            const bx = [];

            a.name.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.name.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

            while(ax.length && bx.length) {
                const an = ax.shift();
                const bn = bx.shift();
                const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if(nn) return nn;
            }

            return ax.length - bx.length;
        });
        for (let i = 0; i < length; i++) boxes.get(items[i]).top = i;
    };

    factory.update = function(item, properties) {
        if (!properties || typeof properties !== 'object') return;
        const index = items.indexOf(item);
        if (index === -1) return;

        if (properties.hasOwnProperty('name') && properties.name !== item.name && factory.nameAvailable(properties.name)) {
            const box = boxes.get(item);
            box.setContent(properties.name);
            item.name = properties.name;
        }
        if (properties.hasOwnProperty('consumerKey')) item.consumerKey = properties.consumerKey;
        if (properties.hasOwnProperty('consumerSecret')) item.consumerSecret = properties.consumerSecret;
        if (properties.hasOwnProperty('encryptSecret')) item.encryptSecret = properties.encryptSecret;
    };

    function emit(type) {
        const args = Array.from(arguments);
        args.shift();
        if (handlers.hasOwnProperty(type)) {
            handlers[type].forEach(cb => cb.apply(factory, args.slice()));
        }
    }

    return factory;
};