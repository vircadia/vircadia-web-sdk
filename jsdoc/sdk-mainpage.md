The <strong>Vircadia Web SDK</strong> is a JavaScript SDK, written in TypeScript, for developing web-based clients for virtual
worlds powered by Vircadia. Vircadia domain servers provide the worlds (a.k.a. "domains") to visit, and the Vircadia metaverse
server provides global services that connect the users and domains.
See the user docs to [Understand the Architecture](https://docs.vircadia.dev/explore/get-started/architecture.html).

This SDK provides interfaces to:
- Connect to domains.
- Use metaverse services.

<hr />

To use the API namespaces, import those that you want to use &mdash; either from the SDK package installed in your project or
directly from the SDK TypeScript.

- Install the SDK package in your project and import, for example:
    ```
    npm install --save-prod <path-to-vircadia-web-sdk-folder>

    import { Vircadia, DomainServer } from "@vircadia/web-sdk";
    ```

- You can also only import specific modules if you wish:
    ```
    import { Vircadia, DomainServer } from "@vircadia/web-sdk/modules/Vircadia";
    ```

- Import directly from the SDK TypeScript:
    ```
    import { Vircadia, DomainServer } from "<path>/Vircadia";
    ```

<hr />

GitHub repository: [/vircadia/vircadia-web-sdk](https://github.com/vircadia/vircadia-web-sdk)

For scripting API documentation, see the [Vircadia API Reference](https://apidocs.vircadia.dev).

To learn more about using Vircadia and exploring the metaverse, see the [User Documentation](https://docs.vircadia.dev).
