//
//  Packet.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SockAddr from "../../../../src/domain/networking/SockAddr";
import BasePacket from "../../../../src/domain/networking/udt/BasePacket";
import Packet from "../../../../src/domain/networking/udt/Packet";
import { buffer2hex } from "../../../testUtils";


describe("Packet - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Generate a DomainServerList packet's byte data.
    /* eslint-disable-next-line max-len */
    const domainServerListText = "030000000218a3eda01ec4de456dbf07858a26c5a6486525652fd4cfdaef4ba3899b3a09e2c05f413fe2000000010100000000fd792d130005c48621581c4d000000000000003700418d539e40469f4f85991a2e26d3c1a103002bf9c711f29c00c0a8086ef29c0000079f00115b40fc7ccac5a9418c8a9d444018ad4d486f4062d328789b416a8146eae0f0d02655002bf9c711f29e00c0a8086ef29e0000079f0069c76bde4becd0ce442aa8cb5d13c87f286f6d6d2ae3a2ed67493c9fc3bcb8b601b924002bf9c711f29f00c0a8086ef29f0000079f003b4044eceda4577e4ca2a00f4177d64871e04d60256a079add443684315fb301da10a4002bf9c711f2a000c0a8086ef2a00000079f00bd916ff1ab42fdd64bc28bb5fc83fe7e3f72574c3a0cb9a21646948d73579b6b695dcf002bf9c711f2a100c0a8086ef2a10000079f00e77622cfcb8b839d42a9a56f7ff40b6eb0e0533ab0441a8a2f48a5a7a3956f0e9796a1002bf9c711f29d00c0a8086ef29d0000079f0093aca00ef67311254a43bbb63a403d885081";
    const domainServerListBuffer = new ArrayBuffer(domainServerListText.length / 2);
    const domainServerListArray = new Uint8Array(domainServerListBuffer);
    for (let i = 0, length = domainServerListBuffer.byteLength; i < length; i++) {
        domainServerListArray[i] = Number.parseInt(domainServerListText.substr(i * 2, 2), 16);
    }
    const domainServerListView = new DataView(domainServerListBuffer);

    // Other test data.
    const sockAddr = new SockAddr();
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
        expect(packet.getDataSize()).toBe(4 + 8);
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

        packet = new Packet(-1, false, false);
        messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(BasePacket.maxPayloadSize());
        expect(messageData.data.byteLength).toBe(BasePacket.maxPayloadSize());
        for (let i = 4; i < messageData.packetSize; i++) {
            expect(messageData.data.getUint8(i)).toBe(0);
        }

        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from received data using new Packet()", () => {
        const packet = new Packet(domainServerListView, domainServerListView.byteLength, sockAddr);
        expect(packet.getDataSize()).toBe(domainServerListView.byteLength);
        expect(packet.isPartOfMessage()).toBe(false);
        expect(packet.isReliable()).toBe(false);
        const messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(domainServerListView.byteLength);
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
        const packetA = new Packet(domainServerListView, domainServerListView.byteLength, sockAddr);
        const messageDataA = packetA.getMessageData();
        const packetB = new Packet(packetA);
        const messageDataB = packetB.getMessageData();
        expect(messageDataB).not.toBe(messageDataA);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can create a packet from received data using fromReceivedPacket()", () => {
        const packet = Packet.fromReceivedPacket(domainServerListView, domainServerListView.byteLength, sockAddr);
        expect(packet instanceof Packet).toBe(true);
        expect(packet.getDataSize()).toBe(domainServerListView.byteLength);
        expect(packet.isPartOfMessage()).toBe(false);
        expect(packet.isReliable()).toBe(false);
        const messageData = packet.getMessageData();
        expect(messageData.packetSize).toBe(domainServerListView.byteLength);
        expect(typeof messageData.sequenceNumber).toBe("number");
        expect(messageData.sequenceNumber).toBeGreaterThan(0);
        expect(messageData.senderSockAddr.getPort()).toBe(7);
        expect(error).toHaveBeenCalledTimes(0);
    });

    test("Can read message packet's message-related header fields", () => {
        // eslint-disable-next-line max-len
        const PACKET_HEX = "da280a6609000040020000003912d0884b438082d2b4d851d74f831ce3f6dd133939393939393939383838383838383838383737373737373737373736363636363636363636353535353535353535353434343434343434343433333333333333333333323232323232323232323131313131313131313130303030303030303030393939393939393939393838383838383838383837373737373737373737363636363636363636363535353535353535353534343434343434343434333333333333333333333232323232323232323231313131313131313131303030303030303030303939393939393939393938383838383838383838373737373737373737373636363636363636363635353535353535353535343434343434343434343333333333333333333332323232323232323232313131313131313131313030303030303030303039393939393939393939383838383838383838383737373737373737373736363636363636363636353535353535353535353434343434343434343433333333333333333333323232323232323232323131313131313131313130303030303030303030393939393939393939393838383838383838383837373737373737373737363636363636363636363535353535353535353534343434343434343434333333333333333333333232323232323232323231313131313131313131303030303030303030303939393939393939393938383838383838383838373737373737373737373636363636363636363635353535353535353535343434343434343434343333333333333333333332323232323232323232313131313131313131313030303030303030303039393939393939393939383838383838383838383737373737373737373736363636363636363636353535353535353535353434343434343434343433333333333333333333323232323232323232323131313131313131313130303030303030303030d6ddf88a3ad44eb483f86d086368cf61";
        const messagesDataBuffer = new ArrayBuffer(PACKET_HEX.length / 2);
        const messagesDataArray = new Uint8Array(messagesDataBuffer);
        for (let i = 0, length = messagesDataBuffer.byteLength; i < length; i++) {
            messagesDataArray[i] = Number.parseInt(PACKET_HEX.substr(i * 2, 2), 16);
        }
        const messagesDataView = new DataView(messagesDataBuffer);
        const packet = new Packet(messagesDataView, messagesDataView.byteLength, sockAddr);

        expect(packet.isReliable()).toBe(true);
        expect(packet.isPartOfMessage()).toBe(true);
        expect(packet.getMessageNumber()).toBe(9);
        expect(packet.getMessagePartNumber()).toBe(2);
        expect(packet.getPacketPosition()).toBe(Packet.PacketPosition.LAST);
    });

    test("Can obfuscate and unobfuscate packets", () => {
        // AvatarIdentity packet.
        /* eslint-disable max-len */
        const LEVEL_0_HEX = "d96f496402000000000000001d36508bdbc45b8a0d7ae7e0ba3908565df404a42a002623f37b4a2ba31e7d4a6e3273490000000200000000ffffffff000000120061006e006f006e0079006d006f0075007300000002";
        const LEVEL_1_HEX = "d96f496c0200000000000000695323f8b2b639e9791f9493d34b6a35299177d743724440871e3958ca6c1f291a57003a6972626174657373968d9d9c746573616913620d740a731d690b620e740a7306690162637467";
        const LEVEL_2_HEX = "d96f497402000000000000007c5222eaa9ad39f96c1e9581c8506a253c9076c558694450921f384ad1771f390f56012872696271616472618d969d8c616472737208621d610b720f7210621e610b7214721a62736166";
        const LEVEL_3_HEX = "d96f497c020000000000000073573dedbdb133f8631b8a86dc4c6024339569c24c754e519d1a274dc56b153800531e2f667568706e616d66998a978d6e616d746614681c6e0e6d08660c681f6e0e6d13660668726e63";
        /* eslint-enable max-len */

        const arrayBuffer = new ArrayBuffer(LEVEL_0_HEX.length / 2);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
            uint8Array[i] = Number.parseInt(LEVEL_0_HEX.substr(i * 2, 2), 16);
        }
        const dataView = new DataView(arrayBuffer, 0);
        let level0Packet = new Packet(dataView, dataView.byteLength, sockAddr);

        const messageData = level0Packet.getMessageData();
        messageData.isPartOfMessage = true;
        messageData.sequenceNumber = 71921625;
        messageData.isReliable = true;
        messageData.obfuscationLevel = 0;

        // 0 => 1
        const level1Packet = new Packet(level0Packet);
        level1Packet.obfuscate(1);
        const level1PacketHex = buffer2hex(level1Packet.getMessageData().buffer);
        expect(level1PacketHex).toBe(LEVEL_1_HEX);

        // 1 => 0
        level0Packet = new Packet(level1Packet);
        level0Packet.obfuscate(0);
        let level0PacketHex = buffer2hex(level0Packet.getMessageData().buffer);
        expect(level0PacketHex).toBe(LEVEL_0_HEX);

        // 0 => 2
        const level2Packet = new Packet(level0Packet);
        level2Packet.obfuscate(2);
        const level2PacketHex = buffer2hex(level2Packet.getMessageData().buffer);
        expect(level2PacketHex).toBe(LEVEL_2_HEX);

        // 2 => 0
        level0Packet = new Packet(level2Packet);
        level0Packet.obfuscate(0);
        level0PacketHex = buffer2hex(level0Packet.getMessageData().buffer);
        expect(level0PacketHex).toBe(LEVEL_0_HEX);

        // 0 => 3
        const level3Packet = new Packet(level0Packet);
        level3Packet.obfuscate(3);
        const level3PacketHex = buffer2hex(level3Packet.getMessageData().buffer);
        expect(level3PacketHex).toBe(LEVEL_3_HEX);

        // 3 => 0
        level0Packet = new Packet(level3Packet);
        level0Packet.obfuscate(0);
        level0PacketHex = buffer2hex(level0Packet.getMessageData().buffer);
        expect(level0PacketHex).toBe(LEVEL_0_HEX);
    });

    // WEBRTC TODO: Test isPartOfMessage() and isReliable() for packets where their values are true.


    error.mockReset();
});
