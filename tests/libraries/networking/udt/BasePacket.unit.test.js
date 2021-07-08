//
//  BasePacket.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */
/* eslint-disable no-magic-numbers */

import HifiSockAddr from "../../../../src/libraries/networking/HifiSockAddr.js";
import BasePacket from "../../../../src/libraries/networking/udt/BasePacket.js";
import UDT from "../../../../src/libraries/networking/udt/UDT.js";


describe("BasePacket - unit tests", () => {

    let buffer = null;
    let dataView = null;
    let sockAddr = null;
    const IP_127_0_0_1 = 127 * 2 ** 24 + 1;  // 127.0.0.1

    const error = jest.spyOn(console, "error").mockImplementation((a) => {
        console.log(a);
    });

    function createPacketOfSize() {
        return new BasePacket(14);
    }

    function createPacketFromDataView() {
        buffer = new ArrayBuffer(10);
        dataView = new DataView(buffer);
        dataView.setUint8(0, 12);
        sockAddr = new HifiSockAddr();
        sockAddr.setAddress(IP_127_0_0_1);
        sockAddr.setPort(7);
        return new BasePacket(dataView, dataView.byteLength, sockAddr);
    }


    test("Static methods", () => {
        expect(BasePacket.maxPayloadSize()).toBe(UDT.MAX_PACKET_SIZE);
    });

    test("Can create an empty packet", () => {
        const packet = createPacketOfSize();
        expect(packet.getDataSize()).toBe(14);
        const messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(14);
        expect(messageData.data.byteLength).toBe(14);
        for (let i = 0; i < messageData.packetSize; i++) {
            expect(messageData.data.getUint8(i)).toBe(0);
        }
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet based on a DataView", () => {
        const packet = createPacketFromDataView();
        expect(packet.getDataSize()).toBe(10);
        const messageData = packet.getMessageData();
        expect(messageData.data).toBe(dataView);
        expect(messageData.dataPosition).toBe(0);
        expect(messageData.packetSize).toBe(10);
        expect(messageData.senderSockAddr.getAddress()).toBe(IP_127_0_0_1);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(messageData.receiveTime).toBe(null);
        expect(messageData.data.getUint8(0)).toBe(12);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet based on another", () => {
        const packetA = createPacketFromDataView();
        const time = Date.now();
        packetA.setReceiveTime(time);
        const packetB = new BasePacket(packetA);
        expect(packetB.getReceiveTime()).toBe(time);
        expect(packetB.getMessageData()).toBe(packetA.getMessageData());
        expect(packetB.getMessageData().data.getUint8(0)).toBe(12);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can set and get the received time", () => {
        const packet = createPacketFromDataView();
        const time = Date.now();
        packet.setReceiveTime(time);
        const timeReceived = packet.getReceiveTime();
        expect(timeReceived).toBe(time);
        expect(error).toHaveBeenCalledTimes(0);
    });


    error.mockReset();
});
