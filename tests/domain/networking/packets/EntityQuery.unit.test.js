//
//  EntityQuery.unit.test.js
//
//  Created by Julien Merzoug on 27 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";
import EntityQuery from "../../../../src/domain/networking/packets/EntityQuery";
import OctreeQuery from "../../../../src/domain/octree/OctreeQuery";

import { buffer2hex } from "../../../testUtils";


describe("EntityQuery - unit tests", () => {

    test("Can write an EntityQuery packet", () => {
        /* eslint-disable max-len */
        const EXPECTED_PACKET = "000000002a160000416c015bb0a3c1c4f8b8c08ededbc0743c5e3f000000007624fe3e818000c000004040580200000000484b0000000000000000";
        /* eslint-enable max-len */

        const octreeQuery = new OctreeQuery();

        const data = octreeQuery.getBroadcastData();

        /* eslint-disable @typescript-eslint/no-magic-numbers */
        data.connectionID = 27713;
        data.conicalViews.at(0).position = { x: -20.461111, y: -5.7803667, z: -6.8709172 };
        data.conicalViews.at(0).direction = { x: 0.86810995, y: 0, z: 0.49637193 };
        data.conicalViews.at(0).angle = 0.714619;
        data.conicalViews.at(0).farClip = 16384;
        data.conicalViews.at(0).radius = 3;
        /* eslint-enable @typescript-eslint/no-magic-numbers */

        const packet = EntityQuery.write(data);
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.EntityQuery);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
    });
});
