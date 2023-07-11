//
//  LightEntityItem.unit.test.js
//
//  Created by David Rowe on 2 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags from "../../../src/domain/entities/EntityPropertyFlags";
import LightEntityItem from "../../../src/domain/entities/LightEntityItem";


describe("LightEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read Light entity data", () => {
        const flagsBufferHex = "fff8ffff37ffffffffffffe0203e";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "704c8c01000090406666663f000096429a99993f5a090fe88bbe4893badf17f8c757b46940000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const lightEntity = LightEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        expect(lightEntity.bytesRead).toBe(20);
        expect(lightEntity.properties.color.red).toBe(112);
        expect(lightEntity.properties.color.green).toBe(76);
        expect(lightEntity.properties.color.blue).toBe(140);
        expect(lightEntity.properties.intensity).toBe(4.5);
        expect(lightEntity.properties.falloffRadius).toBeCloseTo(1.2, 4);
        expect(lightEntity.properties.isSpotlight).toBe(true);
        expect(lightEntity.properties.exponent).toBeCloseTo(0.9, 4);
        expect(lightEntity.properties.cutoff).toBeCloseTo(75.0, 4);
    });

});
