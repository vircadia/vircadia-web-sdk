//
//  SignalingChannel.integration.test.js
//
//  Created by David Rowe on 17 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import SignalingChannel from "../../../../src/libraries/networking/webrtc/SignalingChannel.js";
import NodeType from "../../../../src/libraries/networking/NodeType.js";

describe("SignalingChannel - integration tests", () => {

    //  Test environment expected: Domain server running on localhost.

    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";
    const INVALID_WEBSOCKET = "ws://0.0.0.0:0";

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line no-empty-function

    test("Can open and close", (done) => {
        expect.assertions(2);
        let signalingChannel = new SignalingChannel(LOCALHOST_WEBSOCKET);
        signalingChannel.onopen = function () {
            expect(signalingChannel.readyState).toBe(SignalingChannel.OPEN);
            signalingChannel.close();
        };
        signalingChannel.onclose = function () {
            expect(signalingChannel.readyState).toBe(SignalingChannel.CLOSED);
            signalingChannel = null;
            done();
        };
    });

    test("Open invalid address fails with an error", (done) => {
        expect.assertions(1);
        let signalingChannel = new SignalingChannel(INVALID_WEBSOCKET);
        signalingChannel.onerror = function () {
            expect(signalingChannel.readyState).toBe(SignalingChannel.CLOSED);
            signalingChannel.close();
            signalingChannel = null;
            done();
        };
    });

    test("Sending when closed fails with an error", (done) => {
        expect.assertions(2);
        let signalingChannel = new SignalingChannel(LOCALHOST_WEBSOCKET);
        function sendMessage() {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            signalingChannel.send(echoMessage);
        }
        signalingChannel.onopen = function () {
            signalingChannel.close();
        };
        signalingChannel.onclose = function () {
            expect(signalingChannel.readyState).toBe(SignalingChannel.CLOSED);
            sendMessage();
        };
        signalingChannel.onerror = function () {
            expect(signalingChannel.readyState).toBe(SignalingChannel.CLOSED);
            signalingChannel = null;
            done();
        };
    });

    test("Can echo test message off domain server", (done) => {
        expect.assertions(2);
        let signalingChannel = new SignalingChannel(LOCALHOST_WEBSOCKET);
        signalingChannel.onopen = function () {
            const echoMessage = { to: NodeType.DomainServer, echo: "Hello" };
            signalingChannel.send(echoMessage);
        };
        signalingChannel.onmessage = function (message) {
            expect(message.from).toBe(NodeType.DomainServer);
            expect(message.echo).toBe("Hello");
            signalingChannel.close();
            signalingChannel = null;
            done();
        };
    });

    // WEBRTC TODO: "Can echo test message off messages mixer"

    // Testing that WebRTC signaling messages are able to be used is done through testing higher level function.

    error.mockReset();
});
