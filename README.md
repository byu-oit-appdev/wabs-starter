# WABS Starter

This starter is preconfigured to optimize development and simplify deployment. It will work with very little additional effort on your part. This readme serves as a guide to using the starter.

**Estimated Set Up Time:** 2 minutes

**Customized Set Up Time:** 5 minutes

*2 minute estimate assumes you already have AWS login installed.*

[Vuex Video Tutorial](https://www.youtube.com/watch?v=BGAu__J4xoc&list=PL4cUxeGkcC9i371QO_Rtkl26MwtiJ30P2)

## Table of Contents

- [Quick Start](#quick-start)
- [What's Included](#whats-included)
- [Custom Configuration](#custom-configuration)
- [Troubleshooting](#troubleshooting)


## Quick Start

This section details instructions for getting started with the development of your application.

1. Clone the project from github: `git clone git@github.com:byu-oit/wabs-starter.git`.

2. Log in to AWS

    1. Install AWS Login: https://github.com/byu-oit/awslogin

    2. Run the command: `awslogin` to log in

    2. Select the account: `dev-oit-byu`

3. From within the project directory run the command: `npm run dev`

4. Open a browser to http://localhost:8460

## What's Included?

- Authentication with CAS.

- Authorization with WSO2 (for `wabs-demo` application - [Set up own WSO2 application](#)).

- Using the latest BYU theme.

- Interoperability with the C-Framework.

- Vue Router

- Vuex

- Gulp, Webpack, and BrowserSync

## Site Title

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

**Use Component Configuration**

The `byuTitle` function will be called when the route changes and uses this component. The `selected` parameter is the navigational link object that was selected to navigate to this page.

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

## Site Navigation

WORKING ON THIS SECTION

The site navigation is stored in a Vuex store as an array of objects. Each object should have the following structure:

```js
{
    href: '/',  // the path to navigate to
    title: 'Link title',
    callback: link => { ... }   // optional to perform custom navigation
}
```

**Set Navigation within a Component**

```js
this.$store.commit('siteNavigation', 'My New Title')

this.$byu.site.title = 'My New Title';   // will commit to the store for you
```

**Get Title within a Component**

```js
let title;

title = this.$store.byu.title;

title = this.$byu.site.title;       // will get the title from the store
```

**Use Component Configuration**

The `byuTitle` function will be called when the route changes and uses this component. The `selected` parameter is the navigational link object that was selected to navigate to this page.

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
```

## TODO

- search
- byuNavigation config
- site.navigation
- site.title

## Troubleshooting

- **Error: Unable to load WABS configuration**

    The WABS middleware was missing part of the required configuration. Possible solutions:

    1. Make sure that your still logged in to AWS using the AWS login script. In the terminal execute the command `awslogin`. Once logged in then try to start the server again.

    2. Make sure that you have a [configuration defined in the AWS parameter store](https://www.npmjs.com/package/byu-wabs#in-the-aws-parameter-store) for your application.

    3. If you are using a local file for the configuration (**not recommended**) then verify that the file exists at the location you've specified.

- **Error: Unable to start server**

    This error is pretty generic. Try looking a little higher in the counsole output for more specific errors.



Multiple errors with properties in the object:
  Missing required value for property: consumerKey
  Missing required value for property: consumerSecret
