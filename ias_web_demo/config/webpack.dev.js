const webpack = require('webpack');
const util = require("util");
const path = require('path');

const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const commonConfig = require('./webpack.common.js');

module.exports = function (options) {
    const port = process.env.port || 8180;
    const outputPath = path.join(__dirname, '../dist');

    return webpackMerge(commonConfig(), {
        /**
         * Devtool
         * Reference: https://webpack.js.org/configuration/devtool/#devtool
         * Type of sourcemap to use per build type
         */
        devtool: 'source-map',

        /**
         * Dev server configuration
         * Reference: https://webpack.js.org/configuration/dev-server/
         * Reference: http://webpack.github.io/docs/webpack-dev-server.html
         */
        devServer: {
            contentBase: ["./public", "./node_modules", '.', './src'],
            stats: "minimal",
            inline: true,
            hot: true,
            port: port,
        },

        entry: {
            app_entry: [
                'babel-polyfill',
                './src/index.js'
            ],
        },

        output: {
            path: outputPath,

            // Output path from the view of the page
            // Uses webpack-dev-server in development
            publicPath: '/',

            // Filename for entry points
            // Only adds hash in build mode
            filename: '[name].bundle.js',

            // Filename for non-entry points
            // Only adds hash in build mode
            chunkFilename: '[name].chunk.js'
        },

        plugins: [
            new webpack.DefinePlugin({
                PRODUCTION: JSON.stringify(false),
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            // Reference: https://github.com/ampedandwired/html-webpack-plugin
            // Render index.html
            new HtmlWebpackPlugin({
                template: "./public/index.html",
                inject: "head"
            }),
        ],
    });
};


