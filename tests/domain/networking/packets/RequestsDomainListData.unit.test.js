//
//  RequestsDomainListData.unit.test.js
//
//  Created by David Rowe on 28 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import RequestsDomainListData from "../../../../src/domain/networking/packets/RequestsDomainListData";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../../src/domain/networking/NLPacket";

import { buffer2hex } from "../../../testUtils";


describe("RequestsDomainListData - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write an RequestsDomainListData packet", () => {
        const EXPECTED_PACKET = "00000040491600000000000000000000000000000000000001";
        const packet = RequestsDomainListData.write({
            isRequesting: true
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.RequestsDomainListData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(packetSize);
        expect(packet.getMessageData().packetSize).toBe(packetSize);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
