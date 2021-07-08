//
//  NodeList.unit.test.js
//
//  Created by David Rowe on 20 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainHandler from "../../../src/domain/networking/DomainHandler.js";
import NodesList from "../../../src/domain/networking/NodesList.js";
import NodeType from "../../../src/domain/networking/NodeType";


describe("NodesList - integration tests", () => {

    test("Can get the DomainHandler", () => {
        expect(NodesList.getDomainHandler() instanceof DomainHandler).toBe(true);
    });

    test("Can set and get the nodes interest set", () => {
        expect(NodesList.getNodeInterestSet().size).toBe(0);
        const setOfNodes = new Set([NodeType.EntityServer, NodeType.MessagesMixer]);
        NodesList.addSetOfNodeTypesToNodeInterestSet(setOfNodes);
        expect(NodesList.getNodeInterestSet()).toEqual(setOfNodes);
    });

});
