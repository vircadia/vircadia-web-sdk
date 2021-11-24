//
//  AvatarIdentity.unit.test.js
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacketList from "../../../../src/domain/networking/NLPacketList";
import AvatarIdentity from "../../../../src/domain/networking/packets/AvatarIdentity";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import SequenceNumber from "../../../../src/domain/networking/udt/SequenceNumber";
import UDT from "../../../../src/domain/networking/udt/UDT";
import Uuid from "../../../../src/domain/shared/Uuid";

import { buffer2hex } from "../../../testUtils.js";


describe("AvatarIdentity - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can write an AvatarIdentity packet", () => {
        // eslint-disable-next-line max-len
        const EXPECTED_PACKET = "0000006000000000000000001d36000000000000000000000000000000000000a3eda01ec4de456dbf07858a26c5a64800000002000000000000001a006d00790064006900730070006c00610079006e0061006d0065ffffffff00000002";
        const packetList = AvatarIdentity.write({
            sessionUUID: new Uuid(217897985291723272451165858623432009288n),
            identitySequenceNumber: new SequenceNumber(2),
            displayName: "mydisplayname",
            sessionDisplayName: null,
            isReplicated: false,
            lookAtSnapping: true,
            verificationFailed: false
        });
        packetList.closeCurrentPacket();

        expect(packetList instanceof NLPacketList).toBe(true);
        expect(packetList.getType()).toBe(PacketType.AvatarIdentity);
        const packets = packetList.getPackets();
        expect(packets).toHaveLength(1);

        const packet = packets[0];
        const packetSize = packet.getDataSize();
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThanOrEqual(UDT.MAX_PACKET_SIZE);

        expect(buffer2hex(packet.getMessageData().buffer.slice(0, packet.getMessageData().dataPosition))).toBe(EXPECTED_PACKET);
        expect(packet.getMessageData().dataPosition).toBe(EXPECTED_PACKET.length / 2);
    });

    test("Can read a single-avatar AvatarIdentity  message", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "7d980fa83d7d43b5808c9e5883d89ba900000003000000000000001a006d00790064006900730070006c00610079006e0061006d00650000001a006d00790064006900730070006c00610079006e0061006d006500000002";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const avatarIdentityDetails = AvatarIdentity.read(dataView);
        expect(avatarIdentityDetails).toHaveLength(1);

        const avatarIdentity = avatarIdentityDetails[0];
        expect(avatarIdentity.sessionUUID.stringify()).toBe("7d980fa8-3d7d-43b5-808c-9e5883d89ba9");
        expect(avatarIdentity.identitySequenceNumber.value).toBe(3);
        expect(avatarIdentity.displayName).toBe("mydisplayname");
        expect(avatarIdentity.sessionDisplayName).toBe("mydisplayname");
        expect(avatarIdentity.isReplicated).toBe(false);
        expect(avatarIdentity.lookAtSnapping).toBe(true);
        expect(avatarIdentity.verificationFailed).toBe(false);
    });

    test("Can read a multi-avatar AvatarIdentity  message", () => {
        // eslint-disable-next-line max-len
        const RECEIVED_MESSAGE = "7d980fa83d7d43b5808c9e5883d89ba900000003000000000000001a006d00790064006900730070006c00610079006e0061006d00650000001a006d00790064006900730070006c00610079006e0061006d00650000000252973cdb8afd40168c4c7ff7d4dc9988000000050000000000000020006f00740068006500720064006900730070006c00610079006e0061006d006500000020006f00740068006500720064006900730070006c00610079006e0061006d006500000002";
        const MESSAGE_START = 0;

        const arrayBuffer = new ArrayBuffer(RECEIVED_MESSAGE.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_MESSAGE.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, MESSAGE_START);

        const avatarIdentityDetails = AvatarIdentity.read(dataView);
        expect(avatarIdentityDetails).toHaveLength(2);

        let avatarIdentity = avatarIdentityDetails[0];
        expect(avatarIdentity.sessionUUID.stringify()).toBe("7d980fa8-3d7d-43b5-808c-9e5883d89ba9");
        expect(avatarIdentity.identitySequenceNumber.value).toBe(3);
        expect(avatarIdentity.displayName).toBe("mydisplayname");
        expect(avatarIdentity.sessionDisplayName).toBe("mydisplayname");
        expect(avatarIdentity.isReplicated).toBe(false);
        expect(avatarIdentity.lookAtSnapping).toBe(true);
        expect(avatarIdentity.verificationFailed).toBe(false);

        avatarIdentity = avatarIdentityDetails[1];
        expect(avatarIdentity.sessionUUID.stringify()).toBe("52973cdb-8afd-4016-8c4c-7ff7d4dc9988");
        expect(avatarIdentity.identitySequenceNumber.value).toBe(5);
        expect(avatarIdentity.displayName).toBe("otherdisplayname");
        expect(avatarIdentity.sessionDisplayName).toBe("otherdisplayname");
        expect(avatarIdentity.isReplicated).toBe(false);
        expect(avatarIdentity.lookAtSnapping).toBe(true);
        expect(avatarIdentity.verificationFailed).toBe(false);
    });

});
