const path = require('path')
module.exports = {
    // publicPath is required, whereas all other options are optional

  noInfo: true,
    // display no info to console (only warnings and errors)

  quiet: false,
    // display nothing to the console

  publicPath: '/assets/',
    // public path to bind the middleware to
    // use the same as in webpack

  index: path.resolve(__dirname, '../www/index.html'),
    // the index path for web server

    // headers: { "X-Custom-Header": "yes" },
    // custom headers

  stats: {
    colors: true
  },
    // options for formating the statistics

  reporter: null,
    // Provide a custom reporter to change the way how logs are shown.

  serverSideRender: false
    // Turn off the server-side rendering mode. See Server-Side Rendering part for more info.
};
