//
//  NodeList.integration.test.js
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import NodesList from "../../../src/domain/networking/NodesList";
import NodeType from "../../../src/domain/networking/NodeType";
import ContextManager from "../../../src/domain/shared/ContextManager";

import TestConfig from "../../test.config.json";

import "wrtc";  // WebRTC Node.js package.


describe("NodesList - integration tests", () => {

    //  Test environment expected: Domain server that allows anonymous logins running on localhost or other per TestConfig.

    /* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    // Add WebSocket and WebRTC to Node.js environment.
    global.WebSocket = require("ws");  // eslint-disable-line
    global.RTCPeerConnection = require("wrtc").RTCPeerConnection;  // eslint-disable-line

    // Increase the Jest timeout from the default 5s.
    jest.setTimeout(10000);

    // Suppress console.log messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);  // Required by NodesList.
    ContextManager.set(contextID, NodesList, contextID);
    const addressManager = ContextManager.get(contextID, AddressManager);
    const nodesList = ContextManager.get(contextID, NodesList);


    test("Can perform an initial domain server check-in", (done) => {
        // Sends a DomainConnectRequest to the domain server and handles the resulting DomainList packet, resulting in the
        // DomainHandler emitting a connectedToDomain signal.
        expect.assertions(1);

        // Set up DomainHandler.
        addressManager.handleLookupString(TestConfig.SERVER_SIGNALING_SOCKET_URL);

        // Set up NodesList.
        nodesList.addSetOfNodeTypesToNodeInterestSet(new Set([
            NodeType.AudioMixer,
            NodeType.AvatarMixer,
            NodeType.EntityServer,
            NodeType.AssetServer,
            NodeType.MessagesMixer,
            NodeType.EntityScriptServer
        ]));

        // Create WebRTC signaling channel.
        setTimeout(function () {
            nodesList.sendDomainServerCheckIn();
        }, 0);

        // Create WebRTC data channel.
        setTimeout(function () {
            nodesList.sendDomainServerCheckIn();
        }, 1000);

        // Send a DomainConnectRequest packet to the domain server.
        setTimeout(function () {
            nodesList.sendDomainServerCheckIn();
        }, 2000);

        // Receive a DomainServerList packet in response.
        const domainHandler = nodesList.getDomainHandler();
        let backupTimeout = null;
        domainHandler.connectedToDomain.connect(function () {
            clearTimeout(backupTimeout);
            expect(true).toBe(true);
            setTimeout(() => {  // Provide time for residual log messages to stop being emitted.
                done();
            }, 500);
        });

        // Back-up exit test
        backupTimeout = setTimeout(function () {
            console.error("Force terminated test");
            done();
        }, 10000);

    });


    warn.mockReset();
    log.mockReset();
});
