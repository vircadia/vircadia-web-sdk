//
//  ZoneEntityItem.unit.test.js
//
//  Created by David Rowe on 12 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ZoneEntityItem from "../../../src/domain/entities/ZoneEntityItem";
import AvatarPriorityMode from "../../../src/domain/shared/AvatarPriorityMode";
import ComponentMode from "../../../src/domain/shared/ComponentMode";
import PropertyFlags from "../../../src/domain/shared/PropertyFlags";
import ShapeType from "../../../src/domain/shared/ShapeType";


describe("ZoneEntityItem - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can read Zone entity data", () => {
        const flagsBufferHex = "ffffc7fff9bfffffffffffff0601ffffffffc0";
        let bufferArray = new Uint8Array(flagsBufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));

        const encodedFlags = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();
        propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

        // eslint-disable-next-line max-len
        const bufferHex = "0200000000004e96906666663f541a483ef50435bf38f82d3f010000003f00004842cdcccc3e16006174703a2f646f6d61696e2f736b79626f782e706e67535e2b16006174703a2f646f6d61696e2f736b79626f782e706e6700007a44809ab3ccb487000000d04101000034430000a0419a99993e0000007a44000048439a99993e6666263f8fc2753f01000000020000000200000002000000020000000200000001000000020000006f458c32c9814d9982b9a9bbc975a3d678000000c81ba80500d46d570b27e6050000b4b0ffffc7fff9bfffffffffffff0601ffffffffc0110000000000000000000000000000000000001000492b08db71064c2e8f6bbdd1e0ab69b2ffff010600536b79626f780100000000000000007c62883d42ba7d3fc291bbc0be3f1c4600401c4600401c465c3fff4064d9a38f0000003f0000003f0000003f000000c81ba8050010006ed73bfb724c4c69942148b74e1caf8aac5007c6384f07c6656807c6f1508746000000000000000000000000000000000001000000";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);

        const zoneEntity = ZoneEntityItem.readEntitySubclassDataFromBuffer(data, 0, propertyFlags);
        expect(zoneEntity.bytesRead).toBe(170);

        const properties = zoneEntity.properties;
        expect(properties.shapeType).toBe(ShapeType.SPHERE);
        expect(properties.compoundShapeURL).toBe("");

        expect(properties.keyLightMode).toBe(ComponentMode.ENABLED);
        expect(properties.keyLight.color).toStrictEqual({ red: 78, green: 150, blue: 144 });
        expect(properties.keyLight.intensity).toBeCloseTo(0.9, 6);
        expect(properties.keyLight.direction.x).toBeCloseTo(0.195413, 6);
        expect(properties.keyLight.direction.y).toBeCloseTo(-0.707107, 6);
        expect(properties.keyLight.direction.z).toBeCloseTo(0.679569, 6);
        expect(properties.keyLight.castShadows).toBe(true);
        expect(properties.keyLight.shadowBias).toBeCloseTo(0.5, 6);
        expect(properties.keyLight.shadowMaxDistance).toBeCloseTo(50.0, 4);

        expect(properties.ambientLightMode).toBe(ComponentMode.ENABLED);
        expect(properties.ambientLight.intensity).toBeCloseTo(0.4, 6);
        expect(properties.ambientLight.url).toBe("atp:/domain/skybox.png");

        expect(properties.skyboxMode).toBe(ComponentMode.ENABLED);
        expect(properties.skybox.color).toStrictEqual({ red: 83, green: 94, blue: 43 });
        expect(properties.skybox.url).toBe("atp:/domain/skybox.png");

        expect(properties.hazeMode).toBe(ComponentMode.ENABLED);
        expect(properties.haze.range).toBeCloseTo(1000, 2);
        expect(properties.haze.color).toStrictEqual({ red: 128, green: 154, blue: 179 });
        expect(properties.haze.enableGlare).toBe(false);
        expect(properties.haze.glareColor).toStrictEqual({ red: 204, green: 180, blue: 135 });
        expect(properties.haze.glareAngle).toBeCloseTo(26.0, 4);
        expect(properties.haze.altitudeEffect).toBe(true);
        expect(properties.haze.base).toBeCloseTo(20.0, 4);
        expect(properties.haze.ceiling).toBeCloseTo(180.0, 2);
        expect(properties.haze.backgroundBlend).toBeCloseTo(0.3, 6);
        expect(properties.haze.attenuateKeyLight).toBe(false);
        expect(properties.haze.keyLightRange).toBeCloseTo(1000, 2);
        expect(properties.haze.keyLightAltitude).toBeCloseTo(200, 3);

        expect(properties.bloomMode).toBe(ComponentMode.ENABLED);
        expect(properties.bloom.intensity).toBeCloseTo(0.3, 6);
        expect(properties.bloom.threshold).toBeCloseTo(0.65, 6);
        expect(properties.bloom.size).toBeCloseTo(0.96, 6);

        expect(properties.flyingAllowed).toBe(true);
        expect(properties.ghostingAllowed).toBe(false);
        expect(properties.filterURL).toBe("");
        expect(properties.avatarPriority).toBe(AvatarPriorityMode.CROWD);
        expect(properties.screenshare).toBe(ComponentMode.ENABLED);
    });

});
