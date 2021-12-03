import TestConfig from "./test.config.json";

const env = process && process.env || {};

for (const key of Object.keys(TestConfig)) {
    const envKey = "VIRCADIA_" + key;
    if (typeof env[envKey] !== "undefined") {
        TestConfig[key] = env[envKey];
    }
}

export default TestConfig;
