//
//  ParticleEffectEntityItem.unit.test.js
//
//  Created by David Rowe on 16 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags from "../../../src/domain/entities/EntityPropertyFlags";
import ParticleEffectEntityItem from "../../../src/domain/entities/ParticleEffectEntityItem";
import ShapeType from "../../../src/domain/shared/ShapeType";


describe("ParticleEffectEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read ParticleEffect entity data A", () => {
        const flagsBufferHex = "ffff80000000000000001ffe0ffffffffff8";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "0f0000000000ffffff00000000000000000000803f0000803f0000000000000000600068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f54657874757265732f44656661756c74732f496e746572666163652f64656661756c745f7061727469636c652e706e670a0000000000c03f010000b0400000000000000000ff7fff7fff7fffff0000000000000000000000000000803f00000000db0f4940db0f49c0db0f49400000000000002040000000000000000000000000000000000000803e00000000000000000000c0ff000000000000000000000000000000000000000000000000000000000000000000803f0000c0ff0100000000000000000000c0ff0000c0ff000dcc79affa3f40e9b0194df8e883095118000000c81ba80500b65eeaf956e60500003efff8ffff37ffffffffffffe03fb81100000000000000000000000000000000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const particleEffectEntity = ParticleEffectEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);
        expect(particleEffectEntity.bytesRead).toBe(289);

        const properties = particleEffectEntity.properties;
        expect(properties.shapeType).toBe(ShapeType.ELLIPSOID);
        expect(properties.compoundShapeURL).toBe("");
        expect(properties.color).toStrictEqual({ red: 255, green: 255, blue: 255 });
        expect(properties.alpha).toBe(0);
        expect(properties.textures)
            .toBe("https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Textures/Defaults/Interface/default_particle.png");
        expect(properties.maxParticles).toBe(10);
        expect(properties.lifespan).toBe(1.5);
        expect(properties.isEmitting).toBe(true);
        expect(properties.emitRate).toBeCloseTo(5.5, 5);
        expect(properties.emitSpeed).toBe(0);
        expect(properties.speedSpread).toBe(0);
        expect(properties.emitOrientation.x).toBeCloseTo(0, 4);
        expect(properties.emitOrientation.y).toBeCloseTo(0, 4);
        expect(properties.emitOrientation.z).toBeCloseTo(0, 4);
        expect(properties.emitOrientation.w).toBeCloseTo(1, 4);
        expect(properties.emitDimensions).toStrictEqual({ x: 0, y: 0, z: 0 });
        expect(properties.emitRadiusStart).toBe(1);
        expect(properties.polarStart).toBe(0);
        expect(properties.polarFinish).toBeCloseTo(3.14159, 5);
        expect(properties.azimuthStart).toBeCloseTo(-3.14159, 5);
        expect(properties.azimuthFinish).toBeCloseTo(3.14159, 5);
        expect(properties.emitAcceleration.x).toBeCloseTo(0, 5);
        expect(properties.emitAcceleration.y).toBeCloseTo(2.5, 5);
        expect(properties.emitAcceleration.z).toBeCloseTo(0, 5);
        expect(properties.accelerationSpread).toStrictEqual({ x: 0, y: 0, z: 0 });
        expect(properties.particleRadius).toBeCloseTo(0.25, 5);
        expect(properties.radiusSpread).toBe(0);
        expect(properties.radiusStart).toBe(0);
        expect(properties.radiusFinish).toBe(NaN);
        expect(properties.colorSpread).toStrictEqual({ red: 0, green: 0, blue: 0 });
        expect(properties.colorStart).toStrictEqual({ red: 0, green: 0, blue: 0 });
        expect(properties.colorFinish).toStrictEqual({ red: 0, green: 0, blue: 0 });
        expect(properties.alphaSpread).toBe(0);
        expect(properties.alphaStart).toBe(1);
        expect(properties.alphaFinish).toBe(NaN);
        expect(properties.emitterShouldTrail).toBe(true);
        expect(properties.particleSpin).toBe(0);
        expect(properties.spinSpread).toBe(0);
        expect(properties.spinStart).toBe(NaN);
        expect(properties.spinFinish).toBe(NaN);
        expect(properties.rotateWithEntity).toBe(false);
    });

    test("Can read ParticleEffect entity data B", () => {
        const flagsBufferHex = "ffff80000000000000001ffe0fff7ffffff8";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new EntityPropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "070000000000443e7a0000803f000000000000803f0000803f0000000000000000600068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f4173736574732f54657874757265732f44656661756c74732f496e746572666163652f64656661756c745f7061727469636c652e706e670f000000000000400000c0400000803fcdcc4c3e2daa6da701813af2000000400000803f00004040cdcccc3d713d4a3fc3f5c83f8fc205c06666863f0000003f00000040cdcccc3dcdcccc3dcdcc4c3ecdcc4c3d0000803ecdcccc3dcdcccc3dcdcc4c3e14050a00002b430000544200002b430000ee420000284300001243cdcccc3dcdcc4c3e00000000000000e03fec51b83d7b142e3eb81e053f010dcc79affa3f40e9b0194df8e883095118000000c81ba80500b65eeaf956e60500003efff8ffff37ffffffffffffe03fb81100000000000000000000000000000000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const particleEffectEntity = ParticleEffectEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);
        expect(particleEffectEntity.bytesRead).toBe(288);

        const properties = particleEffectEntity.properties;
        expect(properties.shapeType).toBe(ShapeType.CYLINDER_Y);
        expect(properties.compoundShapeURL).toBe("");
        expect(properties.color).toStrictEqual({ red: 68, green: 62, blue: 122 });
        expect(properties.alpha).toBe(1);
        expect(properties.textures)
            .toBe("https://cdn-1.vircadia.com/us-e-1/Bazaar/Assets/Textures/Defaults/Interface/default_particle.png");
        expect(properties.maxParticles).toBe(15);
        expect(properties.lifespan).toBe(2.0);
        expect(properties.isEmitting).toBeUndefined();
        expect(properties.emitRate).toBe(6.0);
        expect(properties.emitSpeed).toBe(1);
        expect(properties.speedSpread).toBeCloseTo(0.2, 5);
        expect(properties.emitOrientation.x).toBeCloseTo(0.329527, 4);
        expect(properties.emitOrientation.y).toBeCloseTo(0.308042, 4);
        expect(properties.emitOrientation.z).toBeCloseTo(0.00785859, 4);
        expect(properties.emitOrientation.w).toBeCloseTo(0.892447, 4);
        expect(properties.emitDimensions).toStrictEqual({ x: 2, y: 1, z: 3 });
        expect(properties.emitRadiusStart).toBeCloseTo(0.1, 6);
        expect(properties.polarStart).toBeCloseTo(0.79, 2);
        expect(properties.polarFinish).toBeCloseTo(1.57, 2);
        expect(properties.azimuthStart).toBeCloseTo(-2.09, 2);
        expect(properties.azimuthFinish).toBeCloseTo(1.05, 2);
        expect(properties.emitAcceleration.x).toBeCloseTo(0.5, 5);
        expect(properties.emitAcceleration.y).toBeCloseTo(2.0, 5);
        expect(properties.emitAcceleration.z).toBeCloseTo(0.1, 5);
        expect(properties.accelerationSpread.x).toBeCloseTo(0.1, 5);
        expect(properties.accelerationSpread.y).toBeCloseTo(0.2, 5);
        expect(properties.accelerationSpread.z).toBeCloseTo(0.05, 5);
        expect(properties.particleRadius).toBeCloseTo(0.25, 5);
        expect(properties.radiusSpread).toBeCloseTo(0.1, 5);
        expect(properties.radiusStart).toBeCloseTo(0.1, 5);
        expect(properties.radiusFinish).toBeCloseTo(0.2, 5);
        expect(properties.colorSpread).toStrictEqual({ red: 20, green: 5, blue: 10 });
        expect(properties.colorStart).toStrictEqual({ red: 171, green: 53, blue: 171 });
        expect(properties.colorFinish).toStrictEqual({ red: 119, green: 168, blue: 146 });
        expect(properties.alphaSpread).toBeCloseTo(0.1, 5);
        expect(properties.alphaStart).toBeCloseTo(0.2);
        expect(properties.alphaFinish).toBe(0);
        expect(properties.emitterShouldTrail).toBe(false);
        expect(properties.particleSpin).toBeCloseTo(1.75, 5);
        expect(properties.spinSpread).toBeCloseTo(0.09, 5);
        expect(properties.spinStart).toBeCloseTo(0.17, 5);
        expect(properties.spinFinish).toBeCloseTo(0.52, 5);
        expect(properties.rotateWithEntity).toBe(true);
    });

});
