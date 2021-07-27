//
//  DomainDisconnectRequest.unit.test.js
//
//  Created by David Rowe on 27 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../../../../src/domain/networking/NLPacket";
import DomainDisconnectRequest from "../../../../src/domain/networking/packets/DomainDisconnectRequest";
import PacketType from "../../../../src/domain/networking/udt/PacketHeaders";


describe("DomainDisconnectRequest - unit tests", () => {

    test("Can write a DomainDisonnectRequest packet", () => {
        const packet = DomainDisconnectRequest.write();
        expect(packet instanceof NLPacket).toBe(true);
        expect(packet.getType()).toBe(PacketType.DomainConnectRequest);
        expect(packet.getMessageData().dataPosition).toBeGreaterThan(0);
    });

});
