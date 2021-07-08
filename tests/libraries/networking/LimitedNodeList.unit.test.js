//
//  LimitedNodeList.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import LimitedNodeList from "../../../src/libraries/networking/LimitedNodeList.js";
import PacketReceiver from "../../../src/libraries/networking/PacketReceiver.js";


describe("LimitedNodeList - integration tests", () => {

    test("Can access ConnectReason values", () => {
        expect(LimitedNodeList.ConnectReason.Connect).toBe(0);
        expect(LimitedNodeList.ConnectReason.Awake).toBe(2);
    });

    test("Can access INVALID_PORT", () => {
        expect(LimitedNodeList.INVALID_PORT).toBe(-1);
    });

    test("Can get the local and public network addresses", () => {
        const limitedNodeList = new LimitedNodeList();
        const localSockAddr = limitedNodeList.getLocalSockAddr();
        expect(localSockAddr.getAddress()).toBe(0);
        expect(localSockAddr.getPort()).toBe(0);
        const publicSockAddr = limitedNodeList.getPublicSockAddr();
        expect(publicSockAddr.getAddress()).toBe(0);
        expect(publicSockAddr.getPort()).toBe(0);
    });

    test("Can get the PacketReceiver", () => {
        const limitedNodeList = new LimitedNodeList();
        const packetReceiver = limitedNodeList.getPacketReceiver();
        expect(packetReceiver instanceof PacketReceiver).toBe(true);
    });

    // WEBRTC TODO: Unit tests for:
    // - sendPacket() - Currently tested implicitly by NodesList integration test.
    // - sendUnreliablePacket() - Currently tested implicitly by NodesList integration test.

});
