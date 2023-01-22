//
//  NodeIgnoreRequest.unit.test.js
//
//  Created by David Rowe on 26 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeIgnoreRequest from "../../../../src/domain/networking/packets/NodeIgnoreRequest";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../../src/domain/networking/NLPacket";
import NLPacketList from "../../../../src/domain/networking/NLPacketList";
import UDT from "../../../../src/domain/networking/udt/UDT";
import Uuid from "../../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../../testUtils";


describe("NodeIgnoreRequest - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */

    test("Can write an NodeIgnoreRequest NLPacket that ignores a single node", () => {
        const EXPECTED_PACKET = "000000401e1200000000000000000000000000000000000001b26d558149994ecd964b6250817a06c3";
        const packet = NodeIgnoreRequest.write({
            nodeID: new Uuid(BigInt("0xb26d558149994ecd964b6250817a06c3")),
            ignore: true
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.NodeIgnoreRequest);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(packetSize);
        expect(packet.getMessageData().packetSize).toBe(packetSize);
    });

    test("Can write an NodeIgnoreRequest NLPacketList that ignores multiple nodes", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "0000006000000000000000001e1200000000000000000000000000000000000001e722537059c6486d9944eb49a3d1ea2b64b12743cc9d406e80af4dcf0deaa26e";
        const packetList = NodeIgnoreRequest.write({
            nodeIDs: [BigInt("0xe722537059c6486d9944eb49a3d1ea2b"), BigInt("0x64b12743cc9d406e80af4dcf0deaa26e")],
            ignore: true
        });
        packetList.closeCurrentPacket();

        expect(packetList instanceof NLPacketList).toBe(true);
        expect(packetList.getType()).toBe(PacketType.NodeIgnoreRequest);
        const packets = packetList.getPackets();
        expect(packets).toHaveLength(1);

        const packet = packets[0];
        const packetSize = packet.getDataSize();
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThanOrEqual(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packet.getMessageData().dataPosition))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(EXPECTED_PACKET.length / 2);
        expect(packet.getMessageData().packetSize).toBe(EXPECTED_PACKET.length / 2);
    });

});
