//
//  AvatarIdentity.unit.test.js
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacketList from "../../../../src/domain/networking/NLPacketList";
import AvatarIdentity from "../../../../src/domain/networking/packets/AvatarIdentity";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";
import Uuid from "../../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../../testUtils.js";


describe("AvatarIdentity - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can write an AvatarIdentity packet", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "0000006000000000000000001d36000000000000000000000000000000000000a3eda01ec4de456dbf07858a26c5a64800000002000000000000001a006d00790064006900730070006c00610079006e0061006d0065ffffffff00000002";
        const packetList = AvatarIdentity.write({
            sessionUUID: new Uuid(217897985291723272451165858623432009288n),
            identitySequenceNumber: 2,
            attachmentData: [],
            displayName: "mydisplayname",
            sessionDisplayName: null,
            isReplicated: false,
            lookAtSnapping: true,
            verificationFailed: false
        });
        packetList.closeCurrentPacket();

        expect(packetList instanceof NLPacketList).toBe(true);
        expect(packetList.getType()).toBe(PacketType.AvatarIdentity);
        const packets = packetList.getPackets();
        expect(packets).toHaveLength(1);

        const packet = packets[0];
        const packetSize = packet.getDataSize();
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThanOrEqual(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packet.getMessageData().dataPosition))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(EXPECTED_PACKET.length / 2);
    });

});
