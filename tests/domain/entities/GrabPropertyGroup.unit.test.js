//
//  GrabPropertyGroup.unit.test.js
//
//  Created by David Rowe on 13 Aug 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags, { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";
import GrabPropertyGroup from "../../../src/domain/entities/GrabPropertyGroup";
import { AppendState } from "../../../src/domain/octree/OctreeElement";

import { buffer2hex } from "../../testUtils";


describe("GrabPropertyGroup - unit test", () => {
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


    // readEntitySubclassDataFromBuffer() is tested in EntityData.unit.test.js.

    test("Can calculate changed properties", () => {
        const properties = {
            position: { x: 0, y: 0, z: 0 },
            grab: {
                grabbable: true,
                triggerable: false,
                grabDelegateToParent: true,
                equippableIndicatorOffset: { x: 0.1, y: 0.2, z: 0.3 }
            }
        };
        const changedProperties = GrabPropertyGroup.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(false);

        // Not GrabPropertyGroup properties...
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(false);

        // GrabPropertyGroup properties...
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_GRAB_GRAB_KINEMATIC)).toBe(false);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE)).toBe(false);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET)).toBe(true);
    });

    test("Can append properties to a buffer", () => {
        entityProperties = {
            grab: {
                grabbable: true,
                triggerable: false,
                grabDelegateToParent: true,
                equippableIndicatorOffset: { x: -4, y: -10.5, z: 1.2 }
            },
            color: { red: 10, green: 20, blue: 30 }
        };

        // Successful write of all.
        setUp(24);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE, true);  // First
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE, true);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT, true);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET, true);  // Last
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);  // Non-grab
        bytesWritten = GrabPropertyGroup.appendToEditPacket(data, 2, entityProperties, packetContext);
        expect(bytesWritten).toBe(15);
        expect(buffer2hex(data.buffer)).toEqual("0000010001000080c0000028c19a99993f00000000000000");
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET))
            .toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET))
            .toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(packetContext.propertyCount).toBe(4);
        expect(packetContext.appendState).toBe(AppendState.COMPLETED);
        expect(errorMessage).toBe("");

        // Successful write of only those that can fit.
        setUp(24);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE, true);  // First
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE, true);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT, true);
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET, true);  // Last
        packetContext.propertiesToWrite.setHasProperty(EntityPropertyList.PROP_COLOR, true);  // Non-grab
        bytesWritten = GrabPropertyGroup.appendToEditPacket(data, 10, entityProperties, packetContext);
        expect(bytesWritten).toBe(3);
        expect(buffer2hex(data.buffer)).toEqual("000000000000000000000100010000000000000000000000");
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT)).toBe(false);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET))
            .toBe(true);
        expect(packetContext.propertiesToWrite.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_GRABBABLE)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_TRIGGERABLE)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_DELEGATE_TO_PARENT)).toBe(true);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET))
            .toBe(false);
        expect(packetContext.propertiesWritten.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(packetContext.propertyCount).toBe(3);
        expect(packetContext.appendState).toBe(AppendState.PARTIAL);
        expect(errorMessage).toBe("");

        tearDown();
    });

});
