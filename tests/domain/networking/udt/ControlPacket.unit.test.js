//
//  ControlPacket.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SockAddr from "../../../../src/domain/networking/SockAddr";
import ControlPacket from "../../../../src/domain/networking/udt/ControlPacket";
import SequenceNumber from "../../../../src/domain/networking/udt/SequenceNumber";

import { buffer2hex } from "../../../testUtils.js";


describe("ControlPacket - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can access the ControlPacket type values", () => {
        expect(ControlPacket.ACK).toBe(0);
        expect(ControlPacket.Handshake).toBe(1);
        expect(ControlPacket.HandshakeACK).toBe(2);
        expect(ControlPacket.HandshakeRequest).toBe(3);
    });

    test("Can write a Handshake packet", () => {
        const EXPECTED_PACKET = "0000018007000000";
        const HANDSHAKE_PAYLOAD_BYTES = 4;
        const initialSequenceNumber = new SequenceNumber(7);
        const handshakePacket = ControlPacket.create(ControlPacket.Handshake, HANDSHAKE_PAYLOAD_BYTES);
        handshakePacket.writeSequenceNumber(initialSequenceNumber);

        expect(handshakePacket.getType()).toBe(ControlPacket.Handshake);
        expect(handshakePacket.getMessageData().data.byteLength).toBe(EXPECTED_PACKET.length / 2);
        expect(buffer2hex(handshakePacket.getMessageData().buffer)).toBe(EXPECTED_PACKET);
    });

    test("Can read a Handshake packet", () => {
        const RECEIVED_PACKET = "0000018007000000";

        const arrayBuffer = new ArrayBuffer(RECEIVED_PACKET.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(RECEIVED_PACKET.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, 0);

        const controlPacket = ControlPacket.fromReceivedPacket(dataView, dataView.byteLength, new SockAddr());
        expect(controlPacket.getType()).toBe(ControlPacket.Handshake);
        const sequenceNumber = controlPacket.readSequenceNumber();
        expect(sequenceNumber.value).toBe(7);
    });

});
