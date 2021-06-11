//
//  PacketType.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import PacketType from "../../../../src/libraries/networking/udt/PacketType.js";


describe("PacketType - unit tests", () => {

    test("PacketType numbers appear to be correct", () => {
        expect(PacketType.Unknown).toBe(0);
        expect(PacketType.StunResponse).toBe(1);
        expect(PacketType.DomainListRequest).toBe(13);
        expect(PacketType.AvatarZonePresence).toBe(104);
    });

    test("Packet version numbers appear to be correct", () => {
        expect(PacketType.versionForPacketType(PacketType.DomainConnectRequest)).toBe(26);
    });

    test("Nonsourced packets appear to be correct", () => {
        const nonSourcedPackets = PacketType.getNonSourcedPackets();
        expect(nonSourcedPackets.has(PacketType.DomainListRequest)).toBe(false);
        expect(nonSourcedPackets.has(PacketType.DomainList)).toBe(true);
    });

});
