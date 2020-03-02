const path = require('path');
const { DefinePlugin } = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');

/**
 * Load config file before building
 */

const { NODE_ENV, DHIS2_HOME } = process.env;
const isProd = NODE_ENV === 'production';
const dhisConfigPath = DHIS2_HOME && path.join(DHIS2_HOME, 'config');
let dhisConfig = {
    baseUrl: 'http://localhost:8080',
    authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
};

try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    dhisConfig = require(dhisConfigPath);
} catch (e) {
    // Failed to load config file, stick with default config
    console.warn('\nWARNING! Failed to load DHIS config:', e.message);
}

/**
 * Modify request for the dev server
 */

function bypass(req, res, opt) {
    console.log('[PROXY]', req.method, req.url, '=>', opt.target);
}

/**
 * Webpack config
 */

module.exports = {
    entry: path.resolve(__dirname, 'src', 'settings-app.js'),
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'settings-app.js',
        publicPath: isProd ? './' : 'http://localhost:8081/',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
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
    externals: [],
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'index.html')
        }),
        new DefinePlugin({
            DHIS_CONFIG: isProd ? JSON.stringify({}) : JSON.stringify(dhisConfig),
        }),
    ],
    devServer: {
        port: 8081,
        inline: true,
        compress: true,
        proxy: [
            { path: '/api/*', target: dhisConfig.baseUrl, bypass },
            { path: '/dhis-web-commons/**', target: dhisConfig.baseUrl, bypass },
            { path: '/icons/*', target: dhisConfig.baseUrl, bypass },
        ],
    },
};
