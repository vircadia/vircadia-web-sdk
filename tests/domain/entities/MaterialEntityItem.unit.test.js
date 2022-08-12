//
//  MaterialEntityItem.unit.test.js
//
//  Created by David Rowe on 11 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import MaterialEntityItem from "../../../src/domain/entities/MaterialEntityItem";
import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("MaterialEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read Material entity data", () => {
        const flagsBufferHex = "fffc7fff9bfffffffffffff0001ff0";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "0c006d6174657269616c44617461000000000200010030cdcccc3dcdcc4c3ecdcc4c3f6666663f0000404126007b226d6174657269616c73223a7b22616c6265646f223a5b302e392c302e382c302e315d7d7d01d166d1e5799644c4ab3b53fb22bbacea20027dea3dfee50500a34a6f42fee505000000fff8ffff37ffffffffffffe03fa0110000000000000000000000000000000000000000ffff010000000000000000000000df08894199d47d3f384e86419a99193f9a99193f9a99193fff7fff7fff7fffff";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const materialEntity = MaterialEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);
        expect(materialEntity.bytesRead).toBe(84);
        expect(materialEntity.properties.materialURL).toBe("materialData");
        expect(materialEntity.properties.materialMappingMode).toBe(0);
        expect(materialEntity.properties.priority).toBe(2);
        expect(materialEntity.properties.parentMaterialName).toBe("0");
        expect(materialEntity.properties.materialMappingPos.x).toBeCloseTo(0.1, 6);
        expect(materialEntity.properties.materialMappingPos.y).toBeCloseTo(0.2, 6);
        expect(materialEntity.properties.materialMappingScale.x).toBeCloseTo(0.8, 6);
        expect(materialEntity.properties.materialMappingScale.y).toBeCloseTo(0.9, 6);
        expect(materialEntity.properties.materialMappingRot).toBe(12);
        expect(materialEntity.properties.materialData).toBe("{\"materials\":{\"albedo\":[0.9,0.8,0.1]}}");
        expect(materialEntity.properties.materialRepeat).toBe(true);
    });

});
