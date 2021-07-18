//
//  WebRTCSignalingChannel.integration.test.js
//
//  Created by David Rowe on 17 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import WebRTCSignalingChannel from "../../../../src/domain/networking/webrtc/WebRTCSignalingChannel";
import NodeType from "../../../../src/domain/networking/NodeType";

import "wrtc";  // WebRTC Node.js package.


describe("WebRTCSignalingChannel - integration tests", () => {

    //  Test environment expected: Domain server running on localhost.
    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";
    const INVALID_WEBSOCKET = "ws://0.0.0.0:0";

    // Add WebSocket to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line


    test("Can open and close", (done) => {
        expect.assertions(4);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        expect(webrtcSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CONNECTING);
        webrtcSignalingChannel.onopen = function () {
            expect(webrtcSignalingChannel.readyState).toBe(WebRTCSignalingChannel.OPEN);
            webrtcSignalingChannel.close();
            expect(webrtcSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSING);
        };
        webrtcSignalingChannel.onclose = function () {
            expect(webrtcSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            webrtcSignalingChannel = null;
            done();
        };
    });

    test("Open invalid address fails with an error", (done) => {
        expect.assertions(1);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(INVALID_WEBSOCKET);
        webrtcSignalingChannel.onerror = function () {
            expect(webrtcSignalingChannel.readyState).toBeGreaterThanOrEqual(WebRTCSignalingChannel.CLOSING);
            webrtcSignalingChannel.close();
            webrtcSignalingChannel = null;
            done();
        };
    });

    test("Sending when closed fails with an error", (done) => {
        expect.assertions(3);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        function sendMessage() {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            const sent = webrtcSignalingChannel.send(echoMessage);
            expect(sent).toBe(false);
        }
        webrtcSignalingChannel.onopen = function () {
            webrtcSignalingChannel.close();
        };
        webrtcSignalingChannel.onclose = function () {
            expect(webrtcSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            sendMessage();
        };
        webrtcSignalingChannel.onerror = function () {
            expect(webrtcSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            webrtcSignalingChannel = null;
            done();
        };
    });

    test("Can echo test message off domain server", (done) => {
        expect.assertions(3);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            const sent = webrtcSignalingChannel.send(echoMessage);
            expect(sent).toBe(true);
        };
        webrtcSignalingChannel.onmessage = function (message) {
            expect(message.from).toBe(NodeType.DomainServer);
            expect(message.echo).toBe("Hello");
            webrtcSignalingChannel.close();
            webrtcSignalingChannel = null;
            done();
        };
    });

    test("Signaling channels are kept separate", (done) => {
        expect.assertions(4);
        let webrtcSignalingChannel1 = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel1.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            const sent = webrtcSignalingChannel1.send(echoMessage);
            expect(sent).toBe(true);
        };
        let webrtcSignalingChannel2 = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel2.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Goodbye" };
            const sent = webrtcSignalingChannel2.send(echoMessage);
            expect(sent).toBe(true);
        };
        webrtcSignalingChannel1.addEventListener("message", function (message) {
            expect(message.echo).toBe("Hello");  // eslint-disable-line
            webrtcSignalingChannel1.close();
            webrtcSignalingChannel1 = null;
            if (webrtcSignalingChannel2 === null) {
                done();
            }
        });
        webrtcSignalingChannel2.addEventListener("message", function (message) {
            expect(message.echo).toBe("Goodbye");  // eslint-disable-line
            webrtcSignalingChannel2.close();
            webrtcSignalingChannel2 = null;
            if (webrtcSignalingChannel1 === null) {
                done();
            }
        });
    });

    // WEBRTC TODO: "Can echo test message off messages mixer"

    // Testing that WebRTC signaling messages are able to be used is done through testing higher level function.

    error.mockReset();
});
