# WABS Starter

This repository is a starter kit for writing web applications. It implements the [wabs-middleware](https://github.com/byu-oit-appdev/wabs-middleware) that facilitates authentication, authorization, and interoperability with C-Framework brownies.

## Project Set Up

Within your project directory run the command: `npm install`. This will install both the NodeJS and Bower dependencies.

### File System Structure

- The `www` directory should include:

    - All of your publicly accessible static content files. This includes `html` files, `css` files, `js` files, image files, video files, etc.
    
    - Your `bower_components` directory. (The project already has this set as the default location for bower components. Also, Polymer 2.0 is added automatically by default.)
    
    - The `index.html` is the start page for your app.
    
- The `server` directory:

    - This is where you place all of your server code.
    
    - This will be run with NodeJS. These files are not available to the browser.
    
    - The `index.js` file is the start script for the server.
    
    - Any routers you create should be placed in the `routers` sub directory.
    
- Any files outside of these two directories are either configuration files or external libraries used by the server.
