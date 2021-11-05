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
import Uuid from "../src/domain/shared/Uuid";

import TestConfig from "./test.config.json";

import "wrtc";  // WebRTC Node.js package.
import { protocolVersionsSignature } from "../src/domain/networking/udt/PacketHeaders";


// Time needs to be allowed for the WebRTC RTCPeerConnection from one test to be closed before creating a new one in the
// next test.
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/close
function waitUntilDone(done) {
    const DONE_TIMEOUT = 500;
    setTimeout(() => {
        done();  // eslint-disable-line
    }, DONE_TIMEOUT);
}


describe("DomainServer - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    // Add WebSocket and WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });
    const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });


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
                expect(haveSeenConnecting).toBe(true);  // eslint-disable-line jest/no-conditional-expect
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, 2500);  // Sufficient for a couple of sendDomainServerCheckin()s.
            } else if (state === DomainServer.DISCONNECTED && haveRequestedDisconnect) {
                domainServer.onStateChanged = null;
                waitUntilDone(done);
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Can disconnect while connecting", (done) => {
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
        waitUntilDone(done);
    });

    test("Can disconnect and reconnect", (done) => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        let haveRequestedDisconnect = false;
        let haveRequestedReconnect = false;
        domainServer.onStateChanged = (state, info) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED).toBe(true);
            expect(info).toBe("");
            if (state === DomainServer.CONNECTED) {
                // Disconnect.
                const timeOut = !haveRequestedReconnect
                    ? 2000  // First connection. Wait for a couple of sendDomainServerCheckin()s before disconnecting.
                    : 500;  // Second connection. Can finish the test.
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, timeOut);
            } else if (state === DomainServer.DISCONNECTED && haveRequestedDisconnect) {
                if (!haveRequestedReconnect) {
                    // Reconnect.
                    setTimeout(() => {
                        haveRequestedReconnect = true;
                        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
                    }, 0);
                } else {
                    // Finish.
                    domainServer.onStateChanged = null;
                    waitUntilDone(done);
                }
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Can connect to a domain from an error state", (done) => {
        const domainServer = new DomainServer();

        // Error state.
        domainServer.connect("");
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
                waitUntilDone(done);
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
                waitUntilDone(done);
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("No-op when disconnect when disconnected", (done) => {
        const domainServer = new DomainServer();
        expect(domainServer.state).toBe(DomainServer.DISCONNECTED);
        let hasStateChanged = false;
        domainServer.onStateChanged = (state) => {
            hasStateChanged = state !== DomainServer.DISCONNECTED;
        };
        setTimeout(() => {
            expect(hasStateChanged).toBe(false);
            domainServer.onStateChanged = null;
            waitUntilDone(done);
        }, 200);
        domainServer.disconnect();
    });

    test("Connection denied response from domain server is handled", (done) => {
        // This response is received for protocol mismatch, no permissions, and similar "connection denied" situations.

        // Cause an invalid protocol version signature to be sent in the connect request.
        const domainServer = new DomainServer();

        // eslint-disable-next-line
        const originalProtocolVersionsSignature = protocolVersionsSignature;

        // eslint-disable-next-line
        protocolVersionsSignature = function () {
            return new Uint8Array(16);  // An invalid signature.
        };

        // Try connect to a domain.
        domainServer.onStateChanged = (state) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.REFUSED).toBe(true);
            expect(state !== DomainServer.REFUSED
                || domainServer.refusalInfo.length > 0 && domainServer.errorInfo === "").toBe(true);
            if (state === DomainServer.REFUSED) {
                domainServer.disconnect();
            } else if (state === DomainServer.DISCONNECTED) {
                // eslint-disable-next-line
                protocolVersionsSignature = originalProtocolVersionsSignature;
                domainServer.onStateChanged = null;
                waitUntilDone(done);
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });

    test("Session UUID values change as expected", (done) => {
        const domainServer = new DomainServer();
        expect(domainServer.sessionUUID.value()).toBe(Uuid.NULL);
        let haveSeenConnecting = false;
        let haveRequestedDisconnect = false;
        domainServer.onStateChanged = (state, info) => {
            expect(state === DomainServer.DISCONNECTED
                || state === DomainServer.CONNECTING
                || state === DomainServer.CONNECTED).toBe(true);
            expect(info).toBe("");
            haveSeenConnecting = haveSeenConnecting || state === DomainServer.CONNECTING;
            if (state === DomainServer.CONNECTED) {
                expect(domainServer.sessionUUID.value()).not.toBe(Uuid.NULL);  // eslint-disable-line jest/no-conditional-expect
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, 2500);  // Sufficient for a couple of sendDomainServerCheckin()s.
            } else if (state === DomainServer.DISCONNECTED && haveRequestedDisconnect) {
                setTimeout(() => {
                    expect(domainServer.sessionUUID.value()).toBe(Uuid.NULL);  // eslint-disable-line jest/no-conditional-expect
                    domainServer.onStateChanged = null;
                    waitUntilDone(done);
                }, 100);
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });


    error.mockReset();
    warn.mockReset();
    log.mockReset();
});
