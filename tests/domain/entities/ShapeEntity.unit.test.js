//
//  ShapeEntity.unit.test.js
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ShapeEntity from "../../../src/domain/entities/ShapeEntity";
import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("ShapeEntity - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read shape entity data", () => {
        const flagsBufferHex = "fff8ffff37ffffffffffffe03fa0";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "00b4ef0000803f000000000000803f0000803f00000000000000000800547269616e676c65";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const shapeEntity = ShapeEntity.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        expect(shapeEntity.bytesRead).toBe(37);
        expect(shapeEntity.properties.color.red).toBeCloseTo(0, 2);
        expect(shapeEntity.properties.color.green).toBeCloseTo(180, 2);
        expect(shapeEntity.properties.color.blue).toBeCloseTo(239, 2);
        expect(shapeEntity.properties.alpha).toBe(1);
        expect(shapeEntity.properties.pulse).toStrictEqual({ min: 0, max: 1, period: 1, colorMode: "none", alphaMode: "none" });

    });

});
