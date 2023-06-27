//
//  EntityItemProperties.unit.test.js
//
//  Created by David Rowe on 26 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityItemProperties from "../../../src/domain/entities/EntityItemProperties";
import { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";


describe("EntityItemsProperties - unit test", () => {

    test("No changed properties are calculated for empty properties value", () => {
        const properties = {};
        const changedProperties = EntityItemProperties.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(true);
        for (const property in EntityPropertyList) {  // eslint-disable-line
            expect(changedProperties.getHasProperty(EntityPropertyList[property])).toBe(false);
        }
    });

    test("Can calculate top-level changed properties", () => {
        const properties = {
            position: { x: 0, y: 0, z: 0 },
            alpha: 0.5
        };
        const changedProperties = EntityItemProperties.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(false);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_DIMENSIONS)).toBe(false);
    });

});
