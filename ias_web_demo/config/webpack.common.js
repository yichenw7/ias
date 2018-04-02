const webpack = require('webpack');
const path = require('path');

const autoprefixer = require("autoprefixer");

module.exports = function makeWebpackConfig() {
    const config = {};

    const BASE_CSS_LOADER = [
        'style-loader',
        {
            loader: 'css-loader',
        },
        {
            loader: 'postcss-loader',
            options: {
                plugins: {
                    autoprefixer: {
                        browsers: ['last 2 versions']
                    },
                },
            }
        },
    ];

    config.module = {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                include: /src/,
                use: [{
                    loader: 'eslint-loader'
                }]
            },
            {
                oneOf: [
                    // "url" loader works just like "file" loader but it also embeds
                    // assets smaller than specified size as data URLs to avoid requests.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'images/[name].[hash:8].[ext]',
                        },
                    },
                    // JS LOADER
                    // Reference: https://github.com/babel/babel-loader
                    // Transpile .js files using babel-loader
                    // Compiles ES6 and ES7 into ES5 code
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: [{
                            loader: 'babel-loader'
                        }]
                    },
                    // CSS LOADER
                    // Reference: https://github.com/webpack/css-loader
                    // Allow loading css through js
                    //
                    // Reference: https://github.com/postcss/postcss-loader
                    // Postprocess your css with PostCSS plugins
                    {
                        test: /\.less$/,
                        use: [
                            ...BASE_CSS_LOADER,
                            {
                                loader: "less-loader",
                                options: {
                                    sourceMap: true,
                                }
                            }
                        ]
                    },
                    {
                        test: /\.css$/,
                        use: BASE_CSS_LOADER
                    },
                    // HTML LOADER
                    // Reference: https://github.com/webpack/raw-loader
                    // Allow loading html through js
                    {
                        test: /\.html$/,
                        use: { loader: 'raw-loader' }
                    },
                    {
                        test: /\.json$/,
                        use: { loader: 'json-loader' }
                    },

                    // This Create-React-app's config.
                    //
                    // "file" loader makes sure assets end up in the `build` folder.
                    // When you `import` an asset, you get its filename.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        loader: require.resolve('file-loader'),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // it's runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.js$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'images/[name].[hash:8].[ext]',
                        },
                    },
                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ]
            }
        ]
    };

    config.resolve = {
        alias: {
            'angular': "angular/index.js",

            'ngAnimate': 'angular-animate/angular-animate.js',
            'ngAria': 'angular-aria/angular-aria.js',
            'ngSanitize': 'angular-sanitize/angular-sanitize.js',
            'XLSX': 'xlsx/dist/xlsx.full.min.js',

            'amcharts': path.resolve('lib/amcharts/amcharts.js'),
            'amcharts-serial': path.resolve('lib/amcharts/serial.js'),
            'amcharts-responsive': path.resolve('lib/amcharts/plugins/responsive/responsive.js'),
            'amcharts.css': path.resolve('lib/amcharts/style.css'),

            'avalon-ui': path.resolve('lib/avalon-ui-2/avalon-ui-2.js'),
            'avalon-ui.css': path.resolve('lib/avalon-ui-2/avalon-ui-2.css'),
            'avalon-ui-icon.css': path.resolve('lib/avalon-ui-2/avalon-ui-icon.css'),

            'BaseLess': path.resolve('src/common/style/baseLess/'),
            'Common': path.resolve('src/common'),

            'Lib': path.resolve('app/lib'),
        }
    };

    config.externals = {
        'angular': "angular",

        'default-passive-events': 'defaultPassiveEvents',

        'XLSX': 'XLSX',

        'amcharts': 'amcharts',

        'ngComponentRouter': "ngComponentRouter",
        'ngComponentRouter.shim': 'ngComponentRouterShim'
    };

    return config;
};
