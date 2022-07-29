//
//  Node.unit.test.js
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HMACAuth from "../../../src/domain/networking/HMACAuth";
import Node from "../../../src/domain/networking/Node";
import NodePermissions from "../../../src/domain/networking/NodePermissions";
import NodeType from "../../../src/domain/networking/NodeType";
import SockAddr from "../../../src/domain/networking/SockAddr";
import Uuid from "../../../src/domain/shared/Uuid";


describe("Node - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    const TEST_NODE_TYPE = NodeType.AudioMixer;
    const TEST_UUID = new Uuid(1234n);
    const IP_127_0_0_1 = 127 * 2 ** 24 + 1;  // 127.0.0.1
    const TEST_PUBLIC_PORT = 40102;
    const TEST_LOCAL_PORT = 40103;
    const TEST_PUBLIC_SOCKET = new SockAddr();
    TEST_PUBLIC_SOCKET.setAddress(IP_127_0_0_1);
    TEST_PUBLIC_SOCKET.setPort(TEST_PUBLIC_PORT);
    const TEST_LOCAL_SOCKET = new SockAddr();
    TEST_LOCAL_SOCKET.setAddress(IP_127_0_0_1);
    TEST_LOCAL_SOCKET.setPort(TEST_LOCAL_PORT);

    test("Can get and set the node's type", () => {
        const node = new Node(TEST_UUID, TEST_NODE_TYPE, TEST_PUBLIC_SOCKET, TEST_LOCAL_SOCKET);
        expect(node.getType()).toBe(TEST_NODE_TYPE);
        let nodeTypeObjectName = NodeType.getNodeTypeName(TEST_NODE_TYPE);
        expect(node.getPublicSocket().objectName()).toBe(nodeTypeObjectName);
        expect(node.getLocalSocket().objectName()).toBe(nodeTypeObjectName);
        node.setType(NodeType.EntityServer);
        expect(node.getType()).toBe(NodeType.EntityServer);
        nodeTypeObjectName = NodeType.getNodeTypeName(NodeType.EntityServer);
        expect(node.getPublicSocket().objectName()).toBe(nodeTypeObjectName);
        expect(node.getLocalSocket().objectName()).toBe(nodeTypeObjectName);
    });

    test("Can get and set node permissions values", () => {
        const node = new Node(TEST_UUID, TEST_NODE_TYPE, TEST_PUBLIC_SOCKET, TEST_LOCAL_SOCKET);
        let nodePermissions = node.getPermissions();
        expect(nodePermissions instanceof NodePermissions).toBe(true);
        expect(nodePermissions.permissions).toBe(0);
        const newNodePermissions = new NodePermissions();
        newNodePermissions.permissions = 7;
        node.setPermissions(newNodePermissions);
        nodePermissions = node.getPermissions();
        expect(nodePermissions.permissions).toBe(7);
    });

    test("Can get and set connection secret values", () => {
        const node = new Node(TEST_UUID, TEST_NODE_TYPE, TEST_PUBLIC_SOCKET, TEST_LOCAL_SOCKET);
        expect(node.getConnectionSecret().valueOf()).toBe(Uuid.NULL);
        node.setConnectionSecret(new Uuid(1234n));
        expect(node.getConnectionSecret().valueOf()).toBe(1234n);
    });

    test("Can get the HMACAuth object", () => {
        const node = new Node(TEST_UUID, TEST_NODE_TYPE, TEST_PUBLIC_SOCKET, TEST_LOCAL_SOCKET);
        expect(node.getAuthenticateHash()).toBeNull();
        node.setConnectionSecret(new Uuid(1234n));
        expect(node.getAuthenticateHash() instanceof HMACAuth).toBe(true);
    });

    test("Can get and set node is replicated values", () => {
        const node = new Node(TEST_UUID, TEST_NODE_TYPE, TEST_PUBLIC_SOCKET, TEST_LOCAL_SOCKET);
        expect(node.getIsReplicated()).toBe(false);
        node.setIsReplicated(true);
        expect(node.getIsReplicated()).toBe(true);
    });

    test("Can get and set node is upstream values", () => {
        const node = new Node(TEST_UUID, TEST_NODE_TYPE, TEST_PUBLIC_SOCKET, TEST_LOCAL_SOCKET);
        expect(node.getIsUpstream()).toBe(false);
        node.setIsUpstream(true);
        expect(node.getIsUpstream()).toBe(true);
    });

});
