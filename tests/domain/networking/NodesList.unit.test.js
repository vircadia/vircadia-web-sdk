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
import NodesList from "../../../src/domain/networking/NodesList";
import NodeType from "../../../src/domain/networking/NodeType";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("NodesList - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);  // Required by NodesList.
    ContextManager.set(contextID, NodesList, contextID);
    const nodesList = ContextManager.get(contextID, NodesList);


    test("Can get the DomainHandler", () => {
        expect(nodesList.getDomainHandler() instanceof DomainHandler).toBe(true);
    });

    test("Can set and get the nodes interest set", () => {
        expect(nodesList.getNodeInterestSet().size).toBe(0);
        const setOfNodes = new Set([NodeType.EntityServer, NodeType.MessagesMixer]);
        nodesList.addSetOfNodeTypesToNodeInterestSet(setOfNodes);
        expect(nodesList.getNodeInterestSet()).toEqual(setOfNodes);
    });

    test("Can reset an empty nodes list as if initiated by DomainHandler", () => {
        nodesList.reset("Some reason", true);
        expect(true).toBe(true);
    });

});
