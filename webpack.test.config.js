module.exports = {
    entry: "mocha!./test/test.ts",
    output: {
        path: __dirname,
        filename: "built/test.bundle.js"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    // Source maps support ('inline-source-map' also works)
    devtool: 'inline-source-map',
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    ts:{
        configFileName: './test/tsconfig.json'
    }
};