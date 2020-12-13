const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    context: path.resolve(__dirname),
    mode: 'development',
    entry: { 
        index: path.resolve(__dirname, "src", "main.js")
    },
    output: {
        path: path.resolve(__dirname),
        publicPath: '/debug/',
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.geojson$/,
                loader: 'json-loader'
            },
            {
                test: /\.(png|jpg|ttf|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {},
                    },
                ],
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    'style-loader',
                    'vue-style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                          esModule: false
                        }
                      }
                ]
            }, {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    devServer: {
        historyApiFallback: true,
        open: true,
        overlay: true,
        openPage: 'debug/index.html'
    },
    performance: {
        hints: false
    }
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    ])
}
