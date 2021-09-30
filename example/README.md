# Example Web App

This example demonstrates using the Vircadia Web SDK.

To run:
- Set up and build the SDK. The SDK will be created in a `/dist` directory beside the `/example` directory.
- Host the `/example` and `/dist` on a Web server. This is required so that the browser will load the SDK file without
  encountering a CORS error. In order for audio to work with the audio mixer, the Web server must serve HTTPS or be localhost.
- Load the hosted `interface.html` in a Web browser (using HTTPS if on a remote server or HTTP if localhost).
