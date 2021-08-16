//
//  LimitedNodeList.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import LimitedNodeList from "../../../src/domain/networking/LimitedNodeList";
import PacketReceiver from "../../../src/domain/networking/PacketReceiver";
import Uuid from "../../../src/domain/shared/Uuid";


describe("LimitedNodeList - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

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

    test("Can set and get session UUIDs and local IDs", () => {
        const limitedNodeList = new LimitedNodeList();
        expect(limitedNodeList.getSessionUUID().valueOf()).toBe(Uuid.NULL);
        expect(limitedNodeList.getSessionLocalID()).toBe(0);
        const testSessionUUID = new Uuid(12345678n);
        const testSessionLocalID = 2468;
        limitedNodeList.setSessionUUID(testSessionUUID);
        limitedNodeList.setSessionLocalID(testSessionLocalID);
        expect(limitedNodeList.getSessionUUID().valueOf()).toBe(testSessionUUID.valueOf());
        expect(limitedNodeList.getSessionLocalID()).toBe(testSessionLocalID);
    });

    test("Can reset an empty node list", () => {
        const limitedNodeList = new LimitedNodeList();
        limitedNodeList.reset("Some reason");
        expect(true).toBe(true);
    });

    // WEBRTC TODO: Unit tests for:
    // - sendPacket() - Currently tested implicitly by NodesList integration test.
    // - sendUnreliablePacket() - Currently tested implicitly by NodesList integration test.

});
