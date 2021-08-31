//
//  WebRTCSignalingChannel.integration.test.js
//
//  Created by David Rowe on 17 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import WebRTCSignalingChannel from "../../../../src/domain/networking/webrtc/WebRTCSignalingChannel";
import NodeType from "../../../../src/domain/networking/NodeType";

import TestConfig from "../../../test.config.json";

import "wrtc";  // WebRTC Node.js package.


describe("WebRTCSignalingChannel - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    // Add WebSocket to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line


    test("Can open and close", (done) => {
        expect.assertions(4);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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
        let webrtcSignalingChannel = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_INVALID_URL);
        webrtcSignalingChannel.onerror = function () {
            expect(webrtcSignalingChannel.readyState).toBeGreaterThanOrEqual(WebRTCSignalingChannel.CLOSING);
            webrtcSignalingChannel.close();
            webrtcSignalingChannel = null;
            done();
        };
    });

    test("Sending when closed fails with an error", (done) => {
        expect.assertions(3);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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
        let webrtcSignalingChannel = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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
        let webrtcSignalingChannel1 = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_URL);
        webrtcSignalingChannel1.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            const sent = webrtcSignalingChannel1.send(echoMessage);
            expect(sent).toBe(true);
        };
        let webrtcSignalingChannel2 = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_URL);
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

    test("Can echo test message off message mixer", (done) => {
        expect.assertions(3);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(TestConfig.SERVER_SIGNALING_SOCKET_URL);
        webrtcSignalingChannel.onopen = function () {
            const echoMessage = { to: NodeType.MessagesMixer, echo: "Hello" };
            const sent = webrtcSignalingChannel.send(echoMessage);
            expect(sent).toBe(true);
        };
        webrtcSignalingChannel.onmessage = function (message) {
            expect(message.from).toBe(NodeType.MessagesMixer);
            expect(message.echo).toBe("Hello");
            webrtcSignalingChannel.close();
            webrtcSignalingChannel = null;
            done();
        };
    });

    // WEBRTC TODO: "Can echo test message off messages mixer"

    // Testing that WebRTC signaling messages are able to be used is done through testing higher level function.

    error.mockReset();
});
