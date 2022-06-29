//
//  DomainServerPathQuery.unit.test.js
//
//  Created by David Rowe on 29 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServerPathQuery from "../../../../src/domain/networking/packets/DomainServerPathQuery";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../../src/domain/networking/NLPacket";

import { buffer2hex } from "../../../testUtils";


describe("DomainServerPathQuery - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write a DomainServerPathQuery packet", () => {
        const EXPECTED_PACKET = "00000040131609002f736f6d6570617468";
        const packet = DomainServerPathQuery.write({
            path: "/somepath"
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.DomainServerPathQuery);
        const packetSize = packet.getDataSize();
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(packet.getMessageData().packetSize);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
