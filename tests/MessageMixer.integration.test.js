//
//  MessageMixer.integration.test.js
//
//  Created by David Rowe on 19 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer";
import MessageMixer from "../src/MessageMixer";

import TestConfig from "./test.config.json";

import "wrtc";  // WebRTC Node.js package.


// Time needs to be allowed for the WebRTC RTCPeerConnection from one test to be closed before creating a new one in the
// next test.
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/close
function waitUntilDone(done) {
    const DONE_TIMEOUT = 500;
    setTimeout(() => {
        done();  // eslint-disable-line
    }, DONE_TIMEOUT);
}


describe("MessageMixer - integration tests", () => {

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


    test("States when connect to and disconnect from a domain", (done) => {
        const domainServer = new DomainServer();
        const messageMixer = new MessageMixer(domainServer.contextID);
        expect(messageMixer.state).toBe(MessageMixer.UNAVAILABLE);
        let haveSeenDisconnected = false;
        let haveRequestedDisconnect = false;

        messageMixer.onStateChanged = (state) => {
            haveSeenDisconnected = haveSeenDisconnected || messageMixer.state === MessageMixer.DISCONNECTED;
            if (state === MessageMixer.CONNECTED) {
                expect(haveSeenDisconnected).toBe(true);  // eslint-disable-line jest/no-conditional-expect
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, 0);
            } else if (state === MessageMixer.UNAVAILABLE && haveRequestedDisconnect) {
                messageMixer.onStateChanged = null;
                waitUntilDone(done);
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });


    warn.mockReset();
    log.mockReset();
});
