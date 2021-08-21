//
//  LimitedNodeList.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import LimitedNodeList from "../../../src/domain/networking/LimitedNodeList";
import NodePermissions from "../../../src/domain/networking/NodePermissions";
import Node from "../../../src/domain/networking/Node";
import NodeType from "../../../src/domain/networking/NodeType";
import PacketReceiver from "../../../src/domain/networking/PacketReceiver";
import SockAddr from "../../../src/domain/networking/SockAddr";
import Uuid from "../../../src/domain/shared/Uuid";


describe("LimitedNodeList - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    const IP_127_0_0_1 = 127 * 2 ** 24 + 1;  // 127.0.0.1
    const IP_127_0_0_2 = 127 * 2 ** 24 + 2;  // 127.0.0.2
    const PORT_101 = 101;
    const PORT_102 = 102;
    const AUDIO_MIXER_NODE_INFO = {
        type: NodeType.AudioMixer,
        uuid: new Uuid(1234n),
        publicSocket: new SockAddr(),
        localSocket: new SockAddr(),
        permissions: new NodePermissions(),
        isReplicated: true,
        isUpstream: true,
        sessionLocalID: 11,
        connectionSecretUUID: new Uuid(5678n)
    };
    AUDIO_MIXER_NODE_INFO.publicSocket.setAddress(IP_127_0_0_1);
    AUDIO_MIXER_NODE_INFO.publicSocket.setAddress(IP_127_0_0_1);
    AUDIO_MIXER_NODE_INFO.publicSocket.setPort(PORT_101);
    AUDIO_MIXER_NODE_INFO.localSocket.setAddress(IP_127_0_0_2);
    AUDIO_MIXER_NODE_INFO.localSocket.setPort(PORT_102);

    // Suppress console messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });


    test("Can access ConnectReason values", () => {
        expect(LimitedNodeList.ConnectReason.Connect).toBe(0);
        expect(LimitedNodeList.ConnectReason.Awake).toBe(2);
    });

    test("Can access INVALID_PORT", () => {
        expect(LimitedNodeList.INVALID_PORT).toBe(-1);
    });

    test("Can get the local and public network addresses", () => {
        const limitedNodeList = new LimitedNodeList();
        const localSockAddr = limitedNodeList.getLocalSockAddr();
        expect(localSockAddr.getAddress()).toBe(0);
        expect(localSockAddr.getPort()).toBe(0);
        const publicSockAddr = limitedNodeList.getPublicSockAddr();
        expect(publicSockAddr.getAddress()).toBe(0);
        expect(publicSockAddr.getPort()).toBe(0);
    });

    test("Can get the PacketReceiver", () => {
        const limitedNodeList = new LimitedNodeList();
        const packetReceiver = limitedNodeList.getPacketReceiver();
        expect(packetReceiver instanceof PacketReceiver).toBe(true);
    });

    test("Can set and get session UUIDs and local IDs", () => {
        const limitedNodeList = new LimitedNodeList();
        expect(limitedNodeList.getSessionUUID().valueOf()).toBe(Uuid.NULL);
        expect(limitedNodeList.getSessionLocalID()).toBe(0);
        const testSessionUUID = new Uuid(12345678n);
        const testSessionLocalID = 2468;
        limitedNodeList.setSessionUUID(testSessionUUID);
        limitedNodeList.setSessionLocalID(testSessionLocalID);
        expect(limitedNodeList.getSessionUUID().valueOf()).toBe(testSessionUUID.valueOf());
        expect(limitedNodeList.getSessionLocalID()).toBe(testSessionLocalID);
    });

    test("Can add a new assignment client node", (done) => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.nodeAdded.connect((node) => {
            expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
            expect(node.getUUID()).toBe(AUDIO_MIXER_NODE_INFO.uuid);
            done();
        });
        const node = limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(node.getUUID()).toEqual(AUDIO_MIXER_NODE_INFO.uuid);
        expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
        expect(node.getPublicSocket()).toEqual(AUDIO_MIXER_NODE_INFO.publicSocket);
        expect(node.getLocalSocket()).toEqual(AUDIO_MIXER_NODE_INFO.localSocket);
        expect(node.getLocalID()).toEqual(AUDIO_MIXER_NODE_INFO.sessionLocalID);
        expect(node.getIsReplicated()).toBe(AUDIO_MIXER_NODE_INFO.isReplicated);
        expect(node.getIsUpstream()).toBe(AUDIO_MIXER_NODE_INFO.isUpstream);
        expect(node.getConnectionSecret()).toEqual(AUDIO_MIXER_NODE_INFO.connectionSecretUUID);
        expect(node.getPermissions()).toEqual(AUDIO_MIXER_NODE_INFO.permissions);

    });

    test("Node activated signaled when node is activated", (done) => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.nodeAdded.connect((node) => {
            expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
            expect(node.getUUID()).toBe(AUDIO_MIXER_NODE_INFO.uuid);
            node.setActiveSocket(AUDIO_MIXER_NODE_INFO.publicSocket);
        });
        limitedNodeList.nodeActivated.connect((node) => {
            expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
            expect(node.getUUID()).toBe(AUDIO_MIXER_NODE_INFO.uuid);
            done();
        });
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
    });

    test("Node socket updated signaled when node socket is updated", (done) => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.nodeAdded.connect((node) => {
            expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
            expect(node.getUUID()).toBe(AUDIO_MIXER_NODE_INFO.uuid);
            const newSocket = new SockAddr();
            newSocket.setAddress(IP_127_0_0_2);
            newSocket.setPort(PORT_102);
            node.setPublicSocket(newSocket);
        });
        limitedNodeList.nodeSocketUpdated.connect((node) => {
            expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
            expect(node.getUUID()).toBe(AUDIO_MIXER_NODE_INFO.uuid);
            done();
        });
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
    });

    test("Can retrieve a solo node", () => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(NodeType.AudioMixer) instanceof Node).toBe(true);
        expect(limitedNodeList.soloNodeOfType(NodeType.AvatarMixer)).toBeNull();
    });

    test("Can retrieve the node with a specific address", () => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );

        expect(limitedNodeList.findNodeWithAddr(AUDIO_MIXER_NODE_INFO.publicSocket) instanceof Node).toBe(true);
        expect(limitedNodeList.findNodeWithAddr(AUDIO_MIXER_NODE_INFO.localSocket) instanceof Node).toBe(true);
        const sockAddr = new SockAddr();
        sockAddr.setAddress(IP_127_0_0_1);
        sockAddr.setPort(999);
        expect(limitedNodeList.findNodeWithAddr(sockAddr)).toBeNull();
    });

    test("addOrUpdateNode doesn't create a new node if it already exists", () => {
        const limitedNodeList = new LimitedNodeList();
        const nodeA = limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        const nodeB = limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(nodeB).toBe(nodeA);
    });

    test("Can update an existing node", () => {
        const limitedNodeList = new LimitedNodeList();
        const nodeA = limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        const nodeB = limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID + 1,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(nodeB).toBe(nodeA);
        expect(nodeA.getLocalID()).toEqual(AUDIO_MIXER_NODE_INFO.sessionLocalID + 1);
    });

    test("Can reset the node list", () => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        // Reset the nodes list.
        limitedNodeList.reset("Some reason");
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type)).toBeNull();
        // Resetting again is OK.
        limitedNodeList.reset("Some reason");
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type)).toBeNull();
    });

    test("Can get a node with a specific UUID", () => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        expect(limitedNodeList.nodeWithUUID(AUDIO_MIXER_NODE_INFO.uuid) instanceof Node).toBe(true);
    });

    test("Can remove a node with a specific UUID", () => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        // Removing a non-existent node doesn't remove.
        limitedNodeList.killNodeWithUUID(new Uuid(9999n));
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        // Remove the node list.
        limitedNodeList.killNodeWithUUID(AUDIO_MIXER_NODE_INFO.uuid);
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type)).toBeNull();
        // Removing again is OK.
        limitedNodeList.killNodeWithUUID(AUDIO_MIXER_NODE_INFO.uuid);
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type)).toBeNull();

    });

    // The following items are tested elsewhere:
    // - sendPacket() - Tested implicitly by NodesList integration test.
    // - sendUnreliablePacket() - Tested implicitly by NodesList integration test.


    warn.mockReset();
    log.mockReset();
});
