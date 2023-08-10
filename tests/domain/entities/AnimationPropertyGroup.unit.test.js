//
//  AnimationPropertyGroup.unit.test.js
//
//  Created by David Rowe on 2 Aug 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AnimationPropertyGroup from "../../../src/domain/entities/AnimationPropertyGroup";
import EntityPropertyFlags, { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";
import { AppendState } from "../../../src/domain/octree/OctreeElement";

import { buffer2hex } from "../../testUtils";


describe("AnimationPropertyGroup - unit test", () => {
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
            animation: {
                url: "http://foo.com/bar.fbx",
                hold: true
            }
        };
        const changedProperties = AnimationPropertyGroup.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(false);

        // Not AnimationPropertyGroup properties...
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);

        // AnimationPropertyGroup properties...
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)).toBe(false);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)).toBe(true);
    });

    test("Can append properties to a buffer", () => {
        entityProperties = {
            animation: {
                url: "abcd",
                loop: true,
                hold: true
            },
            color: { red: 10, green: 20, blue: 30 }
        };

        // Successful write of all.
        setUp(16);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ANIMATION_URL, true);  // First
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP, true);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD, true);  // Last
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);  // Non-animation
        bytesWritten = AnimationPropertyGroup.appendToEditPacket(data, 2, entityProperties, packetContext);
        expect(bytesWritten).toBe(8);
        expect(buffer2hex(data.buffer)).toEqual("00000400616263640101000000000000");
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(packetContext.propertyCount).toBe(3);
        expect(packetContext.appendState).toBe(AppendState.COMPLETED);
        expect(errorMessage).toBe("");

        // Successful write of only those that can fit.
        setUp(16);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ANIMATION_URL, true);  // First
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP, true);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD, true);  // Last
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);  // Non-animation
        bytesWritten = AnimationPropertyGroup.appendToEditPacket(data, 11, entityProperties, packetContext);
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(data.buffer)).toEqual("00000000000000000000000101000000");
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)).toBe(true);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ANIMATION_URL)).toBe(false);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ANIMATION_LOOP)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_ANIMATION_HOLD)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(packetContext.propertyCount).toBe(2);
        expect(packetContext.appendState).toBe(AppendState.PARTIAL);
        expect(errorMessage).toBe("");

        tearDown();
    });

});
