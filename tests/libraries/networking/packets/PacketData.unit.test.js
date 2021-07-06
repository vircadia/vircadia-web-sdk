//
//  PacketData.unit.tests.js
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketData from "../../../../src/libraries/networking/packets/PacketData.js";


describe("Packets - unit tests", () => {

    test("the Packets namespace provides packet reading/writing", () => {
        expect(typeof PacketData.DomainConnectRequest).toBe("object");
        expect(typeof PacketData.DomainConnectRequest.write).toBe("function");
        expect(typeof PacketData.DomainList).toBe("object");
        expect(typeof PacketData.DomainList.read).toBe("function");
    });

});
