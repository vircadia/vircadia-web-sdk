module.exports = (api) => {

    if (api.env("test")) {
        // Jest test environment.
        return {
            presets: [["@babel/preset-env", { targets: { node: "current" } }]]
        };
    }

    // Watch, build, etc.
    return {
        presets: [["@babel/preset-env", { "shippedProposals": true }]]
    };

};
