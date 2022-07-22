//
//  ImageEntityItem.unit.test.js
//
//  Created by Julien Merzoug on 22 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ImageEntityItem from "../../../src/domain/entities/ImageEntityItem";
import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("ImageEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read image entity data", () => {
        const flagsBufferHex = "fff8ffff37ffffffffffffe03fbc";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "a11aa10000803f000000000000803f0000803f00000000000000005d0068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f54657874757265732f44656661756c74732f496e746572666163652f64656661756c745f696d6167652e6a706701010700000013000000160000002c000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const imageEntity = ImageEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        // TODO: Check for image props.
        expect(imageEntity.bytesRead).toBe(140);
        expect(imageEntity.properties.color.red).toBe(161);
        expect(imageEntity.properties.color.green).toBe(26);
        expect(imageEntity.properties.color.blue).toBe(161);
        expect(imageEntity.properties.alpha).toBe(1);
        expect(imageEntity.properties.imageURL).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Textures/Defaults/Interface/default_image.jpg"
        );
        expect(imageEntity.properties.emissive).toBe(true);
        expect(imageEntity.properties.keepAspectRatio).toBe(true);
        expect(imageEntity.properties.subImage).toStrictEqual({ x: 7, y: 19, width: 19, height: 19 });
    });
});
