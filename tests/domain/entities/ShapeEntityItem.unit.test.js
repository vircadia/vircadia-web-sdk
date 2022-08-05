//
//  ShapeEntityItem.unit.test.js
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ShapeEntityItem from "../../../src/domain/entities/ShapeEntityItem";
import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("ShapeEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read shape entity data", () => {
        const flagsBufferHex = "fff8ffff37ffffffffffffe03fa0";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        const bufferHex = "00b4ef0000803f000000000000803f0000803f00000000000000000800547269616e676c65";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const shapeEntity = ShapeEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        expect(shapeEntity.bytesRead).toBe(37);
        expect(shapeEntity.properties.color.red).toBe(0);
        expect(shapeEntity.properties.color.green).toBe(180);
        expect(shapeEntity.properties.color.blue).toBe(239);
        expect(shapeEntity.properties.alpha).toBe(1);
        expect(shapeEntity.properties.shape).toBe("Triangle");
    });

});
