'use strict';
const blessed       = require('blessed');
const common        = require('./common');
const path          = require('path');

const colors = common.colors;

const store = {
    actions: common.selectable(),
    edit: common.selectable(),
    list: {
        index: -1,
        items: [],
    },
    views: common.views()
};


for (let i = 0; i < 100; i++) { store.list.items.push('ABC_' + i); }




//////////////////////////////
//      ENTIRE SCREEN       //
//////////////////////////////

const screen = blessed.screen({
    smartCSR: true,
    useBCE: true,
    title: 'WABS Starter'
});

// background color
blessed.box({
    parent: screen,
    bg: colors.blur.bg
});

//////////////////////////////
//      APPS COLUMN         //
//////////////////////////////

const apps = blessed.box({
    parent: screen,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    padding: 1,
    width: '28%'
});

const create = common.button({
    parent: apps,
    top: 0,
    left: 0,
    content: 'Create New App'
});

const list = blessed.list({
    parent: apps,
    top: 2,
    bottom: 0,
    left: 0,
    items: store.list.items.slice(0),
    keys: false,
    style: {
        item: { bg: colors.blur.bg, fg: colors.blur.fg },
        selected: { bg: colors.selected.bg, fg: colors.selected.fg }
    }
});


//////////////////////////////
//      ACTIONS COLUMN      //
//////////////////////////////

const actions = blessed.box({
    parent: screen,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    padding: 1,
    left: '28%',
    width: '28%'
});

actions.title = blessed.box({
    parent: actions,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    top: 0,
    left: 0,
    height: 1,
    align: 'center',
    content: '',
    tags: true
});

actions.build = common.button({
    parent: actions,
    top: 2,
    left: 0,
    content: 'Build App'
});
store.actions.items.push(actions.build);

actions.edit = common.button({
    parent: actions,
    top: 4,
    left: 0,
    content: 'Edit App'
});
store.actions.items.push(actions.edit);

actions.test = common.button({
    parent: actions,
    top: 6,
    left: 0,
    content: 'Test WSO2'
});
store.actions.items.push(actions.test);

actions.duplicate = common.button({
    parent: actions,
    top: 8,
    left: 0,
    content: 'Duplicate App'
});
store.actions.items.push(actions.duplicate);

actions.delete = common.button({
    parent: actions,
    top: 10,
    left: 0,
    content: 'Delete App'
});
store.actions.items.push(actions.delete);



//////////////////////////////
//      BUILD VIEW           //
//////////////////////////////

const buildDir = blessed.box({
    top: 7,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    content: 'Build will be output to the following directory:\n' + process.cwd()
});

const build = common.form({
    form: {
        parent: screen,
        padding: 1,
        left: '56%'
    },
    title: 'Build App',
    items: {
        destination: {
            label: 'Destination Directory',
            onChange: value => {
                const str = 'Build will be output to the following directory:\n' +
                    path.resolve(process.cwd(), value);
                buildDir.setContent(str);
                screen.render();
            }
        }
    },
    submit: function(data) {

    },
    cancel: function() {
        store.actions.index = 0;
    }
});
build.append(buildDir);
store.views.set(actions.build, build);

//////////////////////////////
//      EDIT VIEW           //
//////////////////////////////

const edit = common.form({
    form: {
        parent: screen,
        padding: 1,
        left: '56%'
    },
    title: 'Edit App',
    items: {
        name: 'Name',
        consumerKey: 'Consumer Key',
        consumerSecret: 'Consumer Secret',
        encryptSecret: 'Encrypt Secret'
    },
    submit: function(data) {

    },
    cancel: function() {
        store.actions.index = 1;
    }
});
store.views.set(actions.edit, edit);

//////////////////////////////
//      TEST VIEW           //
//////////////////////////////

const test = common.form({
    form: {
        parent: screen,
        padding: 1,
        left: '56%'
    },
    title: 'Test WSO2',
    submit: function(data) {

    },
    cancel: function() {
        store.actions.index = 2;
    }
});
test.append(blessed.box({
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    top: 4,
    content: 'Clicking submit will initialize a test to WSO2 to validate that your consumer key and consumer secret are valid.'
}));
store.views.set(actions.test, test);

/*const edit = blessed.form({
    parent: screen,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    padding: 1,
    left: '56%'
});
store.edit.items.push(common.input(edit, 0, 'name', 'Name', ''));
store.edit.items.push(common.input(edit, 3, 'consumerKey', 'Consumer Key', ''));
store.edit.items.push(common.input(edit, 6, 'consumerSecret', 'Consumer Secret', ''));
store.edit.items.push(common.input(edit, 9, 'encryptSecret', 'Encrypt Secret', ''));
store.views.set(actions.edit, edit);

form.keys([])

edit.on('focus', () => {
    store.edit.items[0].focus();
});*/








const message = blessed.message({
    parent: screen,
    bottom: 0,
    right: 0,
    width: 40,
    height: 5,
    bg: 226,
    fg: 0
});




//////////////////////////////
//                          //
//      EVENT LOGIC         //
//                          //
//////////////////////////////

create.key(['down'], () => {
    list.focus();
    screen.render();
});

list.on('focus', () => {
    list.style.selected = { bg: colors.selected.bg, fg: colors.selected.fg };
    actions.show();
});

list.key(['up', 'down', 'right', 'enter'], (ch, key) => {
    switch (key.name) {
        case 'up':
            if (store.list.index > 0) {
                store.list.index--;
                list.select(store.list.index);
                list.render();
                actions.title.setContent('{bold}' + store.list.items[store.list.index] + '{/bold}');
            } else {
                create.focus();
                list.style.selected = { bg: colors.blur.bg, fg: colors.blur.fg };
                actions.hide();
            }
            break;
        case 'down':
            if (store.list.items.length > store.list.index + 1) {
                store.list.index++;
                list.select(store.list.index);
                list.render();
                actions.title.setContent('{bold}' + store.list.items[store.list.index] + '{/bold}');
            }
            break;
        case 'enter':
        case 'right':
            list.style.selected = { bg: colors.blur.bg, fg: colors.blur.fg };
            //list.style.selected = { bg: colors.focus.bg, fg: colors.focus.fg };
            actions.edit.focus();
            store.actions.index = 1;
            break;

    }
    message.log('' + store.list.index + ':' + store.list.items.length);
});

store.actions.items.forEach((btn, index) => {
    btn.key(['up', 'down', 'left', 'right', 'escape', 'enter'], (ch, key) => {
        message.log(key.name);
        switch (key.name) {
            case 'up':
                store.actions.index = index - 1;
                break;
            case 'down':
                store.actions.index = index + 1;
                break;
            case 'escape':
            case 'left':
                list.focus();
                break;
            case 'enter':
            case 'right':
                store.views.active.view.focus();
                break;
        }

        screen.render();
    });
});

// Quit on Escape, q, or Control-C.
screen.key(['q', 'C-c'], function(ch, key) {
    return process.exit(0);
});




//////////////////////////////
//                          //
//      INITIALIZATION      //
//                          //
//////////////////////////////

if (store.list.items.length > 0) {
    store.list.index = 0;
    list.select(0);
    actions.title.setContent('{bold}' + store.list.items[0] + '{/bold}');
    list.focus();
} else {
    create.focus();
}


screen.render();