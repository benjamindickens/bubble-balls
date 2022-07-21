const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        library: 'Balls',
        filename: 'bubble-balls.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    },
    externals: [
        "d3-scale",
        "d3-selection",
        "d3-array",
        "d3-drag",
        "d3-force"
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                use: 'babel-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
};
