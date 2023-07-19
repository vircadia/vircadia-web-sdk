//
//  OctreeElement.unit.test.js
//
//  Created by David Rowe on 29 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AppendState } from "../../../src/domain/octree/OctreeElement";


describe("OctreeElement - unit tests", () => {

    test("AppendState values can be accessed", () => {
        expect(AppendState.COMPLETED).toBe(0);
        expect(AppendState.PARTIAL).toBe(1);
        expect(AppendState.NONE).toBe(2);
    });
});
