//
//  PingReply.unit.test.js
//
//  Created by David Rowe on 7 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import PingType from "../../../../src/domain/networking/PingType";
import PingReply from "../../../../src/domain/networking/packets/PingReply";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";


describe("PingReply - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can write a PingReply packet", () => {
        const packet = PingReply.write({
            pingType: PingType.Public,
            timestampPing: (BigInt(Date.now()) - 200n) * 1000n,
            timestampReply: BigInt(Date.now()) * 1000n
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.PingReply);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);
    });

});
