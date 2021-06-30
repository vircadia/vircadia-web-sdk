//
//  Packet.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */
/* eslint-disable no-magic-numbers */

import BasePacket from "../../../../src/libraries/networking/udt/BasePacket.js";
import Packet from "../../../../src/libraries/networking/udt/Packet.js";
import HifiSockAddr from "../../../../src/libraries/networking/HifiSockAddr.js";


describe("Packet - unit tests", () => {

    // Generate a DomainServerList packet's byte data.
    /* eslint-disable-next-line max-len */
    const domainServerListText = "030000000218a3eda01ec4de456dbf07858a26c5a6486525652fd4cfdaef4ba3899b3a09e2c05f413fe2000000010100000000fd792d130005c48621581c4d000000000000003700418d539e40469f4f85991a2e26d3c1a103002bf9c711f29c00c0a8086ef29c0000079f00115b40fc7ccac5a9418c8a9d444018ad4d486f4062d328789b416a8146eae0f0d02655002bf9c711f29e00c0a8086ef29e0000079f0069c76bde4becd0ce442aa8cb5d13c87f286f6d6d2ae3a2ed67493c9fc3bcb8b601b924002bf9c711f29f00c0a8086ef29f0000079f003b4044eceda4577e4ca2a00f4177d64871e04d60256a079add443684315fb301da10a4002bf9c711f2a000c0a8086ef2a00000079f00bd916ff1ab42fdd64bc28bb5fc83fe7e3f72574c3a0cb9a21646948d73579b6b695dcf002bf9c711f2a100c0a8086ef2a10000079f00e77622cfcb8b839d42a9a56f7ff40b6eb0e0533ab0441a8a2f48a5a7a3956f0e9796a1002bf9c711f29d00c0a8086ef29d0000079f0093aca00ef67311254a43bbb63a403d885081";
    const arrayBuffer = new ArrayBuffer(domainServerListText.length / 2);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
        uint8Array[i] = Number.parseInt(domainServerListText.substr(i * 2, 2), 16);
    }
    const dataView = new DataView(arrayBuffer);

    // Other test data.
    const sockAddr = new HifiSockAddr();
    sockAddr.setPort(7);

    const error = jest.spyOn(console, "error").mockImplementation((a) => {
        console.log(a);
    });


    test("Static properties", () => {
        expect(Packet.PacketPosition.MIDDLE).toBe(3);
        expect(Packet.ObfuscationLevel.ObfuscationL3).toBe(3);
    });

    test("Static methods", () => {
        expect(Packet.totalHeaderSize(false)).toBe(4);
        expect(Packet.totalHeaderSize(true)).toBe(12);
    });

    test("Can create an empty packet", () => {
        let packet = new Packet(8, false, false);
        let messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(4 + 8);
        expect(messageData.data.byteLength).toBe(4 + 8);
        for (let i = 4; i < messageData.packetSize; i++) {
            expect(messageData.data.getUint8(i)).toBe(0);
        }

        packet = new Packet(8, true, true);
        messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(12 + 8);
        expect(messageData.data.byteLength).toBe(12 + 8);
        for (let i = 12; i < messageData.packetSize; i++) {
            expect(messageData.data.getUint8(i)).toBe(0);
        }

        packet = new Packet(-1);
        messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(BasePacket.maxPayloadSize());
        expect(messageData.data.byteLength).toBe(BasePacket.maxPayloadSize());
        for (let i = 4; i < messageData.packetSize; i++) {
            expect(messageData.data.getUint8(i)).toBe(0);
        }

        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from received data using new Packet()", () => {
        const packet = new Packet(dataView, dataView.byteLength, sockAddr);
        const messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(dataView.byteLength);
        expect(messageData.isReliable).toBe(false);
        expect(messageData.isPartOfMessage).toBe(false);
        expect(messageData.obfuscationLevel).toBe(Packet.ObfuscationLevel.NoObfuscation);
        expect(typeof messageData.sequenceNumber).toBe("number");
        expect(messageData.sequenceNumber).toBeGreaterThan(0);
        expect(messageData.messageNumber).toBe(0);
        expect(messageData.packetPosition).toBe(Packet.PacketPosition.ONLY);
        expect(messageData.messagePartNumber).toBe(0);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet using new Packet() with another packet", () => {
        const packetA = new Packet(dataView, dataView.byteLength, sockAddr);
        const messageDataA = packetA.getMessageData();
        const packetB = new Packet(packetA);
        const messageDataB = packetB.getMessageData();
        expect(messageDataB).toBe(messageDataA);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from received data using fromReceivedPacket()", () => {
        const packet = Packet.fromReceivedPacket(dataView, dataView.byteLength, sockAddr);
        expect(packet instanceof Packet).toBe(true);
        const messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(dataView.byteLength);
        expect(typeof messageData.sequenceNumber).toBe("number");
        expect(messageData.sequenceNumber).toBeGreaterThan(0);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(error).toHaveBeenCalledTimes(0);
    });


    error.mockReset();
});
