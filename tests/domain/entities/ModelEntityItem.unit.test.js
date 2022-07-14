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

import ModelEntityItem from "../../../src/domain/entities/ModelEntityItem";
import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("ModelEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read model entity data", () => {
        const flagsBufferHex = "fffe3fffcdfffffffffffff8381ffffe";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "000000000000ffffff0000600068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f4d6f64656c732f466f6f642f62697274686461795f63616b652f676c74662f62697274686461795f63616b652e676c620000803f0000803f0000803f0000000000000000000004007b0a7d0a010000000000f041000000000001000000000050c34700";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const modelEntity = ModelEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);

        expect(modelEntity.bytesRead).toBe(160);
        expect(modelEntity.properties.shapeType).toBe(0);
        expect(modelEntity.properties.compoundShapeUrl).toBeUndefined();
        expect(modelEntity.properties.color.red).toBe(255);
        expect(modelEntity.properties.color.green).toBe(255);
        expect(modelEntity.properties.color.blue).toBe(255);
        expect(modelEntity.properties.textures).toBeUndefined();
        expect(modelEntity.properties.modelURL).toBe(
            "https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Models/Food/birthday_cake/gltf/birthday_cake.glb"
        );
        expect(modelEntity.properties.modelScale.x).toBeCloseTo(1, 2);
        expect(modelEntity.properties.modelScale.y).toBeCloseTo(1, 2);
        expect(modelEntity.properties.modelScale.z).toBeCloseTo(1, 2);
        expect(modelEntity.properties.jointRotationsSet).toBeUndefined();
        expect(modelEntity.properties.jointRotations).toBeUndefined();
        expect(modelEntity.properties.jointTranslationsSet).toBeUndefined();
        expect(modelEntity.properties.jointTranslations).toBeUndefined();
        expect(modelEntity.properties.relayParentJoints).toBe(false);
        expect(modelEntity.properties.groupCulled).toBe(false);
        expect(modelEntity.properties.blendShapeCoefficients).toBe("{\n}\n");
        expect(modelEntity.properties.useOriginalPivot).toBe(true);
        expect(modelEntity.properties.animation.animationUrl).toBeUndefined();
        expect(modelEntity.properties.animation.animationAllowTranslation).toBe(false);
        expect(modelEntity.properties.animation.animationFPS).toBeCloseTo(30, 2);
        expect(modelEntity.properties.animation.animationFrameIndex).toBeCloseTo(0, 2);
        expect(modelEntity.properties.animation.animationPlaying).toBe(false);
        expect(modelEntity.properties.animation.animationLoop).toBe(true);
        expect(modelEntity.properties.animation.animationFirstFrame).toBeCloseTo(0, 2);
        expect(modelEntity.properties.animation.animationLastFrame).toBeCloseTo(100000, 2);
        expect(modelEntity.properties.animation.animationHold).toBe(false);
    });

});
