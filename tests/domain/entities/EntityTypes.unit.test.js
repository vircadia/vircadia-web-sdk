//
//  EntityTypes.unit.test.js
//
//  Created by David Rowe on 19 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityType } from "../../../src/domain/entities/EntityTypes";

describe("EntityTypes - unit tests", () => {

    test("Can get entity types", () => {
        expect(EntityType.Unknown).toBe(0);
        expect(EntityType.Box).toBe(1);
        expect(EntityType.NUM_TYPES).toBe(17);  // eslint-disable-line @typescript-eslint/no-magic-numbers
    });

});
