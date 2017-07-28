const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, '../src/main.js'),
  output: {
    path: path.resolve(__dirname, '../www/assets'),
    publicPath: '/assets/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'store': path.resolve(__dirname, '../src/redux/store.js')
    }
  },
  module: {
    rules: [
            // all files with a '.js' or '.jsx' extension will be handled by 'babel-loader'
            { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/, options: {} },

            // instruct vue-loader to load TypeScript & make TS generated code cooperate with vue-loader
            { test: /\.vue$/, loader: 'vue-loader', options: {} },

            { test: [/www\/web-components/, /\.html$/], loader: 'web-components-loader' }
    ]
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
