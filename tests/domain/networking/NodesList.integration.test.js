//
//  NodeList.integration.test.js
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import AddressManager from "../../../src/domain/networking/AddressManager";
import NodesList from "../../../src/domain/networking/NodesList";
import NodeType from "../../../src/domain/networking/NodeType";

import TestConfig from "../../test.config.json";

import "wrtc";  // WebRTC Node.js package.


describe("NodesList - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    // Add WebSocket and WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* noop */ });


    test("Can perform an initial domain server check-in", (done) => {
        // Sends a DomainConnectRequest to the domain server and handles the resulting DomainList packet, resulting in the
        // DomainHandler emitting a connectedToDomain signal.
        expect.assertions(1);

        // Set up DomainHandler.
        AddressManager.handleLookupString(TestConfig.SERVER_SIGNALING_SOCKET_URL);

        // Set up NodesList.
        NodesList.addSetOfNodeTypesToNodeInterestSet(new Set([
            NodeType.AudioMixer,
            NodeType.AvatarMixer,
            NodeType.EntityServer,
            NodeType.AssetServer,
            NodeType.MessagesMixer,
            NodeType.EntityScriptServer
        ]));

        // Create WebRTC signaling channel.
        setTimeout(function () {
            NodesList.sendDomainServerCheckIn();
        }, 0);

        // Create WebRTC data channel.
        setTimeout(function () {
            NodesList.sendDomainServerCheckIn();
        }, 1000);

        // Send a DomainConnectRequest packet to the domain server.
        setTimeout(function () {
            NodesList.sendDomainServerCheckIn();
        }, 2000);

        // Receive a DomainServerList packet in response.
        const domainHandler = NodesList.getDomainHandler();
        let backupTimeout = null;
        domainHandler.connectedToDomain.connect(function () {
            clearTimeout(backupTimeout);
            expect(true).toBe(true);
            done();
        });

        // Back-up exit test
        backupTimeout = setTimeout(function () {
            console.error("Force terminated test");
            done();
        }, 10000);

    });


    log.mockReset();
});
