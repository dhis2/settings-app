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
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    stage: 2
                }
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.scss$/,
                loader: "style!css!sass"
            }
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        /*
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            },
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        */
    ],
    devServer: {
        progress: true,
        colors: true,
        port: 8081,
        inline: true,
    }
};
