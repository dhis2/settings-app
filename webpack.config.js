'use strict';

var webpack = require('webpack');
var path = require('path');
var colors = require('colors');

const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;
const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
let dhisConfig;

try {
    dhisConfig = require(dhisConfigPath);
} catch (e) {
    // Failed to load config file - use default config
    console.warn(`\nWARNING! Failed to load DHIS config:`, e.message);
    dhisConfig = {
        baseUrl: 'http://localhost:8080/dhis',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}

const HTMLWebpackPlugin = require('html-webpack-plugin');
const scriptPrefix = (isDevBuild ? dhisConfig.baseUrl : '..');

function log(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
    console.log('[PROXY]'.cyan.bold, req.method.green.bold, req.url.magenta, '=>'.dim, opt.target.dim);
}

const webpackConfig = {
    context: __dirname,
    entry: './src/settings-app.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: 'settings-app.js',
        publicPath: isDevBuild ? 'http://localhost:8081/' : './',
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                },
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
            },
        ],
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui'),
        },
    },
    externals: [
        {
            'react': 'var React',
            'react-dom': 'var ReactDOM',
            'react-addons-transition-group': 'var React.addons.TransitionGroup',
            'react-addons-create-fragment': 'var React.addons.createFragment',
            'react-addons-update': 'var React.addons.update',
            'react-addons-pure-render-mixin': 'var React.addons.PureRenderMixin',
            'react-addons-shallow-compare': 'var React.addons.ShallowCompare',
            'rx': 'var Rx',
            'lodash': 'var _',
        },
        /^react-addons/,
        /^react-dom$/,
        /^rx$/,

    ],
    plugins: [
        new HTMLWebpackPlugin({
            template: 'index.html',
            vendorScripts: [
                "polyfill.min.js",
                `${scriptPrefix}/dhis-web-core-resource/react-15/react-15${isDevBuild ? '' : '.min'}.js`,
                `${scriptPrefix}/dhis-web-core-resource/rxjs/4.1.0/rx.all${isDevBuild ? '' : '.min'}.js`,
                `${scriptPrefix}/dhis-web-core-resource/lodash/4.15.0/lodash${isDevBuild ? '' : '.min'}.js`,
            ]
                .map(script => {
                    if (Array.isArray(script)) {
                        return (`<script ${script[1]} src="${script[0]}"></script>`);
                    }
                    return (`<script src="${script}"></script>`);
                })
                .join("\n"),
        })
    ],
    devServer: {
        progress: true,
        colors: true,
        port: 8081,
        inline: true,
        compress: true,
        proxy: [
            { path: '/polyfill.min.js', target: 'http://localhost:8081/node_modules/babel-polyfill/dist', bypass: log },
            { path: '/api/*', target: dhisConfig.baseUrl, bypass: log },
            { path: '/dhis-web-commons/**', target: dhisConfig.baseUrl, bypass: log },
            { path: '/icons/*', target: dhisConfig.baseUrl, bypass: log },
        ],
    },
};

if (!isDevBuild) {
    webpackConfig.plugins.push(
        // Replace any occurance of process.env.NODE_ENV with the string 'production'
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
            DHIS_CONFIG: JSON.stringify({}),
        })
    );
    webpackConfig.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin()
    );
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: true,
        })
    );
} else {
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            DHIS_CONFIG: JSON.stringify(dhisConfig)
        })
    );
}

module.exports = webpackConfig;
