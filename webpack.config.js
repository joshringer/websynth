const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    'app': './src/js/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract([
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ])
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    new ExtractTextPlugin('[name]-[contenthash].css'),
    new HtmlPlugin({
      title: 'WebAudio Experiments',
      template: 'src/ejs/index.ejs'
    })
  ]
}
