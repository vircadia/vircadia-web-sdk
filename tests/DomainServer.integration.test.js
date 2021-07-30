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

    // Add WebSocket and WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* noop */ });


    test("Can connect to and maintain a connection with the domain server", (done) => {
        // Also tests: Transitions DISCONNECTED -> CONNECTING -> CONNECTED.
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        let haveSeenConnecting = false;
        let haveRequestedDisconnect = false;
        domainServer.onStateChanged = (state, info) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED).toBe(true);
            expect(info).toBe("");
            haveSeenConnecting = haveSeenConnecting || state === DomainServer.CONNECTING;
            if (state === DomainServer.CONNECTED) {
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, 2500);  // Sufficient for a couple of sendDomainServerCheckin()s.
            } else if (state === DomainServer.DISCONNECTED && haveRequestedDisconnect) {
                domainServer.onStateChanged = null;
                done();
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Error state when location is invalid", (done) => {
        const domainServer = new DomainServer();
        domainServer.onStateChanged = (state, info) => {
            expect(state).toBe(DomainServer.ERROR);
            expect(info).not.toBe("");
            domainServer.onStateChanged = null;
            done();
        };
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        domainServer.connect("");
    });

    test("Can disconnect while connecting", () => {
        const domainServer = new DomainServer();
        const location = TestConfig.SERVER_SIGNALING_SOCKET_URL;
        domainServer.connect(location);
        expect(domainServer.state).toBe(DomainServer.CONNECTING);
        expect(domainServer.errorInfo).toBe("");
        expect(domainServer.refusalInfo).toBe("");
        expect(domainServer.location).toBe(location);
        domainServer.disconnect();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        expect(domainServer.errorInfo).toBe("");
        expect(domainServer.refusalInfo).toBe("");
        expect(domainServer.location).toBe(location);
    });


        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });


    log.mockReset();
});
