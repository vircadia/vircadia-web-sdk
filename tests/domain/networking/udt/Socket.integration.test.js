//
//  Socket.integration.test.js
//
//  Created by David Rowe on 1 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "../../../../src/domain/networking/NodeType";
import Socket from "../../../../src/domain/networking/udt/Socket";

import TestConfig from "../../../test.config.json";

import "wrtc";  // WebRTC Node.js package.


describe("Socket - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    // Add WebSocket and WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line


    test("Can connect to the domain server", (done) => {
        const socket = new Socket();
        socket.openSocket(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer, (socketID) => {
            expect(socketID).toBeGreaterThanOrEqual(0);
            expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer))
                .toBe(Socket.CONNECTED);
            expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.AudioMixer))
                .toBe(Socket.UNCONNECTED);
            expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL + "1", NodeType.DomainServer))
                .toBe(Socket.UNCONNECTED);
            socket.clearConnections();
            done();
        });
    });

    test("Can connect to the avatar mixer", (done) => {
        const socket = new Socket();
        socket.openSocket(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.AvatarMixer, (socketID) => {
            expect(socketID).toBeGreaterThanOrEqual(0);
            expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.AvatarMixer))
                .toBe(Socket.CONNECTED);
            expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer))
                .toBe(Socket.UNCONNECTED);
            expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL + "1", NodeType.AvatarMixer))
                .toBe(Socket.UNCONNECTED);
            socket.clearConnections();
            done();
        });
    });

    // The Socket class is further exercised by DomainServer.integration.test.js.

});
