//
//  ModelEntityItem.unit.test.js
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags from "../../../src/domain/entities/EntityPropertyFlags";
import ModelEntityItem from "../../../src/domain/entities/ModelEntityItem";
import ShapeType from "../../../src/domain/shared/ShapeType";


describe("ModelEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read model entity data", () => {
        const flagsBufferHex = "fffe3fffcdfffffffffffff8381ffffe";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "000000000000ffffff0000290068747470733a2f2f6d65746176657273652e617369612f617661746172732f6a756c69656e2e676c620000803f0000803f0000803f02000302005e97bcae1bc679dd83b038baecc3a0cd020003020000000041000010410000e040000020410000304100004041000004007b0a7d0a000000010000f041000000000001000000000050c34700";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const modelEntity = ModelEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        expect(modelEntity.bytesRead).toBe(147);
        expect(modelEntity.properties.shapeType).toBe(ShapeType.NONE);
        expect(modelEntity.properties.compoundShapeURL).toBe("");
        expect(modelEntity.properties.color.red).toBe(255);
        expect(modelEntity.properties.color.green).toBe(255);
        expect(modelEntity.properties.color.blue).toBe(255);
        expect(modelEntity.properties.textures).toBe("");
        expect(modelEntity.properties.modelURL).toBe("https://metaverse.asia/avatars/julien.glb");
        expect(modelEntity.properties.modelScale.x).toBeCloseTo(1, 2);
        expect(modelEntity.properties.modelScale.y).toBeCloseTo(1, 2);
        expect(modelEntity.properties.modelScale.z).toBeCloseTo(1, 2);
        expect(modelEntity.properties.jointRotationsSet).toStrictEqual([true, true]);
        expect(modelEntity.properties.jointRotations[0].x).toBeCloseTo(0.18257, 4);
        expect(modelEntity.properties.jointRotations[0].y).toBeCloseTo(0.36513, 4);
        expect(modelEntity.properties.jointRotations[0].z).toBeCloseTo(0.54772, 4);
        expect(modelEntity.properties.jointRotations[0].w).toBeCloseTo(0.73028, 4);
        expect(modelEntity.properties.jointRotations[1].x).toBeCloseTo(0.37901, 4);
        expect(modelEntity.properties.jointRotations[1].y).toBeCloseTo(0.45485, 4);
        expect(modelEntity.properties.jointRotations[1].z).toBeCloseTo(0.53066, 4);
        expect(modelEntity.properties.jointRotations[1].w).toBeCloseTo(0.60646, 4);
        expect(modelEntity.properties.jointTranslationsSet).toStrictEqual([true, true]);
        expect(modelEntity.properties.jointTranslations[0].x).toBe(8);
        expect(modelEntity.properties.jointTranslations[0].y).toBe(9);
        expect(modelEntity.properties.jointTranslations[0].z).toBe(7);
        expect(modelEntity.properties.jointTranslations[1].x).toBe(10);
        expect(modelEntity.properties.jointTranslations[1].y).toBe(11);
        expect(modelEntity.properties.jointTranslations[1].z).toBe(12);
        expect(modelEntity.properties.relayParentJoints).toBe(false);
        expect(modelEntity.properties.groupCulled).toBe(false);
        expect(modelEntity.properties.blendShapeCoefficients).toBe("{\n}\n");
        expect(modelEntity.properties.useOriginalPivot).toBe(false);
        expect(modelEntity.properties.animation.url).toBe("");
        expect(modelEntity.properties.animation.allowTranslation).toBe(true);
        expect(modelEntity.properties.animation.fps).toBeCloseTo(30, 2);
        expect(modelEntity.properties.animation.frameIndex).toBeCloseTo(0, 2);
        expect(modelEntity.properties.animation.playing).toBe(false);
        expect(modelEntity.properties.animation.loop).toBe(true);
        expect(modelEntity.properties.animation.firstFrame).toBeCloseTo(0, 2);
        expect(modelEntity.properties.animation.lastFrame).toBeCloseTo(100000, 2);
        expect(modelEntity.properties.animation.hold).toBe(false);
    });

});
