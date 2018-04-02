const webpack = require('webpack');
const path = require('path');

const webpackMerge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = require('./webpack.common.js');

module.exports = function (options) {
    const outputPath = path.join(__dirname, '../app');

    return webpackMerge(commonConfig(), {
        entry: {
            app_entry: [
                'babel-polyfill',
                './src/index.js'
            ],
        },

        externals: {},

        output: {
            path: outputPath,

            // Output path from the view of the page
            // Uses webpack-dev-server in development
            publicPath: './',

            // Filename for entry points
            // Only adds hash in build mode
            filename: '[name].[hash].js',

            // Filename for non-entry points
            // Only adds hash in build mode
            chunkFilename: 'chunk_[name].[hash].js'
        },

        devtool: 'source-map',

        plugins: [
            new webpack.DefinePlugin({
                PRODUCTION: JSON.stringify(true),
            }),
            new WebpackCleanupPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),

            // Reference: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
            // Minify all javascript, switch loaders to minimizing mode
            new webpack.optimize.UglifyJsPlugin({
               sourceMap: true
            }),

            // Reference: https://github.com/ampedandwired/html-webpack-plugin
            // Render index.html
            new HtmlWebpackPlugin({
                template: "./public/index.min.html",
                inject: "head",
                // chunksSortMode: 'dependency'
            }),

            // Copy assets from the public folder
            // Reference: https://github.com/kevlened/copy-webpack-plugin
            new CopyWebpackPlugin(
                [
                    'angular',
                    'angular-animate',
                    'angular-aria',
                    'angular-sanitize',
                    'angular-material',
                    'angular-route',
                    'angular-resource',
                    'angular-file-upload',
                    'angular-ui-grid',
                    'angular-clipboard',

                    'ng-csv',

                    'oclazyload',
                    'xlsx',
                ].map(item => {
                    return {
                        from: path.join(__dirname, '../node_modules/', item),
                        force: true,
                        to: path.join(outputPath, item + '/')
                    };
                }).concat([
                    {
                        context: path.join(__dirname, '..'),
                        from: 'src/**/*.html',
                        force: true,
                        to: path.join(outputPath)
                    },
                    // fix: error that img link are used by <img src="./">
                    // TODO: use `raw-loader` to parse `src` in HTML
                    {
                        context: path.join(__dirname, '..'),
                        from: 'src/images',
                        to: path.join(outputPath, './images')
                    },
                    {
                        from: path.join(__dirname, '../public'),
                    },
                ])
            )
        ]

    });
};
