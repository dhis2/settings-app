var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: './settings-app.js',
    output: {
        path: __dirname + '/build',
        filename: 'settings-app.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    stage: 2
                }
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin()
    ],
    devServer: {
        progress: true,
        colors: true,
        port: 8081
    }
};
