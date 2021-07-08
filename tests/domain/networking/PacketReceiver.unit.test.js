//
//  PacketReceiver.unit.test.js
//
//  Created by David Rowe on 8 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals jest */
/* eslint-disable no-magic-numbers */

import HifiSockAddr from "../../../src/domain/networking/HifiSockAddr.js";
import PacketReceiver from "../../../src/domain/networking/PacketReceiver.js";
import Packet from "../../../src/domain/networking/udt/Packet.js";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders.js";


describe("PacketReceicer - unit tests", () => {

    // Generate a DomainServerList Packet as if just received. Copied from Packet.unit.test.js.
    /* eslint-disable-next-line max-len */
    const domainServerListText = "030000000218a3eda01ec4de456dbf07858a26c5a6486525652fd4cfdaef4ba3899b3a09e2c05f413fe2000000010100000000fd792d130005c48621581c4d000000000000003700418d539e40469f4f85991a2e26d3c1a103002bf9c711f29c00c0a8086ef29c0000079f00115b40fc7ccac5a9418c8a9d444018ad4d486f4062d328789b416a8146eae0f0d02655002bf9c711f29e00c0a8086ef29e0000079f0069c76bde4becd0ce442aa8cb5d13c87f286f6d6d2ae3a2ed67493c9fc3bcb8b601b924002bf9c711f29f00c0a8086ef29f0000079f003b4044eceda4577e4ca2a00f4177d64871e04d60256a079add443684315fb301da10a4002bf9c711f2a000c0a8086ef2a00000079f00bd916ff1ab42fdd64bc28bb5fc83fe7e3f72574c3a0cb9a21646948d73579b6b695dcf002bf9c711f2a100c0a8086ef2a10000079f00e77622cfcb8b839d42a9a56f7ff40b6eb0e0533ab0441a8a2f48a5a7a3956f0e9796a1002bf9c711f29d00c0a8086ef29d0000079f0093aca00ef67311254a43bbb63a403d885081";
    const arrayBuffer = new ArrayBuffer(domainServerListText.length / 2);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0, length = arrayBuffer.byteLength; i < length; i++) {
        uint8Array[i] = Number.parseInt(domainServerListText.substr(i * 2, 2), 16);
    }
    const dataView = new DataView(arrayBuffer);
    const sockAddr = new HifiSockAddr();
    sockAddr.setPort(7);

    const error = jest.spyOn(console, "error").mockImplementation((a) => {
        console.log(a);
    });


    test("Can create an unsourced listener reference", () => {
        function fn() {
            //
        }
        const listenerReference = PacketReceiver.makeUnsourcedListenerReference(fn);
        expect(listenerReference.listener).toBe(fn);
        expect(listenerReference.sourced).toBe(false);
        expect(listenerReference.deliverPending).toBe(undefined);
    });

    test("Can register a listener", () => {
        function fn() {
            //
        }
        const packetReceiver = new PacketReceiver();
        const listenerReference = PacketReceiver.makeUnsourcedListenerReference(fn);
        const success = packetReceiver.registerListener(PacketType.DomainList, listenerReference);
        expect(success).toBe(true);
        expect(listenerReference.deliverPending).toBe(false);
    });

    test("Can invoke a listener", (done) => {
        expect.assertions(1);

        function fn() {
            expect(true).toBe(true);
            done();
        }

        const packetReceiver = new PacketReceiver();
        const listenerReference = PacketReceiver.makeUnsourcedListenerReference(fn);
        packetReceiver.registerListener(PacketType.DomainList, listenerReference);
        const packet = new Packet(dataView, dataView.byteLength, sockAddr);
        packetReceiver.handleVerifiedPacket(packet);
    });

    error.mockReset();
});
