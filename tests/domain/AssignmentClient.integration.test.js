//
//  AssignmentClient.integration.test.js
//
//  Created by David Rowe on 19 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../../src/DomainServer";
import AssignmentClient from "../../src/domain/AssignmentClient";
import NodeType from "../../src/domain/networking/NodeType";

import "wrtc";  // WebRTC Node.js package.

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import TestConfig from "../test.config.js";


// Time needs to be allowed for the WebRTC RTCPeerConnection from one test to be closed before creating a new one in the
// next test.
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/close
function waitUntilDone(done) {
    const DONE_TIMEOUT = 500;
    setTimeout(() => {
        done();  // eslint-disable-line
    }, DONE_TIMEOUT);
}


describe("AssignmentClient - integration tests", () => {

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
    const error = jest.spyOn(console, "error").mockImplementation((...message) => {
        const errorMessage = message.join(" ");
        // eslint-disable-next-line
        expect(errorMessage).toBe("[networking] Public key upload to metaverse failed: https://metaverse.vircadia.com/live/api/v1/user/public_key Not authenticated");
    });


    test("States when connect to and disconnect from a domain", (done) => {
        const domainServer = new DomainServer();
        const assignmentClient = new AssignmentClient(domainServer.contextID, NodeType.AudioMixer);
        expect(assignmentClient.state).toBe(AssignmentClient.UNAVAILABLE);
        let haveSeenDisconnected = false;
        let haveRequestedDisconnect = false;

        assignmentClient.onStateChanged = (state) => {
            haveSeenDisconnected = haveSeenDisconnected || assignmentClient.state === AssignmentClient.DISCONNECTED;
            if (state === AssignmentClient.CONNECTED) {
                expect(haveSeenDisconnected).toBe(true);  // eslint-disable-line jest/no-conditional-expect
                setTimeout(() => {
                    haveRequestedDisconnect = true;
                    domainServer.disconnect();
                }, 0);
            } else if (state === AssignmentClient.UNAVAILABLE && haveRequestedDisconnect) {
                assignmentClient.onStateChanged = null;
                waitUntilDone(done);
            }
        };
        domainServer.connect(TestConfig.SERVER_SIGNALING_SOCKET_URL);
    });


    error.mockReset();
    warn.mockReset();
    log.mockReset();
});
