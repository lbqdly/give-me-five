/**
 * Created by aaron on 2017/4/10.
 */
let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let BrowserSyncPlugin = require('browser-sync-webpack-plugin');
//环境变量，开发环境或者生产环境，npm将通过这个值来区分打包。
let isDev = process.env.NODE_ENV === 'development';

module.exports = {
    context: path.join(__dirname, 'src'),
    //监听文件改动
    watch: isDev,
    //入口js文件
    entry: {
        'index': './index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        //文件命名
        filename: isDev ? 'js/[name].js?hash=[chunkHash:7]' : 'js/[name].[chunkHash:7].js',
        //生成js文件的相对路径
        publicPath: './'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './tpl.html'
        })
    ].concat(isDev
        ? [
            new BrowserSyncPlugin(
                {
                    server: {
                        baseDir: "dist",
                        index: "index.html"
                    }
                },
                {reload: true}
            )]
        : [
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                comments: false,
                compress: {warnings: true}
            })]
    ),
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.less/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[name]-[local]-[hash:base64:5]',
                            importLoaders: 1
                        }
                    },
                    'postcss-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 2048,
                        name: './img/[name].[hash:7].[ext]'
                    }
                }]
            }
        ]
    }
};


