# WABS Starter

This starter is preconfigured to optimize development and simplify deployment. It will work with very little additional effort on your part. This readme serves as a guide to using the starter.

**Estimated Set Up Time:** 2 minutes

## Table of Contents

- [Quick Start](#quick-start)
- [What's Included](#whats-included)
- [BYU Plugin](#byu-plugin)
    - [Site Title](#site-title)
    - [Site Navigation](#site-navigation)
    - [Site Search](#site-search)
- [File System Structure](#file-system-structure)
- [Production Build](#production-build)
- [Troubleshooting](#troubleshooting)

## Quick Start

This section details instructions for getting started with the development of your application.

1. Clone the project from github: `git clone git@github.com:byu-oit/wabs-starter.git`.

2. Log in to AWS

    1. Install AWS Login: https://github.com/byu-oit/awslogin

    2. Run the command: `awslogin` to log in

    2. Select the account: `dev-oit-byu`

3. From within the project directory run the command: `npm run dev`

    By default this will also cause the NodeJS server to run in debug mode on port 9229, allowing you to set up a remote debug session.

4. Open a browser to http://localhost:8460

Eventually you will need to set up your own WSO2 application and have your app use that instead of the `demo-app`. See the documentation at https://www.npmjs.com/package/byu-wabs to get started with that.

## What's Included?

- Authentication with CAS.

- Authorization with WSO2 (for `wabs-demo` application - [Set up own WSO2 application](#)).

- Using the latest BYU theme.

- Interoperability with the C-Framework.

- Vue Router

- Vuex ([Vuex Video Tutorial](https://www.youtube.com/watch?v=BGAu__J4xoc&list=PL4cUxeGkcC9i371QO_Rtkl26MwtiJ30P2))

- Gulp, Webpack, and BrowserSync

- SCSS Transpiler

## BYU Plugin

The BYU plugin for vue adds various bits of functionality for controlling site title, navigation menu, authenticated state, and search. You can access the functionality of these components within a Vue component using `this.$byu` or outside of a component using `app.$byu`.

- [Site Title](#site-title)
- [Site Navigation](#site-navigation)
- [Site Search](#site-search)

### Site Title

The site title is stored in a Vuex store.

**Set Title within a Component**

```js
this.$store.commit('siteTitle', 'My New Title')

this.$byu.site.title = 'My New Title';   // will commit to the store for you
```

**Get Title within a Component**

```js
let title;

title = this.$store.byu.title;

title = this.$byu.site.title;       // will get the title from the store
```

**Update Title Per Route**

You can update the title for a route change within the route component's configuration. The `byuTitle` function will be called when the route changes and uses this component. The `selected` parameter is the navigational link object that was selected to navigate to this page.

```html
<template>

</template>

<script>
    export default {

        byuTitle(selected) {
            return 'Demo Site | Home';
        }
    }
</script>
```

### Site Navigation Menu

The navigational menu that is part of the BYU header is stored in the Vuex store as an array of objects. Each object should have the following structure:

```js
{
    href: '/',  // the path to navigate to
    title: 'Link title',
    callback: link => { ... }   // optional function to perform custom navigation
}
```

**Set Navigation within a Component**

You can update the navigational menu within a component. This must be an array of objects. If the array is empty then the navigation menu will automatically be hidden.

```js
this.$store.commit('siteNavigation', [
    { href: '/', title: 'Home' },
    { href: '/page1', title: 'Page 1'
]);

// will commit to the store for you
this.$byu.site.navigation = [
    { href: '/', title: 'Home' },
    { href: '/page1', title: 'Page 1' }
];
```

**Get Navigation within a Component**

```js
let nav;

nav = this.$store.byu.navigation;

title = this.$byu.site.navigation;          // will get the title from the store
```

**Update Navigation Per Route**

You can update the navigation for a route change within the route component's configuration. The `byuTitle` function will be called when the route changes and uses this component. The `selected` parameter is the navigational link object that was selected to navigate to this page. The `links` parameter is the array of links that existed prior to reaching this page.

```html
<template>

</template>

<script>
    export default {

        byuNavigation(selected, links) {
            return [
                { href: selected.href, title: selected.title },
                { href: '/page1', title: 'Page 1' }
            ]
        }
    }
</script>
```

### Site Search

The search box can be enable or disabled from within the `src/js/app.js` file where the BYU plugin is included. Remove the search property to disable search entirely.

```js
Vue.use(BYU, {
    search: {                       // remove search object to disable search
        autoSearch: false,          // set to true to run search after autoSearchDelay
        autoSearchDelay: 300,       // the number of milliseconds to wait before auto searching
        callback: function(value, submitted) {  // the function to execute when search occurs.
            console.log('Searched for ' + value)
        },
        value: ''                   // value to initialize search box with
    }
});
```

The callback function received two parameters:

1. The `search` term.

2. A `boolean` that is `true` if the value was submitted for search or `false` if the search was caused by auto search.

**Get or Set Search Value**

Within a Vue component you can get or set the search value.

```js
this.$byu.search.value = 'New Search Value';    // set value

const value = this.$byu.search.value;           // get value
```

**Perform a Manual Search**

You can trigger the search manually by calling the search function. This function takes two optional paramters.

1. The search term. Defaults to what is in the search box.

2. Whether it is being submitted instead of by auto-search. Defaults to `true`.

```js
this.$byu.search('New search term');
```

## File System Structure

```
- server (NodeJS express server code)

- src (the front-end code)

    - components (a directory for your Vue components)

    - css (contains your main CSS file: main.scss)

    - js (contains your main JS file: app.js)

    - plugins (contains custom Vue plugins)

    - router (contains the router and Vue components used as views)

    - store (contains the Vuex store, including some modules)

- tasks (the code that builds your app)

- www (your built code)

- config.js (the build, run, and development configuration)
```

## Configuration

There are two types of configuration:

1. The WABS middleware configuration. To get this set up you'll want to modify the code in `server/index.js` and follow the instructions at https://www.npmjs.com/package/byu-wabs. This is where you'll be able to name your application and link it to your own WSO2 application instance.

2. The build / run configuration. This can be found in the project root directory at `config.js`. The configuration is documented.

## Production Build

Running your server with `npm run dev` will not store the `build.js` file on the hard drive. To accomplish that you'll want to run the command `npm run build`. You're deployment process should run this command with the environment variable `NODE_ENV` or `HANDEL_ENVIRONMENT_NAME` set to `'production'`.

## Troubleshooting

- **Error: Unable to load WABS configuration**

    The WABS middleware was missing part of the required configuration. Possible solutions:

    1. Make sure that your still logged in to AWS using the [AWS login script](https://github.com/byu-oit/awslogin). In the terminal execute the command `awslogin`. Once logged in then try to start the server again.

    2. Make sure that you have a [configuration defined in the AWS parameter store](https://www.npmjs.com/package/byu-wabs#in-the-aws-parameter-store) for your application.

    3. If you are using a local file for the configuration (**not recommended**) then verify that the file exists at the location you've specified.

- **Error: Unable to start server**

    This error is pretty generic. Try looking a little higher in the counsole output for more specific errors.
