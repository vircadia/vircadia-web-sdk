//
//  EntityPropertyFlags.unit.test.js
//
//  Created by David Rowe on 27 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityPropertyFlags, EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";

describe("EntityPropertyFlags - unit test", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can access EntityPRopertyList values", () => {
        expect(EntityPropertyList.PROP_PAGED_PROPERTY).toBe(0);
        expect(EntityPropertyList.PROP_DERIVED_34).toBe(126);
        expect(EntityPropertyList.PROP_AFTER_LAST_ITEM).toBe(127);
        expect(EntityPropertyList.PROP_MAX_PARTICLES).toBe(92);
        expect(EntityPropertyList.PROP_MINOR_TICK_MARKS_COLOR).toBe(110);
    });

    test("Can use EntityPropertyFlags", () => {
        const entityPropertyFlags = new EntityPropertyFlags();
        expect(entityPropertyFlags.isEmpty()).toBe(true);
        expect(entityPropertyFlags.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);
        entityPropertyFlags.setHasProperty(EntityPropertyList.PROP_POSITION, true);
        expect(entityPropertyFlags.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(entityPropertyFlags.isEmpty()).toBe(false);
        entityPropertyFlags.setHasProperty(EntityPropertyList.PROP_POSITION, false);
        expect(entityPropertyFlags.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);
        expect(entityPropertyFlags.isEmpty()).toBe(false);  // Length isn't reset.
    });

});
