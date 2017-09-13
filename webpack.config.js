const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'WebAudio Experiments',
      template: 'src/ejs/index.ejs'
    })
  ]
}
