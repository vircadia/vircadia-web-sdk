//
//  WebRTCSocket.integration.test.js
//
//  Created by David Rowe on 15 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "../../../../src/domain/networking/NodeType";
import WebRTCSocket from "../../../../src/domain/networking/webrtc/WebRTCSocket";

import TestConfig from "../../../test.config.js";

import "wrtc";  // WebRTC Node.js package.


describe("WebRTCSocket - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    // Add WebSocket and WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line


    test("Can connect to the domain server", (done) => {
        const webrtcSocket = new WebRTCSocket();
        webrtcSocket.connectToHost(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer, (socketID) => {
            expect(socketID).toBeGreaterThanOrEqual(0);
            expect(webrtcSocket.state(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer))
                .toBe(WebRTCSocket.CONNECTED);
            expect(webrtcSocket.state(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.AudioMixer))
                .toBe(WebRTCSocket.UNCONNECTED);
            expect(webrtcSocket.state(TestConfig.SERVER_SIGNALING_SOCKET_URL + "1", NodeType.DomainServer))
                .toBe(WebRTCSocket.UNCONNECTED);
            webrtcSocket.abort();
            done();
        });
    });

    test("Can connect to the message mixer", (done) => {
        // Need a domain server connection to relay mixer signaling messages.
        const webrtcSocket = new WebRTCSocket();
        webrtcSocket.connectToHost(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer, () => {
            webrtcSocket.connectToHost(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.MessagesMixer, (socketID) => {
                expect(socketID).toBeGreaterThanOrEqual(0);
                expect(webrtcSocket.state(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.MessagesMixer))
                    .toBe(WebRTCSocket.CONNECTED);
                expect(webrtcSocket.state(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer))
                    .toBe(WebRTCSocket.CONNECTED);
                expect(webrtcSocket.state(TestConfig.SERVER_SIGNALING_SOCKET_URL + "1", NodeType.MessagesMixer))
                    .toBe(WebRTCSocket.UNCONNECTED);
                webrtcSocket.abort();
                done();
            });
        });
    });

    // The WebRTCSocket class is further exercised by DomainServer.integration.test.js.

});
