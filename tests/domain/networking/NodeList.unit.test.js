//
//  NodeList.unit.test.js
//
//  Created by David Rowe on 20 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import DomainHandler from "../../../src/domain/networking/DomainHandler";
import Node from "../../../src/domain/networking/Node";
import NodePermissions from "../../../src/domain/networking/NodePermissions";
import NodeList from "../../../src/domain/networking/NodeList";
import NodeType from "../../../src/domain/networking/NodeType";
import SockAddr from "../../../src/domain/networking/SockAddr";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Uuid from "../../../src/domain/shared/Uuid";


describe("NodeList - integration tests", () => {

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

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);  // Required by NodeList.
    ContextManager.set(contextID, NodeList, contextID);
    const nodeList = ContextManager.get(contextID, NodeList);

    // Suppress console messages from being displayed.
    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => { /* no-op */ });


    test("Can get the DomainHandler", () => {
        expect(nodeList.getDomainHandler() instanceof DomainHandler).toBe(true);
    });

    test("Can set and get the nodes interest set", () => {
        expect(nodeList.getNodeInterestSet().size).toBe(0);
        const setOfNodes = new Set([NodeType.EntityServer, NodeType.MessagesMixer]);
        nodeList.addSetOfNodeTypesToNodeInterestSet(setOfNodes);
        expect(nodeList.getNodeInterestSet()).toEqual(setOfNodes);
    });

    test("Can reset the nodes list", () => {
        nodeList.addOrUpdateNode(AUDIO_MIXER_NODE_INFO.uuid, AUDIO_MIXER_NODE_INFO.type,
            AUDIO_MIXER_NODE_INFO.publicSocket, AUDIO_MIXER_NODE_INFO.localSocket, AUDIO_MIXER_NODE_INFO.sessionLocalID,
            AUDIO_MIXER_NODE_INFO.isReplicated, AUDIO_MIXER_NODE_INFO.isUpstream, AUDIO_MIXER_NODE_INFO.connectionSecretUUID,
            AUDIO_MIXER_NODE_INFO.permissions
        );
        expect(nodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type) instanceof Node).toBe(true);
        // Reset the nodes list.
        nodeList.reset("Some reason");
        expect(nodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type)).toBeNull();
        // Resetting again is OK.
        nodeList.reset("Some reason");
        expect(nodeList.soloNodeOfType(AUDIO_MIXER_NODE_INFO.type)).toBeNull();
    });


    warn.mockReset();
    log.mockReset();
});
