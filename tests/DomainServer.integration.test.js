//
//  DomainServer.integration.test.js
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer";

import TestConfig from "./test.config.json";

import "wrtc";  // WebRTC Node.js package.


describe("DomainServer - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    // Add WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* noop */ });


    test("Can connect to the domain server", (done) => {
        const domainServer = new DomainServer();
        let haveConnected = false;
        domainServer.onStateChanged = (state, info) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED).toBe(true);
            expect(info).toBe("");
            if (state === DomainServer.CONNECTED) {
                haveConnected = true;
                domainServer.disconnect();
            } else if (haveConnected && state === DomainServer.DISCONNECTED) {
                done();
            }
        };

        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });


    log.mockReset();
});
