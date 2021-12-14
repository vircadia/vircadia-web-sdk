//
//  AvatarData.unit.test.js
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import AvatarData from "../../../../src/domain/networking/packets/AvatarData";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";

import { buffer2hex } from "../../../testUtils";


describe("AvatarData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can write an AvatarData packet - global position only", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000d4070100000060400000e040000080bf";
        const packet = AvatarData.write({
            sequenceNumber: 2004,
            dataDetail: 3,
            lastSentTime: Date.now(),
            dropFaceTracking: false,
            distanceAdjust: false,
            viewerPosition: { x: 0, y: 0, z: 0 },
            globalPosition: { x: 3.5, y: 7.0, z: -1.0 }
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
    });

    test("Can write an AvatarData packet - global position and orientation", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "000000000636000000000000000000000000000000000000d4070500000020c10000c8420000a041bfff3fff6d40";
        const packet = AvatarData.write({
            sequenceNumber: 2004,
            dataDetail: 3,
            lastSentTime: Date.now(),
            dropFaceTracking: false,
            distanceAdjust: false,
            viewerPosition: { x: 0, y: 0, z: 0 },
            globalPosition: { x: -10, y: 100, z: 20 },
            globalOrientation: { x: 0, y: 0.866025, z: 0, w: -0.5 }
        });
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.AvatarData);
        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        expect(packetSize).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packetSize))).toBe(EXPECTED_PACKET);
    });

});
