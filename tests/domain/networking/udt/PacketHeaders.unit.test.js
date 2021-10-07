//
//  PacketHeaders.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

import PacketType, { protocolVersionsSignature } from "../../../../src/domain/networking/udt/PacketHeaders";


describe("PacketType - unit tests", () => {

    test("PacketType values can be accessed", () => {
        expect(PacketType.Unknown).toBe(0);
        expect(PacketType.StunResponse).toBe(1);
        expect(PacketType.DomainListRequest).toBe(13);
        expect(PacketType.WebRTCSignaling).toBe(105);
    });

    test("Packet version values can be accessed", () => {
        expect(PacketType.versionForPacketType(PacketType.DomainConnectRequest)).toBe(27);
    });

    test("Non-verified packets values can be accessed", () => {
        const nonVerifiedPackets = PacketType.getNonVerifiedPackets();
        expect(nonVerifiedPackets.has(PacketType.DomainSettings)).toBe(false);
        expect(nonVerifiedPackets.has(PacketType.NodeMuteRequest)).toBe(true);
    });

    test("Non-sourced packets values can be accessed", () => {
        const nonSourcedPackets = PacketType.getNonSourcedPackets();
        expect(nonSourcedPackets.has(PacketType.DomainListRequest)).toBe(false);
        expect(nonSourcedPackets.has(PacketType.DomainList)).toBe(true);
    });

    test("The protocol version is a 16-byte value", () => {
        const protocolVersion = protocolVersionsSignature();
        expect(protocolVersion instanceof Uint8Array).toBe(true);
        expect(protocolVersion.byteLength).toBe(16);
    });

});
