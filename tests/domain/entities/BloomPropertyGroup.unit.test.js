//
//  BloomPropertyGroup.unit.test.js
//
//  Created by David Rowe on 10 Aug 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags, { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";
import BloomPropertyGroup from "../../../src/domain/entities/BloomPropertyGroup";
import { AppendState } from "../../../src/domain/octree/OctreeElement";

import { buffer2hex } from "../../testUtils";


describe("BloomPropertyGroup - unit test", () => {
    /*
        eslint-disable
        @typescript-eslint/no-magic-numbers,
        @typescript-eslint/no-unsafe-member-access,
        @typescript-eslint/no-unsafe-call
    */

    let entityProperties = null;
    let errorMessage = null;
    let error = null;
    let data = null;
    let bytesWritten = null;
    let packetContext = null;

    function setUp(bufferLength) {
        errorMessage = "";
        error = jest.spyOn(console, "error").mockImplementation((...message) => {
            errorMessage = message.join(" ");
        });

        data = new DataView(new ArrayBuffer(bufferLength));
        packetContext = {
            propertiesToWrite: new EntityPropertyFlags(),
            propertiesWritten: new EntityPropertyFlags(),
            propertyCount: 0,
            appendState: AppendState.COMPLETED
        };
    }

    function tearDown() {
        error.mockRestore();
    }


    test("Can calculate changed properties", () => {
        const properties = {
            position: { x: 0, y: 0, z: 0 },
            bloom: {
                intensity: 0.5,
                size: 1.0
            }
        };
        const changedProperties = BloomPropertyGroup.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(false);

        // Not BloomPropertyGroup properties...
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);

        // BloomPropertyGroup properties...
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_BLOOM_THRESHOLD)).toBe(false);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)).toBe(true);
    });

    test("Can append properties to a buffer", () => {
        entityProperties = {
            bloom: {
                intensity: 1250,
                size: 15
            },
            color: { red: 10, green: 20, blue: 30 }
        };

        // Successful write of all.
        setUp(16);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY, true);  // First
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_BLOOM_SIZE, true);  // Last
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);  // Non-keyLight
        bytesWritten = BloomPropertyGroup.appendToEditPacket(data, 2, entityProperties, packetContext);
        expect(bytesWritten).toBe(8);
        expect(buffer2hex(data.buffer)).toEqual("000000409c4400007041000000000000");
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(packetContext.propertyCount).toBe(2);
        expect(packetContext.appendState).toBe(AppendState.COMPLETED);
        expect(errorMessage).toBe("");

        // Successful write of only those that can fit.
        setUp(16);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY, true);  // First
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_BLOOM_SIZE, true);  // Last
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);  // Non-keyLight
        bytesWritten = BloomPropertyGroup.appendToEditPacket(data, 9, entityProperties, packetContext);
        expect(bytesWritten).toBe(4);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000409c44000000");
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)).toBe(true);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_BLOOM_INTENSITY)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_BLOOM_SIZE)).toBe(false);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(packetContext.propertyCount).toBe(1);
        expect(packetContext.appendState).toBe(AppendState.PARTIAL);
        expect(errorMessage).toBe("");

        tearDown();
    });

});
