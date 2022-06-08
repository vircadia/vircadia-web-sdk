//
//  PropertyFlags.unit.test.js
//
//  Created by Julien Merzoug on 06 June 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("EntityData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can set property flags", () => {
        const propertyFlags = new PropertyFlags();

        // Set 1st bit.
        propertyFlags.setHasProperty(0, true);
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([1]));

        // Set 2nd bit.
        propertyFlags.setHasProperty(1, true);
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([3]));

        // Set 9th bit.
        propertyFlags.setHasProperty(8, true);
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([3, 1]));

        // Clear 1st bit.
        propertyFlags.setHasProperty(0, false);
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([2, 1]));

        // Clear 2nd bit.
        propertyFlags.setHasProperty(1, false);
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([0, 1]));

    });

    test("Can get property flags", () => {
        const propertyFlags = new PropertyFlags();

        propertyFlags.setHasProperty(0, true);
        expect(propertyFlags.getHasProperty(0)).toBe(true);

        propertyFlags.setHasProperty(0, false);
        expect(propertyFlags.getHasProperty(0)).toBe(false);

        propertyFlags.setHasProperty(8, true);
        expect(propertyFlags.getHasProperty(8)).toBe(true);

    });

    test("Can decoded property flags", () => {
        const bufferHex = "fffe3fffcdfffffffffffff8381ffffe11000000000000000000000000000000";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([]));

        const bytesConsumed = propertyFlags.decode(data, 32, 0);

        expect(bytesConsumed).toBe(16);
        expect(propertyFlags.flags).toStrictEqual(new Uint8Array([252, 255, 179, 255, 255, 255, 255, 255, 255, 31, 28, 248, 255, 127]));

    });
});
