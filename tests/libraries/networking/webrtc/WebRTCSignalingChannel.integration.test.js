//
//  WebRTCSignalingChannel.integration.test.js
//
//  Created by David Rowe on 17 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import WebRTCSignalingChannel from "../../../../src/libraries/networking/webrtc/WebRTCSignalingChannel.js";
import NodeType from "../../../../src/libraries/networking/NodeType.js";

describe("WebRTCSignalingChannel - integration tests", () => {

    //  Test environment expected: Domain server running on localhost.

    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";
    const INVALID_WEBSOCKET = "ws://0.0.0.0:0";

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line no-empty-function

    test("Can open and close", (done) => {
        expect.assertions(2);
        let webRTCSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webRTCSignalingChannel.onopen = function () {
            expect(webRTCSignalingChannel.readyState).toBe(WebRTCSignalingChannel.OPEN);
            webRTCSignalingChannel.close();
        };
        webRTCSignalingChannel.onclose = function () {
            expect(webRTCSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            webRTCSignalingChannel = null;
            done();
        };
    });

    test("Open invalid address fails with an error", (done) => {
        expect.assertions(1);
        let webRTCSignalingChannel = new WebRTCSignalingChannel(INVALID_WEBSOCKET);
        webRTCSignalingChannel.onerror = function () {
            expect(webRTCSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            webRTCSignalingChannel.close();
            webRTCSignalingChannel = null;
            done();
        };
    });

    test("Sending when closed fails with an error", (done) => {
        expect.assertions(2);
        let webRTCSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        function sendMessage() {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            webRTCSignalingChannel.send(echoMessage);
        }
        webRTCSignalingChannel.onopen = function () {
            webRTCSignalingChannel.close();
        };
        webRTCSignalingChannel.onclose = function () {
            expect(webRTCSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            sendMessage();
        };
        webRTCSignalingChannel.onerror = function () {
            expect(webRTCSignalingChannel.readyState).toBe(WebRTCSignalingChannel.CLOSED);
            webRTCSignalingChannel = null;
            done();
        };
    });

    test("Can echo test message off domain server", (done) => {
        expect.assertions(2);
        let webRTCSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webRTCSignalingChannel.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            webRTCSignalingChannel.send(echoMessage);
        };
        webRTCSignalingChannel.onmessage = function (message) {
            expect(message.from).toBe(NodeType.DomainServer);
            expect(message.echo).toBe("Hello");
            webRTCSignalingChannel.close();
            webRTCSignalingChannel = null;
            done();
        };
    });

    test("Signaling channels are kept separate", (done) => {
        expect.assertions(2);
        let webrtcSignalingChannel1 = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel1.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            webrtcSignalingChannel1.send(echoMessage);
        };
        let webrtcSignalingChannel2 = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel2.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Goodbye" };
            webrtcSignalingChannel2.send(echoMessage);
        };
        webrtcSignalingChannel1.onmessage = function (message) {
            expect(message.echo).toBe("Hello");
            webrtcSignalingChannel1.close();
            webrtcSignalingChannel1 = null;
            if (webrtcSignalingChannel2 === null) {
                done();
            }
        };
        webrtcSignalingChannel2.onmessage = function (message) {
            expect(message.echo).toBe("Goodbye");
            webrtcSignalingChannel2.close();
            webrtcSignalingChannel2 = null;
            if (webrtcSignalingChannel1 === null) {
                done();
            }
        };
    });

    // WEBRTC TODO: "Can echo test message off messages mixer"

    // Testing that WebRTC signaling messages are able to be used is done through testing higher level function.

    error.mockReset();
});