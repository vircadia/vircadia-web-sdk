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

    // Set up Node.js StringDecoder.
    const { StringDecoder } = require("string_decoder");

    // Suppress console.error messages from being displayed.
    const error = jest.spyOn(console, "error").mockImplementation(() => { });  // eslint-disable-line no-empty-function

    /* eslint-disable no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

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

    test("Open with invalid address fails with an error", (done) => {
        expect.assertions(1);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(INVALID_WEBSOCKET);
        webrtcSignalingChannel.onerror = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onerror = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                webrtcDataChannel = null;
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Closing signaling channel while connecting data channel fails with an error", (done) => {
        expect.assertions(1);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onerror = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                webrtcDataChannel = null;
                webrtcSignalingChannel = null;
                done();
            };
            webrtcSignalingChannel.close();
        };
    });

    test("Sending when closed fails with an error", (done) => {
        expect.assertions(2);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onopen = function () {
                webrtcDataChannel.close();
            };
            webrtcDataChannel.onclose = function () {
                expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CLOSED);
                const sent = webrtcDataChannel.send();
                expect(sent).toBe(false);
            };
            webrtcDataChannel.onerror = function () {
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channel ID is 0 when data channel isn't open", (done) => {
        expect.assertions(2);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            expect(webrtcDataChannel.readyState).toBe(WebRTCDataChannel.CONNECTING);
            expect(webrtcDataChannel.channelID).toBe(0);
            webrtcDataChannel.onopen = function () {
                webrtcDataChannel.close();
            };
            webrtcDataChannel.onclose = function () {
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channel reports correct node type", (done) => {
        expect.assertions(1);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onopen = function () {
                expect(webrtcDataChannel.nodeType).toBe(NodeType.DomainServer);
                webrtcDataChannel.close();
            };
            webrtcDataChannel.onclose = function () {
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Can echo test message off domain server", (done) => {
        expect.assertions(2);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onopen = function () {
                const echoMessage = "echo:Hello";
                const sent = webrtcDataChannel.send(echoMessage);
                expect(sent).toBe(true);
            };
            webrtcDataChannel.onmessage = function (data) {
                expect(new StringDecoder("utf8").write(new Uint8Array(data))).toBe("echo:Hello");
                webrtcDataChannel.close();
            };
            webrtcDataChannel.onclose = function () {
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channel ID is provided in method and open callback", (done) => {
        expect.assertions(3);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel.onopen = function (channelID) {
                expect(typeof channelID).toBe("number");
                expect(channelID).toBeGreaterThan(0);
                expect(channelID).toBe(webrtcDataChannel.channelID);
                webrtcDataChannel.close();
            };
            webrtcDataChannel.onclose = function () {
                webrtcDataChannel = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channels have unique channel IDs", (done) => {
        expect.assertions(3);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel1 = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            let webrtcDataChannel2 = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel1.onopen = function (channelID) {
                expect(channelID).toBeGreaterThan(0);
                if (webrtcDataChannel2.readyState === WebRTCDataChannel.OPEN) {
                    expect(webrtcDataChannel1.channelID === webrtcDataChannel2.channelID).toBe(false);
                    webrtcDataChannel1.close();
                    webrtcDataChannel2.close();
                }
            };
            webrtcDataChannel2.onopen = function (channelID) {
                expect(channelID).toBeGreaterThan(0);
                if (webrtcDataChannel1.readyState === WebRTCDataChannel.OPEN) {
                    expect(webrtcDataChannel1.channelID === webrtcDataChannel2.channelID).toBe(false);
                    webrtcDataChannel1.close();
                    webrtcDataChannel2.close();
                }
            };
            webrtcDataChannel1.onclose = function () {
                webrtcDataChannel1 = null;
            };
            webrtcDataChannel2.onclose = function () {
                webrtcDataChannel2 = null;
                webrtcSignalingChannel.close();
                webrtcSignalingChannel = null;
                done();
            };
        };
    });

    test("Data channels are kept separate", (done) => {
        expect.assertions(4);
        let webrtcSignalingChannel = new WebRTCSignalingChannel(LOCALHOST_WEBSOCKET);
        let repliesReceived = 0;
        webrtcSignalingChannel.onopen = function () {
            let webrtcDataChannel1 = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            let webrtcDataChannel2 = new WebRTCDataChannel(NodeType.DomainServer, webrtcSignalingChannel);
            webrtcDataChannel1.onopen = function () {
                const sent = webrtcDataChannel1.send("Hello");
                expect(sent).toBe(true);
            };
            webrtcDataChannel2.onopen = function () {
                const sent = webrtcDataChannel2.send("Goodbye");
                expect(sent).toBe(true);
            };
            webrtcDataChannel1.onmessage = function (data) {
                expect(new StringDecoder("utf8").write(new Uint8Array(data))).toBe("echo:Hello");
                repliesReceived += 1;
                if (repliesReceived === 2) {
                    webrtcDataChannel1.close();
                    webrtcDataChannel2.close();
                }
            };
            webrtcDataChannel2.onmessage = function (data) {
                expect(new StringDecoder("utf8").write(new Uint8Array(data))).toBe("echo:Goodbye");
                repliesReceived += 2;
                if (repliesReceived === 2) {
                    webrtcDataChannel1.close();
                    webrtcDataChannel2.close();
                }
            };
            webrtcDataChannel1.onclose = function () {
                webrtcDataChannel1 = null;
            };
            webrtcDataChannel2.onclose = function () {
                webrtcDataChannel2 = null;
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
