//
//  NodePermissions.unit.test.js
//
//  Created by David Rowe on 11 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodePermissions from "../../../src/domain/networking/NodePermissions";


describe("NodePermissions - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can set and get permission values", () => {
        const nodePermissions = new NodePermissions();
        expect(nodePermissions.permission).toBe(NodePermissions.DEFAULT_AGENT_PERMISSIONS);
        nodePermissions.permissions = 7;
        expect(nodePermissions.permissions).toBe(7);
    });

});
