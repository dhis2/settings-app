var path = require('path');

module.exports = {
    context: __dirname,
    entry: './src/settings-app.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: 'settings-app.js',
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    stage: 2,
                },
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass',
            },
        ],
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui'),
        },
    },
};
