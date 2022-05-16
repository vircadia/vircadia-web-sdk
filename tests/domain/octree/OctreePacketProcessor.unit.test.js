//
//  OctreePacketProcessor.unit.test.js
//
//  Created by Julien Merzoug on 12 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import ContextManager from "../../../src/domain/shared/ContextManager";
import NodeList from "../../../src/domain/networking/NodeList";
import OctreePacketProcessor from "../../../src/domain/octree/OctreePacketProcessor";


describe("OctreePacketProcessor - unit tests", () => {

    test("The OctreePacketProcessor can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, OctreePacketProcessor, contextID);
        const octreePacketProcessor = ContextManager.get(contextID, OctreePacketProcessor);
        expect(octreePacketProcessor instanceof OctreePacketProcessor).toBe(true);
    });
});
