const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

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
        publicPath: "/threejs-webpack-template/",
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
            }

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Iridescent-Vision',
            filename: 'index.html'
        })
    ]
};
