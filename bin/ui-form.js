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
const Button        = require('./ui-button');
const blessed       = require('blessed');
const colors        = require('./ui-colors');
const Tabs          = require('./ui-tabs');

module.exports = function(options) {
    const items = { _: [] };
    const itemsCount = options.items ? options.items.length : 0;
    const tabs = Tabs();
    const submitLabel = options.submit ? options.submit.label || 'Submit' : '';
    let active = false;
    let top = 0;
    let cancelBtn;
    let submitBtn;

    const form = blessed.form(Object.assign({}, options.form, {
        bg: colors.blur.bg,
        fg: colors.blur.fg,
    }));
    form.items = items;

    const keys = function() { form.screen.instruction.keys.apply(form.screen.instruction, arguments)};

    const render = function() { form.screen.render() };

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
        Object.keys(options.items).forEach((key, index) => {
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
                mouse: true
            });

            items[key] = {
                input: input,
                options: data
            };
            Object.defineProperty(items[key], 'value', {
                get: () => input.getValue(),
                set: v => input.setValue(v)
            });
            if (index === 0) items._first = items[key];
            items._last = items[key];
            tabs.push(input);

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
                tabs.index = index;

                keys({
                    up: index === 0 ? 'Cancel Button' : 'Previous',
                    down: index + 1 < itemsCount ? 'Next' : submitLabel + ' Button',
                    left: 'Cancel Button',
                    right: submitLabel + ' Button',
                    tab: 'Next',
                    esc: 'Cancel Button',
                    enter: 'Next'
                });

                render();
            });

            input.on('blur', () => {
                input.style.bg = colors.focus.bg;
                input.style.fg = colors.focus.fg;
            });

            input.key(['escape', 'enter', 'up', 'down', 'left', 'right', 'tab', 'S-tab'], (ch, key) => {
                switch (key.name) {
                    case 'escape':
                        cancel.focus();
                        render();
                        break;
                    case 'left':
                        if (cancelBtn) {
                            cancelBtn.focus();
                        } else if (submitBtn) {
                            submitBtn.focus();
                        } else {
                            form.cancel();
                        }
                        render();
                        break;
                    case 'right':
                        if (submitBtn) {
                            submitBtn.focus();
                        } else if (cancelBtn) {
                            cancelBtn.focus();
                        }
                        render();
                        break;
                    case 'up':
                        tabs.previous();
                        render();
                        break;
                    case 'down':
                    case 'enter':
                    case 'tab':
                        input.setValue(input.getValue().replace(/\t/g, ''));
                        tabs[key.shift ? 'previous' : 'next']();
                        render();
                        break;
                }
            });

            input.key(['C-c'], () => {
                process.exit(0);
            });
        });
    }

    const box = blessed.box({
        parent: form,
        bg: colors.blur.bg,
        fg: colors.blur.fg,
        height: 1,
        top: top
    });
    top += 2;

    const submit = Button({
        parent: box,
        content: options.submit.label || 'Submit',
        left: 0,
        width: '50%-1',
        mouse: true
    });
    submitBtn = submit;
    tabs.push(submit);

    const cancel = Button({
        parent: box,
        content: 'Cancel',
        left: '50%+1',
        mouse: true
    });
    cancelBtn = cancel;
    tabs.push(cancel);


    submitBtn.on('press', () => {
        form.submit();
        render();
    });

    submitBtn.on('focus', () => {
        keys({
            up: itemsCount > 0 ? "Previous" : '',
            right: 'Cancel Button',
            enter: submitLabel,
            esc: 'Cancel Button',
            tab: 'Next'
        });
    });

    form.on('submit', options.submit.handler || options.submit);

    submit.key(['escape', 'up', 'S-tab', 'right', 'tab'], (ch, key) => {
        switch (key.name) {
            case 'escape':
                cancel.focus();
                break;
            case 'up':
                if (itemsCount > 0) {
                    tabs.previous();
                    render();
                }
                break;
            case 'right':
                tabs.next();
                render();
                break;
            case 'tab':
                tabs[key.shift ? 'previous' : 'next']();
                render();
                break;
        }
    });

    cancel.on('press', () => {
        form.cancel();
        render();
    });

    cancel.on('focus', () => {
        keys({
            up: options.items && options.items.length > 0 ? "Previous" : '',
            left: submitLabel + ' Button',
            enter: 'Cancel',
            esc: 'Cancel',
            tab: 'Next'
        })
    });

    form.on('cancel', options.cancel);

    cancel.key(['escape', 'left', 'up', 'S-tab', 'tab'], (ch, key) => {
        switch (key.name) {
            case 'escape':
                form.cancel();
                break;
            case 'left':
                tabs.previous();
                render();
                break;
            case 'up':
                if (items._last) {
                    items._last.input.focus();
                } else if (itemsCount > 0) {
                    items._[itemsCount - 1].input.focus();
                }
                render();
                break;
            case 'tab':
                tabs[key.shift ? 'previous' : 'next']();
                render();
                break;
        }
    });

    form.on('focus', () => {
        if (!active) {
            active = true;
            tabs.select(0);
        }
    });

    form.on('cancel', () => {
        active = false;
        Object.keys(items).forEach(key => {
            const data = items[key];
            if (data.input) data.input.setValue(data.value);
        });
    });

    form.on('submit', () => {
        active = false;
        Object.keys(items).forEach(key => {
            const data = items[key];
            if (data.input) data.value = data.input.getValue();
        });
    });

    return form;
};