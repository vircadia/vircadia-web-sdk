//
//  AvatarQuery.unit.test.js
//
//  Created by David Rowe on 10 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarQuery from "../../../../src/domain/networking/packets/AvatarQuery";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../../src/domain/networking/NLPacket";

import { buffer2hex } from "../../../testUtils";


describe("AvatarQuery - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write an AvatarQuery packet", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "00000000481600000000000000000000000000000000000001cdcc8c3fcdcc0c4033335340ae47e1becdcc0c3fc3f528bf1d8100c0a4704d40";
        const packet = AvatarQuery.write({
            conicalViews: [
                {
                    position: { x: 1.1, y: 2.2, z: 3.3 },
                    direction: { x: -0.44, y: 0.55, z: -0.66 },
                    halfAngle: 1.571,
                    farClip: 16384,
                    centerRadius: 3.21
                }
            ]
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarQuery);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(packetSize);
        expect(packet.getMessageData().packetSize).toBe(packetSize);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
