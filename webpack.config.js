const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");
//entry: "./src/app.js",
module.exports = {
    entry: "./src/app.js",
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/Iridescent-Vision/"
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }, {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader'
            }, {
                test: /\.(gltf)$/,
                use: [
                    {
                        loader: "gltf-webpack-loader"
                    }
                ]
            }, {
                test: /\.(bin)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
            }, {
                test: /\.mp3$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            }, {
                test: /\.html$/,
                use: {loader: 'html-loader'}
            }

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Iridescent-Vision',
            filename: './index.html'
        })
    ]
};
