//
//  Socket.unit.test.js
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "../../../../src/domain/networking/NodeType";
import Socket from "../../../../src/domain/networking/udt/Socket";

import TestConfig from "../../../test.config.js";


describe("Socket - unit tests", () => {

    test("Check initial state", () => {
        expect(Socket.UNCONNECTED).toBe(0);
        expect(Socket.CONNECTING).toBe(1);
        expect(Socket.CONNECTED).toBe(2);
        const socket = new Socket();
        expect(socket.getSocketState(TestConfig.SERVER_SIGNALING_SOCKET_URL, NodeType.DomainServer)).toBe(Socket.UNCONNECTED);
    });

    // The Socket class is further exercised by DomainServer.unit.test.js.

});
