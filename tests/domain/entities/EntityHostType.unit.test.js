//
//  EntityHostType.unit.test.js
//
//  Created by David Rowe on 19 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityHostType } from "../../../src/domain/entities/EntityHostType";

describe("EntityHostType - unit tests", () => {

    test("Can get entity host types", () => {
        expect(EntityHostType.DOMAIN).toBe(0);
        expect(EntityHostType.LOCAL).toBe(1);
        expect(EntityHostType.AVATAR).toBe(2);
    });

});
