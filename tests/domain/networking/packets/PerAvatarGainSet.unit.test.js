//
//  PerAvatarGainSet.unit.test.js
//
//  Created by David Rowe on 10 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PerAvatarGainSet from "../../../../src/domain/networking/packets/PerAvatarGainSet";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../../src/domain/networking/NLPacket";
import Uuid from "../../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../../testUtils";


describe("PerAvatarGainSet - unit tests", () => {
    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can write an PerAvatarGainSet packet that sets the master avatar gain", () => {
        const EXPECTED_PACKET = "000000404a16000000000000000000000000000000000000000000000000000000000000000000009b";
        const packet = PerAvatarGainSet.write({
            id: new Uuid(Uuid.NULL),
            gain: -20
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.PerAvatarGainSet);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(packetSize);
        expect(packet.getMessageData().packetSize).toBe(packetSize);
    });

    test("Can write an PerAvatarGainSet packet that sets an individual avatar gain", () => {
        const EXPECTED_PACKET = "000000404a1600000000000000000000000000000000000050a1ad59a845492392428c602162b54ad7";
        const packet = PerAvatarGainSet.write({
            id: new Uuid(BigInt("0x50a1ad59a845492392428c602162b54a")),
            gain: 10
        });

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.PerAvatarGainSet);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(packetSize);
        expect(packet.getMessageData().packetSize).toBe(packetSize);
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */
});
