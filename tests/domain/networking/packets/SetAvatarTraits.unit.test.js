//
//  SetAvatarTraits.unit.test.js
//
//  Created by Julien Merzoug on 12 Apr 2022.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacketList from "../../../../src/domain/networking/NLPacketList";
import SetAvatarTraits from "../../../../src/domain/networking/packets/SetAvatarTraits";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";
import { ClientTraitStatus } from "../../../../src/domain/avatars/AvatarTraits";

import { buffer2hex } from "../../../testUtils.js";

describe("SetAvatarTraits - unit tests", () => {
    test("Can write a SetAvatarTraits packet", () => {
        const EXPECTED_PACKET = "00000060000000000000000019160000000000000000000000000000000000000100000000420068747470733a2f2f63646e2d312e76697263616469612e636f6d2f75732d652d312f42617a6161722f417661746172732f5365616e2f6662782f5365616e2e667374";

        // create packet
        const traitStatuses = [ClientTraitStatus.Updated];
        const packetList = SetAvatarTraits.write({
            currentTraitVersion: 1,
            skeletonModelURL: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Sean/fbx/Sean.fst",
            traitStatuses
        });
        packetList.closeCurrentPacket();


        expect(packetList instanceof NLPacketList).toBe(true);
        expect(packetList.getType()).toBe(PacketType.SetAvatarTraits);
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
