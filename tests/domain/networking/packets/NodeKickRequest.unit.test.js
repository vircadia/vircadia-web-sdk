//
//  NodeKickRequest.unit.test.js
//
//  Created by David Rowe on 21 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeKickRequest from "../../../../src/domain/networking/packets/NodeKickRequest";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../../src/domain/networking/NLPacket";
import Uuid from "../../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../../testUtils";


describe("NodeKickRequest - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write a NodeKickRequest packet", () => {
        const EXPECTED_PACKET = "00000040431600005dfe0ae4ac1440c8b09354d9d44a15e103000000";
        const packet = NodeKickRequest.write({
            nodeID: new Uuid(BigInt("0x5dfe0ae4ac1440c8b09354d9d44a15e1")),
            banFlags: 3
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.NodeKickRequest);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(packetSize);
        expect(packet.getMessageData().packetSize).toBe(packetSize);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
