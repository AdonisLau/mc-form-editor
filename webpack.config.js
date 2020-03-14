const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const M = {
  umd: {
    libraryTarget: 'umd',
    filename: '[name].umd.js'
  },

  commonjs2: {
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  }
};

const T = process.env.OUTPUT_TARGET;

module.exports = {
  mode: 'production',
  entry: {
    'mc-form-editor': './index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'McFormEditor',
    globalObject: 'this',
    ...M[T]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },

      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@vue/babel-preset-jsx']
          }
        }
      },

      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },

      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  plugins: [
    // 请确保引入这个插件！
    new VueLoaderPlugin()
  ]
};