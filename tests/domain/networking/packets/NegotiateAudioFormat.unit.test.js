//
//  DomainListRequest.unit.test.js
//
//  Created by David Rowe on 28 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import NegotiateAudioFormat from "../../../../src/domain/networking/packets/NegotiateAudioFormat";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../../src/domain/networking/udt/UDT";


describe("NegotiateAudioFormat - unit tests", () => {

    test("Can write a NegotiateAudioFormat packet", () => {
        const codecs = [
            "opus",
            "pcm",
            "zlib"
        ];

        const packet = NegotiateAudioFormat.write({
            codecs
        });

        //console.log("$$$$$$$", packet.getMessageData().data);

        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.NegotiateAudioFormat);

        const packetSize = packet.getDataSize();
        expect(packetSize).toBe(packet.getMessageData().dataPosition);
        expect(packetSize).toBeGreaterThan(0);
        expect(packetSize).toBeLessThan(UDT.MAX_PACKET_SIZE);

        const PACKET_HEADER_SIZE = 8;
        const MD5_VERIFICATION_SIZE = 16;
        expect(packetSize).toBe(PACKET_HEADER_SIZE + MD5_VERIFICATION_SIZE
            + 1  // Number of codecs.
            + 4 * codecs.length  // lengths for each codec.
            + codecs.join("").length);  // UTF8 chars for each codec.

    });

});
