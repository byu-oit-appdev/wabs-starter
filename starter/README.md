# WABS Starter

This full stack application was initialized using the [WABS Starter](https://github.com/byu-oit/wabs-starter).

It is recommended that you have the [WABS Starter](https://github.com/byu-oit/wabs-starter) installed globally:

```sh
npm install -g byu-oit-appdev/wabs-starter
```

## What is a Single Page App?

**Important!!** You should understand this section before your proceed.

To promote consistency for BYU OIT Application Development the following definition for a single page app will be used:

1. A single [WSO2 application](http://api.byu.edu/store).

2. A single [Express server](http://expressjs.com).

3. A single `index.html` file.

4. A single domain name, for example: `my-app.byu.edu`.

#### A Single WSO2 Application

- WSO2 is our API store. If you want to make REST API calls then this is the tool you should be using.

- You must create a WSO2 app at [http://api.byu.edu/store](http://api.byu.edu/store).

- The WSO2 app must have a consumer key and consumer secret generated for it.

#### A Single Express Server

- We are using [Express server](http://expressjs.com) for our NodeJS servers.

- The server uses [wabs-middleware](https://github.com/byu-oit/wabs-middleware) to manage CAS authentication, WSO2 authorization, and interoperability with legacy frameworks.

- It serves static files from the `www` directory.

- It defines API routes in the `server/routes` directory.

#### A Single index.html File

- There is one `index.html` file and it resides at `www/index.html`.

- This is the root of your front-end application.
 
- It loads all CSS and JavaScript files (whether statically or dynamically) that are necessary for the entire application.
 
- It have multiple views. What is visible on the screen may change dramatically without navigating away from the `index.html` file.

- It may support multiple routes. A route causes the URL to look different but it is still on the same `index.html` file. Views are often tied to routes.

#### A Single Domain Name

- The domain will serve up exactly one `index.html` file.

- The domains `admissions.byu.edu` and `application.admissions.byu.edu` can point to two different single page apps.

## Set Up

1. Set up a WSO2 application on [http://api.byu.edu/store](http://api.byu.edu/store).

    The callback URL for the WSO2 application should be `https://<your-domain>/wabs/oauth-code`.

2. Configure the [wabs-middleware](https://github.com/byu-oit/wabs-middleware) to use the consumer key and consumer secret from your WSO2 application.

    **Important:** Do not push these keys to github. Coming soon there will be a solution will exist that avoids this pitfall.
    
3. [Start the server](#helpful-commands).


## Helpful Commands

These commands must be executed within the web applications directory (a.k.a. where this README.md file exists).

- `wabs start` - Start the server.

- `wabs dev` - Start the server in development mode. The server will automatically restart when you've made modifications to the server code. 

## File System Structure

- The `www` directory should include:

    - All of your publicly accessible static content files. This includes `html` files, `css` files, `js` files, image files, video files, etc.
    
    - Your `bower_components` directory. (The project already has this set as the default location for bower components. Also, Polymer 2.0 is added automatically by default.)
    
    - The `index.html` is the start page for your app.
    
    - Has the official BYU `favicon.ico`.
    
- The `server` directory:

    - This is where you place all of your server code.
    
    - This will be run with NodeJS. These files are not available to the browser.
    
    - The `index.js` file is the start script for the server. Take a look at this file and add/remove code as necessary. Avoid saving routes directly to this file.
    
    - Any routers you create should be placed in the `routers` sub directory.
    
- Any files outside of these two directories are either configuration files or external libraries used by the server.
