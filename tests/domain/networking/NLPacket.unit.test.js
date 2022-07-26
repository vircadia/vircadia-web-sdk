//
//  NLPacket.unit.test.js
//
//  Created by David Rowe on 8 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HMACAuth from "../../../src/domain/networking/HMACAuth";
import NLPacket from "../../../src/domain/networking/NLPacket";
import SockAddr from "../../../src/domain/networking/SockAddr";
import Packet from "../../../src/domain/networking/udt/Packet";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders";
import UDT from "../../../src/domain/networking/udt/UDT";
import Uuid from "../../../src/domain/shared/Uuid";


describe("NLPacket - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Generate a DomainServerList Packet as if just received. Copied from Packet.unit.test.js.
    /* eslint-disable-next-line max-len */
    const domainListText = "030000000218a3eda01ec4de456dbf07858a26c5a6486525652fd4cfdaef4ba3899b3a09e2c05f413fe2000000010100000000fd792d130005c48621581c4d000000000000003700418d539e40469f4f85991a2e26d3c1a103002bf9c711f29c00c0a8086ef29c0000079f00115b40fc7ccac5a9418c8a9d444018ad4d486f4062d328789b416a8146eae0f0d02655002bf9c711f29e00c0a8086ef29e0000079f0069c76bde4becd0ce442aa8cb5d13c87f286f6d6d2ae3a2ed67493c9fc3bcb8b601b924002bf9c711f29f00c0a8086ef29f0000079f003b4044eceda4577e4ca2a00f4177d64871e04d60256a079add443684315fb301da10a4002bf9c711f2a000c0a8086ef2a00000079f00bd916ff1ab42fdd64bc28bb5fc83fe7e3f72574c3a0cb9a21646948d73579b6b695dcf002bf9c711f2a100c0a8086ef2a10000079f00e77622cfcb8b839d42a9a56f7ff40b6eb0e0533ab0441a8a2f48a5a7a3956f0e9796a1002bf9c711f29d00c0a8086ef29d0000079f0093aca00ef67311254a43bbb63a403d885081";
    const arrayBuffer = new ArrayBuffer(domainListText.length / 2);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
        uint8Array[i] = Number.parseInt(domainListText.substr(i * 2, 2), 16);
    }
    const dataView = new DataView(arrayBuffer);
    const sockAddr = new SockAddr();
    sockAddr.setPort(7);
    const testPacket = new Packet(dataView, dataView.byteLength, sockAddr);

    const error = jest.spyOn(console, "error").mockImplementation((a) => {
        console.log(a);
    });


    test("Can create a testPacket from scratch using create()", () => {
        const nlPacket = new NLPacket(PacketType.DomainConnectRequest, -1, true, true, 26);
        const messageData = nlPacket.getMessageData();
        expect(messageData.type).toBe(PacketType.DomainConnectRequest);
        expect(messageData.data.byteLength).toBeGreaterThan(0);
        expect(messageData.isReliable).toBe(true);
        expect(messageData.isPartOfMessage).toBe(true);
        expect(messageData.version).toBe(26);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from another packet using fromBase()", () => {
        const nlPacket = NLPacket.fromBase(testPacket);
        expect(nlPacket instanceof NLPacket).toBe(true);
        const messageData = nlPacket.getMessageData();
        expect(messageData.type).toBe(PacketType.DomainList);
        expect(messageData.version).toBe(24);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from received data using new NLPacket()", () => {
        const nlPacket = new NLPacket(dataView, dataView.byteLength, sockAddr);
        expect(nlPacket.getDataSize()).toBe(dataView.byteLength);
        const messageData = nlPacket.getMessageData();
        expect(messageData.type).toBe(PacketType.DomainList);
        expect(messageData.version).toBe(24);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(messageData.sourceID).toBe(0);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from received data using fromReceivedPacket()", () => {
        const nlPacket = NLPacket.fromReceivedPacket(dataView, dataView.byteLength, sockAddr);
        expect(nlPacket instanceof NLPacket).toBe(true);
        expect(nlPacket.getDataSize()).toBe(dataView.byteLength);
        const messageData = nlPacket.getMessageData();
        expect(messageData.type).toBe(PacketType.DomainList);
        expect(messageData.version).toBe(24);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(messageData.sourceID).toBe(0);
        expect(error).toHaveBeenCalledTimes(0);
    });


    test("Can create a packet using new NLPacket() with another packet", () => {
        const nlPacket = new NLPacket(testPacket);
        expect(nlPacket instanceof NLPacket).toBe(true);
        const messageData = nlPacket.getMessageData();
        expect(messageData.type).toBe(PacketType.DomainList);
        expect(messageData.version).toBe(24);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(error).toHaveBeenCalledTimes(0);
        expect(NLPacket.typeInHeader(nlPacket)).toBe(PacketType.DomainList);
        expect(NLPacket.versionInHeader(nlPacket)).toBe(24);
    });

    test("Can get NLPacket field values", () => {
        const nlPacket = new NLPacket(testPacket);
        expect(nlPacket.getType()).toBe(PacketType.DomainList);
        expect(nlPacket.getSourceID()).toBe(0);
        expect(nlPacket.getVersion()).toBeGreaterThan(0);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can write a source ID into a packet", () => {
        const nlPacket = new NLPacket(PacketType.DomainListRequest);
        const messageData = nlPacket.getMessageData();
        expect(messageData.data.getUint16(6, UDT.LITTLE_ENDIAN)).toBe(0);
        nlPacket.writeSourceID(37);
        expect(messageData.data.getUint16(6, UDT.LITTLE_ENDIAN)).toBe(37);
        expect(NLPacket.sourceIDInHeader(nlPacket)).toBe(37);
    });

    test("Can write a verification hash into a packet", () => {
        const nlPacket = new NLPacket(PacketType.NegotiateAudioFormat);
        expect(nlPacket.getMessageData().data.getBigUint128(8)).toBe(0n);
        const hmacAuth = new HMACAuth();
        hmacAuth.setKey(new Uuid(1234n));
        nlPacket.writeVerificationHash(hmacAuth);
        expect(nlPacket.getMessageData().data.getBigUint128(12)).not.toBe(0n);
    });


    error.mockReset();
});
