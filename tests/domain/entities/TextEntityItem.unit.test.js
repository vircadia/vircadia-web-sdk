//
//  TextEntityItem.unit.test.js
//
//  Created by Julien Merzoug on 22 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags from "../../../src/domain/entities/EntityPropertyFlags";
import TextEntityItem, { TextAlignment, TextEffect } from "../../../src/domain/entities/TextEntityItem";


describe("TextEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read text entity data", () => {
        const flagsBufferHex = "fffe3fffcdfffffffffffff803effff0";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "000000000000803f0000803f0000000000000000050048656c6c6f8fc2753db81db8e17a543f0000008fc2753f8fc2f53c8fc2753dcdcccc3d0ad7a33d010600526f626f746f01000000785978cdcc4c3e00000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const textEntity = TextEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        expect(textEntity.bytesRead).toBe(85);
        expect(textEntity.properties.text).toBe("Hello");
        expect(textEntity.properties.lineHeight).toBeCloseTo(0.0599, 3);
        expect(textEntity.properties.textEffectColor.red).toBe(120);
        expect(textEntity.properties.textEffectColor.green).toBe(89);
        expect(textEntity.properties.textEffectColor.blue).toBe(120);
        expect(textEntity.properties.textAlpha).toBeCloseTo(0.829, 2);
        expect(textEntity.properties.backgroundAlpha).toBeCloseTo(0.959, 2);
        expect(textEntity.properties.backgroundColor.red).toBe(0);
        expect(textEntity.properties.backgroundColor.green).toBe(0);
        expect(textEntity.properties.backgroundColor.blue).toBe(0);
        expect(textEntity.properties.leftMargin).toBeCloseTo(0.029, 2);
        expect(textEntity.properties.rightMargin).toBeCloseTo(0.059, 2);
        expect(textEntity.properties.topMargin).toBeCloseTo(0.100, 2);
        expect(textEntity.properties.bottomMargin).toBeCloseTo(0.079, 2);
        expect(textEntity.properties.unlit).toBe(true);
        expect(textEntity.properties.font).toBe("Roboto");
        expect(textEntity.properties.textEffect).toBe("outline");
        expect(textEntity.properties.textColor.red).toBe(184);
        expect(textEntity.properties.textColor.green).toBe(29);
        expect(textEntity.properties.textColor.blue).toBe(184);
        expect(textEntity.properties.textEffectThickness).toBeCloseTo(0.200, 2);
        expect(textEntity.properties.textAlignment).toBe("left");
    });

    test("Can get the index of a TextAlignment value", () => {
        expect(Object.values(TextAlignment).indexOf("left")).toBe(0);
        expect(Object.values(TextAlignment).indexOf("center")).toBe(1);
        expect(Object.values(TextAlignment).indexOf("right")).toBe(2);
    });

    test("Can get the index of a TextEffect value", () => {
        expect(Object.values(TextEffect).indexOf("none")).toBe(0);
        expect(Object.values(TextEffect).indexOf("outline")).toBe(1);
        expect(Object.values(TextEffect).indexOf("outline fill")).toBe(2);
        expect(Object.values(TextEffect).indexOf("shadow")).toBe(3);
    });

});
