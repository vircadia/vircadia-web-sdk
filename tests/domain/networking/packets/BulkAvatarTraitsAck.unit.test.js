//
//  BulkAvatarTraitsAck.unit.test.js
//
//  Created by David Rowe on 28 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import BulkAvatarTraitsAck from "../../../../src/domain/networking/packets/BulkAvatarTraitsAck";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";

import { buffer2hex } from "../../../testUtils.js";


describe("BulkAvatarTraitsAck - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write a BulkAvatarTraitsAck packet", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "0000004066300000000000000000000000000000000000000200000000000000";

        const packet = BulkAvatarTraitsAck.write({
            traitsSequenceNumber: 2n
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.BulkAvatarTraitsAck);

        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(packet.getMessageData().dataPosition).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, EXPECTED_PACKET.length / 2))).toBe(EXPECTED_PACKET);
    });

});
