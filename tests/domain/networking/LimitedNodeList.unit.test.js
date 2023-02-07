//
//  LimitedNodeList.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import Node from "../../../src/domain/networking/Node";
import NodeList from "../../../src/domain/networking/NodeList";
import LimitedNodeList from "../../../src/domain/networking/LimitedNodeList";  // Must come after NodeList.
import NodePermissions from "../../../src/domain/networking/NodePermissions";
import NodeType from "../../../src/domain/networking/NodeType";
import PacketReceiver from "../../../src/domain/networking/PacketReceiver";
import SockAddr from "../../../src/domain/networking/SockAddr";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Uuid from "../../../src/domain/shared/Uuid";


describe("LimitedNodeList - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager, contextID);  // Required by NodeList.
    ContextManager.set(contextID, AddressManager);  // Required by NodeList.
    ContextManager.set(contextID, NodeList, contextID);  // Required by PacketReceiver.

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

    test("Trying to get the domain server's local ID and SockAddr throw errors", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        expect(() => {
            limitedNodeList.getDomainLocalID();
        }).toThrow();
        expect(() => {
            limitedNodeList.getDomainSockAddr();
        }).toThrow();
    });

    test("Can access INVALID_PORT", () => {
        expect(LimitedNodeList.INVALID_PORT).toBe(-1);
    });

    test("Reports that it is not being used for the domain server connection", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        expect(limitedNodeList.isDomainServer()).toBe(true);
    });

    test("Can get the local and public network addresses", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        const localSockAddr = limitedNodeList.getLocalSockAddr();
        expect(localSockAddr.getAddress()).toBe(0);
        expect(localSockAddr.getPort()).toBe(0);
        const publicSockAddr = limitedNodeList.getPublicSockAddr();
        expect(publicSockAddr.getAddress()).toBe(0);
        expect(publicSockAddr.getPort()).toBe(0);
    });

    test("Can get the PacketReceiver", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        const packetReceiver = limitedNodeList.getPacketReceiver();
        expect(packetReceiver instanceof PacketReceiver).toBe(true);
    });

    test("Can set and get session UUIDs and local IDs", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        expect(limitedNodeList.getSessionUUID().valueOf()).toBe(Uuid.NULL);
        expect(limitedNodeList.getSessionLocalID()).toBe(0);
        const testSessionUUID = new Uuid(12345678n);
        const testSessionLocalID = 2468;
        limitedNodeList.setSessionUUID(testSessionUUID);
        limitedNodeList.setSessionLocalID(testSessionLocalID);
        expect(limitedNodeList.getSessionUUID().valueOf()).toBe(testSessionUUID.valueOf());
        expect(limitedNodeList.getSessionLocalID()).toBe(testSessionLocalID);
    });

    test("Can set and get whether to authenticate packet content", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        expect(limitedNodeList.getAuthenticatePackets()).toBe(true);  // Default value.
        limitedNodeList.setAuthenticatePackets(false);
        expect(limitedNodeList.getAuthenticatePackets()).toBe(false);
    });

    test("Can add a new assignment client node", (done) => {
        const limitedNodeList = new LimitedNodeList(contextID);
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
        const limitedNodeList = new LimitedNodeList(contextID);
        limitedNodeList.nodeAdded.connect((node) => {
            expect(node.getType()).toBe(AUDIO_MIXER_NODE_INFO.type);
            expect(node.getUUID()).toBe(AUDIO_MIXER_NODE_INFO.uuid);
            node.setPublicSocket(AUDIO_MIXER_NODE_INFO.publicSocket);
            node.activatePublicSocket();
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
        const limitedNodeList = new LimitedNodeList(contextID);
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

    test("Node killed signaled when node is killed", (done) => {
        const limitedNodeList = new LimitedNodeList(contextID);
        limitedNodeList.nodeAdded.connect((node) => {
            limitedNodeList.killNodeWithUUID(node.getUUID());
        });
        limitedNodeList.nodeKilled.connect((node) => {
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
        const limitedNodeList = new LimitedNodeList(contextID);
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(NodeType.AudioMixer) instanceof Node).toBe(true);
        expect(limitedNodeList.soloNodeOfType(NodeType.AvatarMixer)).toBeNull();
    });

    test("Can retrieve the node with a specific address", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
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
        const limitedNodeList = new LimitedNodeList(contextID);
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
        const limitedNodeList = new LimitedNodeList(contextID);
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
        const limitedNodeList = new LimitedNodeList(contextID);
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
        const limitedNodeList = new LimitedNodeList(contextID);
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        expect(limitedNodeList.nodeWithUUID(AUDIO_MIXER_NODE_INFO.uuid) instanceof Node).toBe(true);
    });

    test("Can remove a node with a specific UUID", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
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

    test("Can get a node with a specific local ID", () => {
        const limitedNodeList = new LimitedNodeList(contextID);
        limitedNodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(limitedNodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        expect(limitedNodeList.nodeWithLocalID(AUDIO_MIXER_NODE_INFO.sessionLocalID) instanceof Node).toBe(true);
    });

    test("Can get the string representation of ConnectReason values", () => {
        expect(LimitedNodeList.connectReasonToString(LimitedNodeList.ConnectReason.Awake)).toBe("Awake");
        expect(LimitedNodeList.connectReasonToString(LimitedNodeList.ConnectReason.Connect)).toBe("Connect");
        expect(LimitedNodeList.connectReasonToString(LimitedNodeList.ConnectReason.SilentDomainDisconnect))
            .toBe("SilentDomainDisconnect");
        expect(LimitedNodeList.connectReasonToString(-1)).toBe("Invalid");
        expect(LimitedNodeList.connectReasonToString(27)).toBe("Invalid");
    });

    test("Can set and get domain permissions", (done) => {
        const limitedNodeList = new LimitedNodeList(contextID);
        limitedNodeList.canKickChanged.connect(() => {
            expect(limitedNodeList.getThisNodeCanKick()).toBe(true);
            done();
        });

        expect(limitedNodeList.getThisNodeCanKick()).toBe(false);
        const newPermissions = new NodePermissions();
        newPermissions.permissions = NodePermissions.Permission.canKick;
        limitedNodeList.setPermissions(newPermissions);
    });


    // The following items are tested elsewhere:
    // - sendPacket() - Tested implicitly by NodeList integration test.
    // - sendUnreliablePacket() - Tested implicitly by NodeList integration test.


    warn.mockReset();
    log.mockReset();
});
