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


describe("EntityQuery - unit tests", () => {

    test("Can write an EntityQuery packet", () => {
        // WEBRTC TODO: Create expected packet.

        const packet = EntityQuery.write();
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.EntityQuery);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);
    });
});
