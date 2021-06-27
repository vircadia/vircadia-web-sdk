//
//  NodeList.integration.test.js
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */

import "wrtc";  // WebRTC Node.js package.

import AddressManager from "../../../src/libraries/networking/AddressManager.js";
import NodesList from "../../../src/libraries/networking/NodesList.js";
import NodeType from "../../../src/libraries/networking/NodeType.js";


describe("NodesList - integration tests", () => {

    //  Test environment expected: Domain server running on localhost that allows anonymous logins.

    // Add WebRTC to Node.js environment.
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;

    /* eslint-disable no-magic-numbers */

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    const LOCALHOST_WEBSOCKET = "ws://127.0.0.1:40102";


    test("Can perform an initial domain server check-in", (done) => {
        // Sends a DomainConnectRequest to the domain server and handles the resulting DomainList packet, resulting in the
        // DomainHandler emitting a connectedToDomain signal.
        expect.assertions(1);

        // Set up DomainHandler.
        AddressManager.handleLookupString(LOCALHOST_WEBSOCKET);

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
            NodesList.reset();
            expect(true).toBe(true);
            done();
        });

        // Back-up exit test
        backupTimeout = setTimeout(function () {
            console.error("Force terminated test");
            NodesList.reset();
            done();
        }, 10000);

    });

});