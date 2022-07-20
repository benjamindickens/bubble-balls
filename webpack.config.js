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
    externals: {
        'd3-scale': 'commonjs2 scaleLinear',
        "d3-selection": "commonjs2 select",
        "d3-array": "commonjs2 extent",
        "d3-drag": "commonjs2 drag",
        "d3-force" : ["commonjs2 forceSimulation", "commonjs2 forceManyBody", "commonjs2 forceX", "commonjs2 forceY", "commonjs2 forceCollide"]
    },
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
