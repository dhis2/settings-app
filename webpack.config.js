var webpack = require('webpack');
var webpackBaseConfig = require('./webpack-base-config');

webpackBaseConfig.devServer = {
    progress: true,
    colors: true,
    port: 8081,
    inline: true,
    proxy: {
        '/api/*': { target: 'http://localhost:8080' },
        '/dhis-web-commons/*': { target: 'http://localhost:8080' },
        '/icons/*': { target: 'http://localhost:8080' },
        '/browser-polyfill.min.js': {
            target: 'http://localhost:8081/node_modules/babel-core/',
        },
        '/jquery.min.js': {
            target: 'http://localhost:8081/node_modules/jquery/dist/',
        },
    },
};

module.exports = webpackBaseConfig;
