const path = require('path');
const webpack = require('webpack');
const copyPlugin = require('copy-webpack-plugin');

const config = {
    module: {
        rules: [{
            test: /\.[tj]sx?$/u,
            exclude: '/node_modules/',
            use: [{
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            }],
        }, {
            test: /\.(geo)?json$/u,
            use: [{
                loader: 'json-loader',
            }],
        }],
    },
    resolve: {
        symlinks: false,
        extensions: [
            '.ts',
            '.js',
            '.tsx',
            '.jsx',
        ],
    },
    watchOptions: {
        ignored: ['node_modules'],
    },
    target: 'web',
    entry: [path.join(__dirname, 'src', 'index.tsx')],
    output: {
        filename: 'index.js',
    },
    plugins: [
        new copyPlugin({
            patterns: [
                {from: path.join('src', 'index.html'), to: 'index.html'},
                {from: path.join('src', 'css'), to: 'css'},
                {from: path.join('src', 'img'), to: 'img'},
            ],
        }),
        new webpack.DefinePlugin({
            'process.env.BUILD_ENV': `'${process.env.BUILD_ENV}'`,
        }),
    ],
};

if (process.env.BUILD_ENV === 'production') {
    module.exports = {
        ...config,
        mode: 'production',
        output: {
            filename: config.output.filename,
            path: path.resolve(__dirname, 'www'),
            libraryTarget: config.output.libraryTarget,
        }
    };
} else {
    module.exports = {
        ...config,
        mode: 'development',
        output: {
            filename: config.output.filename,
            path: path.resolve(__dirname, 'www'),
            libraryTarget: config.output.libraryTarget,
        },
        devtool: 'source-map',
    };
}
