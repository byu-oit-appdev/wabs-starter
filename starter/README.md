# WABS Starter

This full stack application was initialized using the [WABS Starter](https://github.com/byu-oit-appdev/wabs-starter).

It is recommended that you have the [WABS Starter](https://github.com/byu-oit-appdev/wabs-starter) installed globally:

```sh
npm install -g byu-oit-appdev/wabs-starter
```

## Helpful Commands

These commands must be executed within the web applications directory (a.k.a. where this README.md file exists).

- `npm start` - Start the server. 

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
