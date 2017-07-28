'use strict';
const blessed       = require('blessed');
const byuOauth      = require('byu-wabs-oauth');
const common        = require('./common');
const config        = require('./config');
const copydir       = require('copy-dir');
const fs            = require('fs');
const path          = require('path');

const colors = common.colors;
const program = blessed.program();
const KEY = 0;
const MOUSE = 1;

const store = {
    actions: common.selectable(),
    edit: common.selectable(),
    list: {
        index: -1,
        items: [],
    },
    views: common.views()
};

(function() {
    let mode = KEY;

    program.on('mouse', () => mode = MOUSE);
    program.key(['up', 'down', 'left', 'right', 'tab', 'S-tab', 'enter', 'escape'], () => mode = KEY);

    Object.defineProperty(store, 'mode', {
        get: () => mode
    });
})();


//////////////////////////////
//      ENTIRE SCREEN       //
//////////////////////////////

const screen = blessed.screen({
    smartCSR: true,
    useBCE: true,
    title: 'WABS Starter',
    bg: colors.blur.bg,
    fg: colors.blur.fg
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
    width: '28%',
    bottom: 2
});

//////////////////////////////
//      CREATE BUTTON       //
//////////////////////////////

const create = common.button({
    parent: apps,
    top: 0,
    left: 0,
    content: 'Create New App'
});

create.run = function() {
    const item = {
        $new: true,
        name: '',
        consumerKey: '',
        consumerSecret: '',
        encryptSecret: ''
    };
    list.add(item);
    list.active = item;
    views.show();
    store.views.show(actions.edit);
    edit.items.name.input.focus();
    screen.render();
};

create.key(['down', 'enter'], (ch, key) => {
    switch (key.name) {
        case 'down':
            if (list.length > 0) {
                list.focus();
                screen.render();
            }
            break;
        case 'enter':
            create.run();
            break;
    }
});

create.on('focus', () => {
    const keys = { enter: 'Create New' };
    if (list.length > 0) {
        keys.down = 'App List';
    } else {
        list.hide();
    }
    instruction.keys(keys);
    actions.hide();
    store.views.show(null);
});

create.on('click', () => {
    create.run();
});

//////////////////////////////
//      APPS LIST           //
//////////////////////////////

const list = common.list({
    parent: apps,
    top: 2,
    bottom: 0,
    left: 0
});

list.save = function() {
    const result = {};
    list.items.forEach(item => {
        result[item.name] = {
            consumerKey: item.consumerKey,
            consumerSecret: item.consumerSecret,
            encryptSecret: item.encryptSecret
        };
    });
    config.write(result);
};

list.load = function() {
    const data = config.read();
    Object.keys(data).forEach(key => {
        list.add(Object.assign({}, data[key], { name: key }));
    });
};

list.on('focus', active => {
    if (active) {
        actions.show();
        views.show();
        store.views.show(null);

        actions.title.setContent('{bold}' + (active ? active.item.name : '') + '{/bold}');

        const form = edit.items;
        form.name.value = active ? active.item.name : '';
        form.consumerKey.value = active ? active.item.consumerKey : '';
        form.consumerSecret.value = active ? active.item.consumerSecret : '';
        form.encryptSecret.value = active ? active.item.encryptSecret : '';

        instruction.keys({
            up: list.index === 0 ? 'Create Button' : 'Previous',
            down: active.index + 1 < list.length ? 'Next' : '',
            right: 'App Menu',
            enter: 'App Menu'
        });

        screen.render();
    } else {
        create.focus();
    }
});

list.key(['up', 'down', 'right', 'enter'], (ch, key) => {
    switch (key.name) {
        case 'up':
            if (list.index === 0) {
                create.focus();
                actions.hide();
                views.hide();
            }
            screen.render();
            break;
        case 'enter':
        case 'right':
            actions.edit.focus();
            store.actions.index = 1;
            screen.render();
            break;

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
    width: '28%',
    bottom: 2,
    scrollable: true
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
    content: 'Build App',
    mouse: true
});
store.actions.items.push(actions.build);

actions.edit = common.button({
    parent: actions,
    top: 4,
    left: 0,
    content: 'Edit App',
    mouse: true
});
store.actions.items.push(actions.edit);

actions.test = common.button({
    parent: actions,
    top: 6,
    left: 0,
    content: 'Test WSO2',
    mouse: true
});
store.actions.items.push(actions.test);

actions.duplicate = common.button({
    parent: actions,
    top: 8,
    left: 0,
    content: 'Duplicate App',
    mouse: true
});
store.actions.items.push(actions.duplicate);

actions.delete = common.button({
    parent: actions,
    top: 10,
    left: 0,
    content: 'Delete App',
    mouse: true
});
store.actions.items.push(actions.delete);



//////////////////////////////
//      VIEWS CONTAINER     //
//////////////////////////////

const views = blessed.box({
    parent: screen,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    padding: 1,
    top: 0,
    left: '56%',
    bottom: 2
});

//////////////////////////////
//      BUILD VIEW          //
//////////////////////////////

const build = common.form({
    form: {
        parent: views
    },
    title: 'Build App',
    items: {
        destination: {
            label: 'Destination Directory',
            onChange: value => {
                buildDir.setContent(build.message(value));
                screen.render();
            }
        }
    },
    submit: {
        label: 'Build',
        handler: function(data) {
            const dest = data.textbox;
            const src = path.resolve(__dirname, '../starter');

            instruction.message('Please wait...');
            screen.render();
            setTimeout(function() {
                copydir(src, dest, function(err) {
                    if (err) {
                        instruction.message(err.toString());
                    } else {
                        instruction.message('App created at: ' + dest);
                        store.actions.index = 0;
                    }
                    screen.render();
                });
            }, 0);
        }
    },
    cancel: function() {
        if (store.mode === KEY) {
            store.actions.index = 0;
        } else {
            list.focus();
        }
    }
});

build.message = function(dirPath) {
    const fullPath = path.resolve(process.cwd(), dirPath || '');
    let exists = false;
    let empty = true;

    try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) exists = true;
    } catch (e) {}

    if (exists && fs.readdirSync(fullPath).length > 0) empty = false;

    return 'Build will be output to the following directory:\n' +
        fullPath +
        (!exists ? '\n\nDirectory will be created for you.' : '') +
        (!empty ? '\n\nWARNING: Directory not empty' : '');
};

const buildDir = blessed.box({
    top: 7,
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    content: build.message()
});

build.append(buildDir);
store.views.set(actions.build, build);

//////////////////////////////
//      EDIT VIEW           //
//////////////////////////////

const edit = common.form({
    form: {
        parent: views
    },
    title: 'Edit App',
    items: {
        name: 'Name',
        consumerKey: 'Consumer Key',
        consumerSecret: 'Consumer Secret',
        encryptSecret: 'Encrypt Secret'
    },
    submit: {
        label: 'Save',
        handler: function(data) {
            const d = data.textbox;
            const name = d[0];
            const nameChange = list.active.name !== name;

            // verify that name is valid
            if (name.length === 0) return screen.message('App name required');
            if (name.length > 30) return screen.name('App name must be 30 characters or less');
            if (!/^[a-zA-Z0-9-]+$/.test(name)) return screen.message('App name must be alpha-numeric and can have dashes');
            if (nameChange && !list.nameAvailable(name)) return screen.message('App name already in use');

            // update in memory store
            if (list.active.$new) delete list.active.$new;
            list.update(list.active, {
                name: name,
                consumerKey: d[1],
                consumerSecret: d[2],
                encryptSecret: d[3]
            });

            if (nameChange) actions.title.setContent('{bold}' + name + '{/bold}');

            list.save();
            screen.message('Edits saved.');

            const active = list.active;
            if (active && active.consumerKey && active.consumerSecret) {
                test.wso2(active.consumerKey, active.consumerSecret)
                    .then(success => {
                        screen.message('Edits saved. WSO2 consumer key and secret are ' + (success ? '' : 'not ') + 'valid.');
                    });
            }

            list.show();
            if (store.mode === KEY) {
                store.actions.index = 1;
            } else {
                list.focus();
            }
        }
    },
    cancel: function() {
        if (list.active.$new) list.remove(list.active);
        if (list.length === 0) {
            create.focus();
        } else if (store.mode === KEY) {
            store.actions.index = 1;
        } else {
            list.focus();
        }
    }
});
store.views.set(actions.edit, edit);

//////////////////////////////
//      TEST VIEW           //
//////////////////////////////

const test = common.form({
    form: {
        parent: views
    },
    title: 'Test WSO2',
    submit: {
        label: 'Test',
        handler: function() {
            const active = list.active;
            if (!active) return screen.message('App to test WSO2 key and secret not specified.');
            if (!active.consumerKey) return screen.message('App missing consumer key.');
            if (!active.consumerSecret) return screen.message('App missing consumer secret.');

            test.wso2(active.consumerKey, active.consumerSecret)
                .then(success => {
                    screen.message('WSO2 consumer key and secret are ' + (success ? '' : 'not ') + 'valid.');
                });

            if (store.mode === KEY) {
                store.actions.index = 2;
            } else {
                list.focus();
            }
        }
    },
    cancel: function() {
        if (store.mode === KEY) {
            store.actions.index = 2;
        } else {
            list.focus();
        }
    }
});

test.wso2 = function(consumerKey, consumerSecret) {
    const oauth = byuOauth(consumerKey, consumerSecret, 'https://api.byu.edu/.well-known/openid-configuration');
    screen.message('Testing WSO@ consumer key and secret now. Please wait...');
    return oauth.getClientGrantAccessToken()
        .then(function(token) {
            return token && token.accessToken && true;
        })
        .catch(() => {
            return false;
        });
};

test.append(blessed.box({
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    top: 4,
    content: 'Clicking submit will initialize a test to WSO2 to validate that your consumer key and consumer secret are valid.'
}));
store.views.set(actions.test, test);

//////////////////////////////
//      DUPLIDATE VIEW      //
//////////////////////////////

const duplicate = common.form({
    form: {
        parent: views
    },
    title: 'Duplicate App',
    items: {
        name: {
            label: 'Duplicate to Name',
            onChange: value => {
                duplicateError.setContent(list.nameAvailable(value) ? '' : 'Another app already exists with this name.');
                screen.render();
            }
        }
    },
    submit: {
        label: 'Duplicate',
        handler: function(data) {
            const name = data.textbox;
            if (!list.nameAvailable(name)) return screen.message('Another app already exists with this name.');

            const item = Object.assign({}, list.active, { name: name });
            list.add(item);
            list.sort();
            list.save();
            screen.message('Duplicate saved.');

            list.active = item;
            list.focus();
        }
    },
    cancel: function() {
        if (store.mode === KEY) {
            store.actions.index = 3;
        } else {
            list.focus();
        }
    }
});
const duplicateError = blessed.box({
    bg: colors.blur.bg,
    fg: colors.blur.fg,
    top: 7,
    content: ''
});
duplicate.append(duplicateError);
store.views.set(actions.duplicate, duplicate);

//////////////////////////////
//      DELETE VIEW         //
//////////////////////////////

const deleteApp = common.form({
    form: {
        parent: views
    },
    title: 'Delete App',
    submit: {
        label: 'Confirm',
        handler: function() {
            list.remove(list.active);
            list.focus();
            list.save();
            screen.message('Delete saved.');
        }
    },
    cancel: function() {
        if (list.length === 0) {
            list.hide();
            create.focus();
        } else {
            if (store.mode === KEY) {
                store.actions.index = 4;
            } else {
                list.focus();
            }
        }
    }
});
store.views.set(actions.delete, deleteApp);

//////////////////////////////
//      INSTRUCTION         //
//////////////////////////////

const instruction = common.instruction({
    parent: screen,
    bottom: 0,
    height: 3
});

screen.instruction = instruction;
screen.message = instruction.message;



//////////////////////////////
//                          //
//      EVENT LOGIC         //
//                          //
//////////////////////////////

store.actions.items.forEach((btn, index) => {
    const length = store.actions.items.length;
    const label = btn.getContent().split(' ')[0];
    const keys = {
        up: index > 0 ? 'Previous' : '',
        down: index + 1 < length ? 'Next' : '',
        left: 'App List',
        right: label,
        enter: label,
        esc: 'App List'
    };

    btn.on('press', () => {
        store.actions.index = index;
        store.views.active.view.focus();
        screen.render();
    });

    btn.on('focus', () => {
        actions.show();
        instruction.keys(keys);
    });

    btn.key(['up', 'down', 'left', 'right', 'escape', 'enter'], (ch, key) => {
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
            case 'right':
                store.views.active.view.focus();
                break;
        }

        screen.render();
    });
});

// Quit on Escape, q, or Control-C.
screen.key(['q', 'S-q', 'C-c'], () => process.exit(0));




//////////////////////////////
//                          //
//      INITIALIZATION      //
//                          //
//////////////////////////////

list.load();

if (list.length > 0) {
    list.index = 0;
    actions.title.setContent('{bold}' + list.active.name + '{/bold}');
    list.focus();
} else {
    list.hide();
    create.focus();
}

screen.render();