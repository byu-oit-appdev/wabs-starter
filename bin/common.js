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

const colors = {
    blur: {
        bg: 236,
        fg: 255
    },
    focus: {
        bg: 238,
        fg: 252
    },
    selected: {
        bg: 255,
        fg: 0
    }
};



exports.button = function(options) {
    const button = blessed.button(Object.assign({}, options, {
        bg: colors.focus.bg,
        fg: colors.focus.fg,
        height: 1,
        align: 'center'
    }));

    button.on('focus', () => {
        button.style.bg = colors.selected.bg;
        button.style.fg = colors.selected.fg;
        button.render();
    });

    button.on('blur', () => {
        button.style.bg = colors.focus.bg;
        button.style.fg = colors.focus.fg;
        button.render();
    });

    return button;
};

exports.colors = colors;

exports.form = function(options) {
    const items = {};
    let active = false;
    let top = 0;

    const form = blessed.form(Object.assign({}, options.form, {
        bg: colors.blur.bg,
        fg: colors.blur.fg,
    }));

    const render = function() { form.parent.render() };

    if (options.title) {
        blessed.box({
            parent: form,
            bg: colors.blur.bg,
            fg: colors.blur.fg,
            height: 1,
            content: '{bold}' + options.title + '{/bold}',
            tags: true,
            align: 'center'
        });
        top += 2;
    }

    if (options.items) {
        Object.keys(options.items).forEach(key => {
            const data = typeof options.items[key] === 'string'
                ? { label: options.items[key] }
                : options.items[key];

            blessed.text({
                parent: form,
                content: data.label,
                tags: true,
                left: 0,
                top: top,
                height: 1,
            });

            const input = blessed.textbox({
                parent: form,
                left: 0,
                top: top + 1,
                height: 1,
                value: data.value || '',
                inputOnFocus: false,//true,
                name: data.name,
                bg: colors.focus.bg,
                fg: colors.focus.fg,
            });

            items[key] = {
                input: input,
                options: data,
                value: data.value || ''
            };

            top += 3;

            if (data.onChange) {
                let prev = null;
                input.on('keypress', () => {
                    process.nextTick(() => {
                        const value = input.value;
                        if (value !== prev) {
                            prev = value;
                            data.onChange.call(input, value);
                        }
                    });
                });
            }

            input.on('focus', () => {
                input.style.bg = colors.selected.bg;
                input.style.fg = colors.selected.fg;
                input.readInput();
            });

            input.on('blur', () => {
                input.style.bg = colors.focus.bg;
                input.style.fg = colors.focus.fg;
            });

            input.key(['escape', 'up', 'down'], (ch, key) => {
                switch (key.name) {
                    case 'escape':
                        form.cancel();
                        render();
                        break;
                    case 'up':
                        form.focusPrevious();
                        render();
                        break;
                    case 'down':
                        form.focusNext();
                        render();
                        break;
                }
            });

            input.key(['C-c'], (ch, key) => {
                process.exit(0);
            });
        });
    }

    if (options.submit) {
        const box = blessed.box({
            parent: form,
            bg: colors.blur.bg,
            fg: colors.blur.fg,
            height: 1,
            top: top
        });
        top += 2;

        const submit = exports.button({
            parent: box,
            content: 'Submit',
            left: 0,
            width: '50%-1'
        });

        form.on('submit', options.submit);

        submit.key(['escape', 'up', 'enter'], (ch, key) => {
            switch (key.name) {
                case 'escape':
                    form.cancel();
                    render();
                    break;
                case 'enter':
                    form.submit();
                    render();
                    break;
                case 'up':
                    form.focusPrevious();
                    render();
                    break;
            }
        });

        if (options.cancel) {
            const cancel = exports.button({
                parent: box,
                content: 'Cancel',
                left: '50%+1'
            });

            form.on('cancel', options.cancel);

            submit.key(['right'], () => {
                form.focusNext();
                render();
            });

            cancel.key(['escape', 'enter', 'left', 'up'], (ch, key) => {
                switch (key.name) {
                    case 'escape':
                    case 'enter':
                        form.cancel();
                        render();
                        break;
                    case 'left':
                        form.focusPrevious();
                        render();
                        break;
                    case 'up':
                        form.focusPrevious();
                        form.focusPrevious();
                        render();
                        break;
                }
            });
        }
    }

    form.on('focus', () => {
        if (!active) {
            active = true;
            if (options.items) {
                const key = Object.keys(options.items)[0];
                if (key) items[key].input.focus();
            }
        }
    });

    form.on('cancel', () => {
        active = false;
        Object.keys(items).forEach(key => {
            const data = items[key];
            data.input.setValue(data.value);
        });
    });
    form.on('submit', () => {
        active = false;
        Object.keys(items).forEach(key => {
            const data = items[key];
            data.value = data.input.getValue();
        });
    });

    return form;
};

exports.input = function(options) {
    const input = blessed.box(options);
    let value = options.content || '';

    input.on('keypress', e => {

    })
};

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