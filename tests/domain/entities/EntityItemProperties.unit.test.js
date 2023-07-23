//
//  EntityItemProperties.unit.test.js
//
//  Created by David Rowe on 26 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityItemProperties from "../../../src/domain/entities/EntityItemProperties";
import EntityPropertyFlags, { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";
import { EntityType } from "../../../src/domain/entities/EntityTypes";
import UDT from "../../../src/domain/networking/udt/UDT";
import MessageData from "../../../src/domain/networking/MessageData";
import { AppendState } from "../../../src/domain/octree/OctreeElement";
import Uuid from "../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../testUtils";


describe("EntityItemsProperties - unit test", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("No changed properties are calculated for empty properties value", () => {
        const properties = {};
        const changedProperties = EntityItemProperties.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(true);
        for (const property in EntityPropertyList) {  // eslint-disable-line
            expect(changedProperties.getHasProperty(EntityPropertyList[property])).toBe(false);
        }
    });

    test("Can calculate top-level changed properties", () => {
        const properties = {
            position: { x: 0, y: 0, z: 0 },
            alpha: 0.5
        };
        const changedProperties = EntityItemProperties.getChangedProperties(properties);
        expect(changedProperties.isEmpty()).toBe(false);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_POSITION)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_ALPHA)).toBe(true);
        expect(changedProperties.getHasProperty(EntityPropertyList.PROP_DIMENSIONS)).toBe(false);
    });

    test("Can encode an entity edit with all properties fitting and less than max size property flags", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_MESSAGE = "00b685f1f20a000600b71d53802fcc483393a79a49670175874000fff000020000000000000000401000a82f40b6ee8946ccb50402b88d72a546f02594";

        const properties = {
            lastEdited: 1688896885851574n,  // Date.now() as count of 100ns ticks since the Unix epoch + 44 clock skew.
            lastEditedBy: new Uuid("a82f40b6-ee89-46cc-b504-02b88d72a546"),
            entityType: EntityType.Box,
            color: { red: 240, green: 37, blue: 148 }
        };
        const requestedProperties = EntityItemProperties.getChangedProperties(properties);
        const didntFitProperties = new EntityPropertyFlags();
        const entityID = new Uuid("b71d5380-2fcc-4833-93a7-9a4967017587");

        const messageData = new MessageData();
        messageData.buffer = new Uint8Array(UDT.MAX_PACKET_SIZE);
        messageData.dataPosition = 0;
        messageData.packetSize = UDT.MAX_PACKET_SIZE;

        const appendState = EntityItemProperties.encodeEntityEditPacket(/* PacketTypeValue.EntityEdit, */ entityID,
            properties, messageData, requestedProperties, didntFitProperties);
        expect(appendState).toBe(AppendState.COMPLETED);
        expect(didntFitProperties.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(false);
        expect(didntFitProperties.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(didntFitProperties.isEmpty()).toBe(true);
        expect(buffer2hex(messageData.buffer.slice(0, messageData.dataPosition))).toBe(EXPECTED_MESSAGE);
        expect(messageData.dataPosition).toBe(EXPECTED_MESSAGE.length / 2);
    });

    test("Can encode an entity edit with some properties that didn't fit", () => {
        /* eslint-disable max-len */
        // Full message from previous test:
        //                       "00b685f1f20a000600b71d53802fcc483393a79a49670175874000fff000020000000000000000401000a82f40b6ee8946ccb50402b88d72a546f02594";
        // Partial message without trailing color properties:
        const EXPECTED_MESSAGE = "00b685f1f20a000600b71d53802fcc483393a79a49670175874000fff00000000000000000000040f02594";
        // PROP_LAST_EDITED_BY not written so bit flipped to 0:                                ^
        /* eslint-enable max-len */
        const EXPECTED_MESSAGE_BYTES = EXPECTED_MESSAGE.length / 2;

        const properties = {
            lastEdited: 1688896885851574n,  // Date.now() as count of 100ns ticks since the Unix epoch + 44 clock skew.
            lastEditedBy: new Uuid("a82f40b6-ee89-46cc-b504-02b88d72a546"),
            entityType: EntityType.Box,
            color: { red: 240, green: 37, blue: 148 }
        };
        const requestedProperties = EntityItemProperties.getChangedProperties(properties);
        const didntFitProperties = new EntityPropertyFlags();
        const entityID = new Uuid("b71d5380-2fcc-4833-93a7-9a4967017587");

        const BUFFER_SIZE = EXPECTED_MESSAGE_BYTES + 6 + 2;  // 6 bytes for non-reduced packet flags, 2 bytes extra.
        const messageData = new MessageData();
        messageData.buffer = new Uint8Array(BUFFER_SIZE);
        messageData.dataPosition = 0;
        messageData.packetSize = BUFFER_SIZE;

        const appendState = EntityItemProperties.encodeEntityEditPacket(/* PacketTypeValue.EntityEdit, */ entityID,
            properties, messageData, requestedProperties, didntFitProperties);

        expect(appendState).toBe(AppendState.PARTIAL);
        expect(didntFitProperties.isEmpty()).toBe(false);
        expect(didntFitProperties.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(didntFitProperties.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(false);
        expect(buffer2hex(messageData.buffer.slice(0, messageData.dataPosition))).toBe(EXPECTED_MESSAGE);
        expect(messageData.dataPosition).toBe(EXPECTED_MESSAGE.length / 2);
    });

    test("If no entity properties can fit in the packet then the return value reflects this", () => {

        const properties = {
            lastEdited: 1688896885851574n,  // Date.now() as count of 100ns ticks since the Unix epoch + 44 clock skew.
            lastEditedBy: new Uuid("a82f40b6-ee89-46cc-b504-02b88d72a546"),
            entityType: EntityType.Box,
            color: { red: 240, green: 37, blue: 148 }
        };
        const requestedProperties = EntityItemProperties.getChangedProperties(properties);
        const didntFitProperties = new EntityPropertyFlags();
        const entityID = new Uuid("b71d5380-2fcc-4833-93a7-9a4967017587");

        const BUFFER_SIZE = 48;  // 2 available bytes after property flags.
        const messageData = new MessageData();
        messageData.buffer = new Uint8Array(BUFFER_SIZE);
        messageData.dataPosition = 0;
        messageData.packetSize = BUFFER_SIZE;

        const appendState = EntityItemProperties.encodeEntityEditPacket(/* PacketTypeValue.EntityEdit, */ entityID,
            properties, messageData, requestedProperties, didntFitProperties);

        expect(appendState).toBe(AppendState.NONE);
        expect(didntFitProperties.isEmpty()).toBe(false);
        expect(didntFitProperties.getHasProperty(EntityPropertyList.PROP_LAST_EDITED_BY)).toBe(true);
        expect(didntFitProperties.getHasProperty(EntityPropertyList.PROP_COLOR)).toBe(true);
        expect(messageData.dataPosition).toBe(0);
    });

});
