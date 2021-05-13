# Vircadia Web SDK

The **Vircadia Web SDK** (codename Ananke) is a JavaScript SDK for developing web-based clients for virtual worlds powered by
Vircadia. Vircadia domain servers provide the worlds (a.k.a. "domains") to visit, and the Vircadia metaverse server provides
global services that connect the users and domains.
See the user docs to [Understand the Architecture](https://docs.vircadia.dev/explore/get-started/architecture.html).

This SDK provides interfaces to:
- Connect to domains.
- Use metaverse services.

For scripting API documentation, see the [Vircadia API Reference](https://apidocs.vircadia.dev).

To learn more about using Vircadia and exploring the metaverse, see the [User Documentation](https://docs.vircadia.dev).


## Prerequisites

**Node.js** version &ge; 10.13 ; LTS version &ge; 14.16 recommended  
**npm** version &ge; 6.4.1 ; LTS version &ge; 6.14 recommended 

https://nodejs.org/en/download/


## Project setup
```
npm install
```

### Hot-recompile for development
```
npm run watch
```

### Compile and minify for production
```
npm run build
```

### Lint files
```
npm run lint
```

### Run unit tests
```
npm run test
```
Hot retest
```
npm run test-watch
```

### Generate user docs

```
npm run docs
```
