const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
    experiments: {
        outputModule: true
    },
    entry: {
        Vircadia: "./src/Vircadia.ts"
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
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
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
            },
            {
                test: /\.tsx?$/u,
                use: "ts-loader",
                exclude: /node_modules/u
            }
        ]
    },
    devtool: "source-map"
};
