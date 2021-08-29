# Project Configuration

The project is configured for TypeScript code as the primary focus while also allowing JavaScript code.


## TypeScript

- `npm install --save-dev typescript`
- `tsconfig.json`

TypeScript is configured to process both TypeScript and JavaScript files, and transpile these to ES2015 (ES6).

References:
- https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
- https://www.typescriptlang.org/tsconfig
- https://github.com/Microsoft/TypeScript/tree/main/lib


## ES2020 Polyfills

- `npm install --save core-js regenerator-runtime`
- `tsconfig.json`

TypeScript is configured to target ES2020 libraries, which need to be polyfilled.

These polyfills are used in the code by including the following import statements:
```
import "core-js/stable";
import "regenerator-runtime/runtime";
```

This is done instead of using the deprecated `@babel/polyfill`, and also means that Babel isn't needed.

References:
- https://dev.to/michi/why-typescript-over-babel-is-so-much-easier-to-create-libraries-with-how-to-guide-39d5
- https://github.com/zloirock/core-js


## crypto-js

- `npm install --save crypto-js`
- `npm install --save-dev @types/crypto-js`

References:
- https://cryptojs.gitbook.io/docs/


## WebPack

- `npm install --save-dev webpack webpack-cli`
- `npm install --save-dev ts-loader source-map-loader`
- `webpack.config.js`
- `package.json`

WebPack is used to configured to process TypeScript and JavaScript files, with TypeScript files handled by `ts-loader` and JavaScript
files having any source maps reprocessed by `source-map-loader`.

"build", "watch", and "clean" commands are configured in `package.json`.

References:
- https://webpack.js.org/guides/getting-started/
- https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html


## Jest

- `npm install --save-dev jest ts-jest @types/jest`
- `npx ts-jest config:init` creates default `test.config.js`
- `tsconfig.json`
- `tests/tsconfig.json`
- `package.json`

`test.config.js` is configured to process both TypeScript and JavaScript file types, in ESM without requiring Babel.

`tsconfig.json` is configured to enable `esModuleInterop` in order to quiet warnings.

`tests/tsconfig.json` customizes TypeScript processing of test files.

"test" and test-watch" commands are configured in `package.json`.

References:
- https://jestjs.io/docs/getting-started#using-typescript
- https://kulshekhar.github.io/ts-jest/


## WebSocket and WebRTC for Jest

- `npm install --save-dev wrtc`

This package provides `WebSocket` and WebRTC objects in the Node environment for Jest tests.

Sample Jest test code:
```
global.WebSocket = require("ws");
global.RTCPeerConnection = require("wrtc").RTCPeerConnection;
```

**Note:** If the `ws` module isn't found in a new set-up then use `npm install --save-dev ws`.


## Linting

### Set-Up

Set up:
- `npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- `npm install --save-dev eslint-plugin-jest`
- `.eslintrc.js` - TypeScript lint, ESLing, and Jest linting rules.
- `.eslintignore`
- `tsconfig.json` - Type checking rules.

Note that the versions of `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` must be the same.

"lint" and "lint-path" commands are configured in `package.json`.

References:
- https://eslint.org/blog/2019/01/future-typescript-eslint
- https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
- https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
- https://eslint.org/docs/user-guide/configuring
- https://eslint.org/docs/rules/
- https://www.npmjs.com/package/eslint-plugin-jest
- https://www.typescriptlang.org/tsconfig#compilerOptions


## JSDoc

Set up:
- `npm install --save-dev jsdoc`
- `npm install --save-dev rimraf`
- `tsconfig.jsdoc.json`
- `/jsdoc`
- `package.json`

JSDoc can't process files with TypeScript syntax so the documentation build process is to transpile the source to ECMAScript and
then run JSDoc on that. 

"devdoc" and "sdkdoc" commands are configured in `package.json`.

References:
- https://jsdoc.app/
- https://www.npmjs.com/package/jsdoc
- https://www.npmjs.com/package/rimraf
