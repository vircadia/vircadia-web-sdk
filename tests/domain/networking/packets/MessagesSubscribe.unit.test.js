//
//  MessagesSubscribe.unit.test.js
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacketList from "../../../../src/domain/networking/NLPacketList";
import MessagesSubscribe from "../../../../src/domain/networking/packets/MessagesSubscribe";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";

import { buffer2hex } from "../../../testUtils.js";


describe("MessagesSubscribe - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write a MessagesSubscribe packet", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "0000006000000000000000003a1600000000000000000000000000000000000076697263616469612e756e69742e74657374";

        const packetList = MessagesSubscribe.write({
            channel: "vircadia.unit.test"
        });
        packetList.closeCurrentPacket();

        expect(packetList instanceof NLPacketList).toBe(true);
        expect(packetList.getType()).toBe(PacketType.MessagesSubscribe);
        const packets = packetList.getPackets();
        expect(packets).toHaveLength(1);

        const packet = packets[0];
        const packetSize = packet.getDataSize();
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThanOrEqual(UDT.MAX_PACKET_SIZE);

        expect(packet.getMessageData().dataPosition).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, EXPECTED_PACKET.length / 2))).toBe(EXPECTED_PACKET);
    });

});
