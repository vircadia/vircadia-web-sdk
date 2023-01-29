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
        expect(nodePermissions.permissions).toBe(NodePermissions.Permission.none);
        nodePermissions.permissions = 7;
        expect(nodePermissions.permissions).toBe(7);
    });

    test("Can get permission constants", () => {
        expect(NodePermissions.Permission.none).toBe(0);
        expect(NodePermissions.Permission.canKick).toBe(64);
        expect(NodePermissions.Permission.canRezAvatarEntities).toBe(2048);
    });

    test("Can set and get permissions", () => {
        const nodePermissions = new NodePermissions();
        nodePermissions.permissions = NodePermissions.Permission.canAdjustLocks
            | NodePermissions.Permission.canConnectPastMaxCapacity;
        expect(nodePermissions.can(NodePermissions.Permission.canAdjustLocks)).toBe(true);
        expect(nodePermissions.can(NodePermissions.Permission.canConnectPastMaxCapacity)).toBe(true);
        expect(nodePermissions.can(NodePermissions.Permission.canConnectToDomain)).toBe(false);
        expect(nodePermissions.can(NodePermissions.Permission.canRezAvatarEntities)).toBe(false);
    });

});
