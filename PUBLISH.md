
# Publishing to NPM

Build for release:
```
npm run clean
npm run build-prod
```

Package for release:
```
npm pack
```

This creates the SDK package, `vircadia-web-sdk-vvvv.v.v.tgz`.

Publish the package to https://npmjs.com:

```
npm login
npm publish --access public
```
