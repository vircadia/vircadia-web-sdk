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

    test("Can disconnect and reconnect", (done) => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        let haveSeenConnecting = false;
        let haveRequestedDisconnect = false;
        let haveRequestedReconnect = false;
        domainServer.onStateChanged = (state, info) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED).toBe(true);
            expect(info).toBe("");
            haveSeenConnecting = haveSeenConnecting || state === DomainServer.CONNECTING;
            if (state === DomainServer.CONNECTED) {
                const timeOut = !haveRequestedReconnect
                    ? 2000  // First connection. Wait for a couple of sendDomainServerCheckin()s before disconnecting.
                    : 500;  // Second connection. Can finish the test.
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, timeOut);
            } else if (state === DomainServer.DISCONNECTED && haveRequestedDisconnect) {
                if (!haveRequestedReconnect) {
                    setTimeout(() => {
                        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
                        haveRequestedReconnect = true;
                    }, 0);
                } else {
                    done();
                }
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Can connect to a domain from an error state", (done) => {
        const domainServer = new DomainServer();

        // Error state.
        domainServer.connect("  ");
        expect(domainServer.state).toBe(DomainServer.ERROR);

        // Connect to a domain.
        let haveRequestedDisconnect = false;
        domainServer.onStateChanged = (state) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED).toBe(true);
            if (state === DomainServer.CONNECTED) {
                haveRequestedDisconnect = true;
                domainServer.disconnect();
            } else if (state === DomainServer.DISCONNECTED && haveRequestedDisconnect) {
                domainServer.onStateChanged = null;
                done();
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Connecting to an empty destination disconnects", (done) => {
        const domainServer = new DomainServer();
        let haveRequestedConnectToEmpty = false;
        domainServer.onStateChanged = (state) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED
                || state === DomainServer.ERROR).toBe(true);
            if (state === DomainServer.CONNECTED) {
                haveRequestedConnectToEmpty = true;
                domainServer.connect("");
            } else if (state === DomainServer.ERROR && haveRequestedConnectToEmpty) {
                domainServer.onStateChanged = null;
                done();
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Noop when disconnect when disconnected", (done) => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        let hasStateChanged = false;
        domainServer.onStateChanged = (state) => {
            hasStateChanged = state !== DomainServer.DISCONNECTED;
        };
        setTimeout(() => {
            expect(hasStateChanged).toBe(false);
            done();
        }, 200);
        domainServer.disconnect();
    });

    log.mockReset();
});
