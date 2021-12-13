module.exports = {
    preset: "ts-jest/presets/js-with-ts-esm",
    testEnvironment: "node",
    testPathIgnorePatterns: ["dist/tests"],
    maxWorkers: 1,  // Counter-intuitively, this speeds up running multiple tests.

    moduleNameMapper: {
        "worker-url": "<rootDir>/mocks/worker-url.mock.js"
    }

};
