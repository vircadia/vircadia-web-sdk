/* globals require __dirname */

const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
    experiments: {
        outputModule: true
    },
    entry: {
        Vircadia: "./src/Vircadia.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        library: {
            type: "module"
        },
        module: true,
        clean: true
    },
    plugins: [new ESLintPlugin({})],
    module: {
        rules: [
            {
                test: /\.m?js$/u,
                exclude: /node_modules/u,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                ]
            }
        ]
    },
    devtool: "source-map"
};
