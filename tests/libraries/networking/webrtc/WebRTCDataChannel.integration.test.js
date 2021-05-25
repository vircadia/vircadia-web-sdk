//
//  WebRTCDataChannel.integration.test.js
//
//  Created by David Rowe on 21 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import WebRTCDataChannel from "../../../../src/libraries/networking/webrtc/WebRTCDataChannel.js";
import WebRTCSignalingChannel from "../../../../src/libraries/networking/webrtc/WebRTCSignalingChannel.js";
import NodeType from "../../../../src/libraries/networking/NodeType.js";

import "wrtc";  // WebRTC Node.js package.

describe("WebRTCDataChannel - integration tests", () => {

    //  Test environment expected: Domain server running on localhost that allows anonymous logins.

    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";
    const INVALID_WEBSOCKET = "ws://0.0.0.0:0";

    // Add WebRTC to Node.js environment.
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line no-empty-function

    /* eslint-disable no-magic-numbers */

    test("Can open and close", (done) => {
        expect.assertions(4);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CONNECTING);
            webrtcDataChannel.onopen = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.OPEN);
                webrtcDataChannel.close();
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSING);
            };
            webrtcDataChannel.onclose = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    // WEBRTC TODO: "Can echo test message off messages mixer"

    // WEBRTC TODO: Add messages mixer to node types test.

    error.mockReset();
});
