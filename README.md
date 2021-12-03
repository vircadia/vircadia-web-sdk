# Vircadia Web SDK

The **Vircadia Web SDK** (codename Ananke) is a JavaScript SDK for developing web-based clients for virtual worlds powered by
[Vircadia](https://vircadia.com/). Vircadia domain servers provide the worlds (a.k.a. "domains") to visit, and the Vircadia
metaverse server provides global services that connect the users and domains.
See the user docs to [Understand the Architecture](https://docs.vircadia.com/explore/get-started/architecture.html).

This SDK provides interfaces to:
- Connect to domains.
- Use metaverse services.

The SDK is written in TypeScript.
- [Project Configuration](CONFIGURATION.md)
- [Coding Standard](CODING_STANDARD.md)

To learn more about using Vircadia and exploring the metaverse, see the [User Documentation](https://docs.vircadia.com).

For scripting API documentation, see the [Vircadia API Reference](https://apidocs.vircadia.dev).


## Prerequisites

**Node.js** version &ge; 10.13 ; LTS version &ge; 14.16 recommended  
**npm** version &ge; 6.4.1 ; LTS version &ge; 6.14 recommended 

https://nodejs.org/en/download/

Jest is used for unit testing. It is included as an NPM dev dependency, however, you may also install it globally if you want
to. https://jestjs.io/. 


## Project setup
```
npm install
```
Loads all the supporting NPM packages as defined in `package.json` into the `node_modules` directory.

### Compile and minify for development
```
npm run build
```
Does a development compile and packages the SDK into the `dist` directory.

### Compile and minify for production
```
npm run build-prod
```
Does a clean production compile and packages a releasable version of the SDK into the `dist` directory.

### Hot-recompile for development
```
npm run watch
```
Does a development compile and enables webpack to watch the sources and recomile when source files change.
This is often useful when testing SDK development using the `example` tool.

### Hot-recompile for production
```
npm run watch-prod
```
Does a clean production compile and enables webpack to watch the sources and recompile when the source files change.

### Clean the build directory
```
npm run clean
```

### Lint files

All files:
```
npm run lint
```

A specific directory or file:
```
npm run lint-path <path>
```

### Run tests

Unit tests can be run without any external dependencies but integration tests require a domain server to be running on
`localhost` or other location specified in `./tests/test.config.json`. The location and other values of the config JSON can be
overridden with environment variables, using the same property names, but prefixed with "VIRCADIA_".


All tests:
```
npm run test
```
Hot retest of all tests:
```
npm run test-watch
```

Specific tests (e.g., Packet.unit.test.js, all unit tests, all integration tests):
```
npm run test <partial-path>

npm run test /packet.unit
npm run test .unit.
npm run test .integration.
```

Run tests and report open handles:
```
npm run test-debug [<partial-path>]
```


### Generate docs

SDK API documentation:
```
npm run sdkdoc
```

Developer documentation (includes SDK API documentation):
```
npm run devdoc
```
