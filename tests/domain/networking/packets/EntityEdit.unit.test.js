//
//  EntityEdit.unit.test.js
//
//  Created by David Rowe on 23 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityItemProperties from "../../../../src/domain/entities/EntityItemProperties";
import EntityPropertyFlags from "../../../../src/domain/entities/EntityPropertyFlags";
import { EntityType } from "../../../../src/domain/entities/EntityTypes";
import EntityEdit from "../../../../src/domain/networking/packets/EntityEdit";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";
import NLPacket from "../../../../src/domain/networking/NLPacket";
import Uuid from "../../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../../testUtils";


describe("EntityEdit - unit tests", () => {

    test("Can write an EntityEdit packet that changes top-level properties", () => {
        /* eslint-disable @typescript-eslint/no-magic-numbers, max-len */

        // From C++ with 2-byte octcode:
        /*
        const EXPECTED_PACKET = "000000002d8500000000000000000000000000000000000000006089f1f20a0006000100b685f1f20a000600b71d53802fcc483393a79a49670175874000fff000020000000000000000401000a82f40b6ee8946ccb50402b88d72a546f02594";
        // With 2-byte octcode replaced with 1-byte 0x00 empty octcode:                              ^^^^
        // With low-order digits of timestamp zeroed out:                            ^^^^^^
        // Reliable, not unreliable:   ^
        */
        const EXPECTED_PACKET = "000000402d850000000000000000000000000000000000000000003c98f20a00060000b685f1f20a000600b71d53802fcc483393a79a49670175874000fff000020000000000000000401000a82f40b6ee8946ccb50402b88d72a546f02594";

        /* eslint-enable max-len */

        const mockDateNow = jest.spyOn(Date, "now").mockImplementation(() => {
            return 168889688;
        });

        const properties = {
            lastEdited: 1688896885851574n,  // Date.now() as count of 100ns ticks since the Unix epoch + 44 clock skew.
            lastEditedBy: new Uuid("a82f40b6-ee89-46cc-b504-02b88d72a546"),
            entityType: EntityType.Box,
            color: { red: 240, green: 37, blue: 148 }
        };
        const requestedProperties = EntityItemProperties.getChangedProperties(properties);
        const didntFitProperties = new EntityPropertyFlags();
        const entityEditDetails = {
            entityID: new Uuid("b71d5380-2fcc-4833-93a7-9a4967017587"),
            properties,
            requestedProperties,
            didntFitProperties
        };
        const packet = EntityEdit.write(entityEditDetails);

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.EntityEdit);
        expect(packet.isReliable()).toBe(true);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);

        expect(entityEditDetails.didntFitProperties.length()).toBe(0);

        mockDateNow.mockReset(); // eslint-disable-line @typescript-eslint/no-unsafe-call
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    });

    /*
    test("Can write an EntityEdit packet that changes group properties", () => {
        expect(false).toBe(true);
    });
    */

    /*
    test("Writing a property that won't fit in a packet returns null", () => {
        expect(false).toBe(true);
    })
    */

});
