//
//  PacketReceiver.unit.test.js
//
//  Created by David Rowe on 8 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import NodeType from "../../../src/domain/networking/NodeType";
import PacketReceiver from "../../../src/domain/networking/PacketReceiver";
import SockAddr from "../../../src/domain/networking/SockAddr";
import Packet from "../../../src/domain/networking/udt/Packet";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Uuid from "../../../src/domain/shared/Uuid";


describe("PacketReceiver - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    /* eslint-disable-next-line max-len */
    const domainServerListHex = "030000000218a3eda01ec4de456dbf07858a26c5a6486525652fd4cfdaef4ba3899b3a09e2c05f413fe2000000010100000000fd792d130005c48621581c4d000000000000003700418d539e40469f4f85991a2e26d3c1a103002bf9c711f29c00c0a8086ef29c0000079f00115b40fc7ccac5a9418c8a9d444018ad4d486f4062d328789b416a8146eae0f0d02655002bf9c711f29e00c0a8086ef29e0000079f0069c76bde4becd0ce442aa8cb5d13c87f286f6d6d2ae3a2ed67493c9fc3bcb8b601b924002bf9c711f29f00c0a8086ef29f0000079f003b4044eceda4577e4ca2a00f4177d64871e04d60256a079add443684315fb301da10a4002bf9c711f2a000c0a8086ef2a00000079f00bd916ff1ab42fdd64bc28bb5fc83fe7e3f72574c3a0cb9a21646948d73579b6b695dcf002bf9c711f2a100c0a8086ef2a10000079f00e77622cfcb8b839d42a9a56f7ff40b6eb0e0533ab0441a8a2f48a5a7a3956f0e9796a1002bf9c711f29d00c0a8086ef29d0000079f0093aca00ef67311254a43bbb63a403d885081";
    const domainServerListArray = new Uint8Array(domainServerListHex.match(/[\da-f]{2}/giu).map(function (hex) {
        return parseInt(hex, 16);
    }));
    const domainServerListDataView = new DataView(domainServerListArray.buffer);

    const pingHex = "02000000031266e9338a15d4247f025544b21dd91c6f5f7602500031d15ecb05000000000000000000";
    const pingArray = new Uint8Array(pingHex.match(/[\da-f]{2}/giu).map(function (hex) {
        return parseInt(hex, 16);
    }));
    const pingDataView = new DataView(pingArray.buffer);
    const PING_SOURCE_ID = 59750;  // From pingHex.

    const sockAddr = new SockAddr();
    sockAddr.setPort(7);

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AddressManager);  // Required by NodeList.
    ContextManager.set(contextID, NodeList, contextID);

    const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });


    test("Can create an unsourced listener reference", () => {
        function fn() {
            //
        }
        const listenerReference = PacketReceiver.makeUnsourcedListenerReference(fn);
        expect(listenerReference.listener).toBe(fn);
        expect(listenerReference.sourced).toBe(false);
        expect(listenerReference.deliverPending).toBe(false);
    });

    test("Can register an unsourced listener", () => {
        function fn() {
            //
        }
        const packetReceiver = new PacketReceiver();
        const listenerReference = PacketReceiver.makeUnsourcedListenerReference(fn);
        const registered = packetReceiver.registerListener(PacketType.DomainList, listenerReference);
        expect(registered).toBe(true);
        expect(listenerReference.deliverPending).toBe(false);
    });

    test("Can invoke an unsourced listener", (done) => {
        expect.assertions(1);

        function fn() {
            expect(true).toBe(true);
            done();
        }

        const packetReceiver = new PacketReceiver();
        const listenerReference = PacketReceiver.makeUnsourcedListenerReference(fn);
        packetReceiver.registerListener(PacketType.DomainList, listenerReference);
        const packet = new Packet(domainServerListDataView, domainServerListDataView.byteLength, sockAddr);
        packetReceiver.handleVerifiedPacket(packet);
    });

    test("Can create, register, and invoke a sourced listener", (done) => {
        /* eslint-disable @typescript-eslint/no-unsafe-call */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */

        expect.assertions(5);

        function fn() {
            expect(true).toBe(true);
            done();
        }

        // Create.
        const packetReceiver = ContextManager.get(contextID, NodeList).getPacketReceiver();
        const listenerReference = PacketReceiver.makeSourcedListenerReference(fn);
        expect(listenerReference.listener).toBe(fn);
        expect(listenerReference.sourced).toBe(true);
        expect(listenerReference.deliverPending).toBe(false);

        // Register.
        const registered = packetReceiver.registerListener(PacketType.Ping, listenerReference);
        expect(registered).toBe(true);

        // Invoke.
        const packet = new Packet(pingDataView, pingDataView.byteLength, sockAddr);
        const nodeList = ContextManager.get(contextID, NodeList);
        nodeList.addOrUpdateNode(new Uuid(1n), NodeType.AudioMixer, sockAddr, sockAddr, PING_SOURCE_ID, false, false,
            new Uuid(2n), 7);
        packetReceiver.handleVerifiedPacket(packet);
    });

    test("Can register a sourced listener for types", () => {
        function fn() {
            //
        }

        // Create.
        const packetReceiver = ContextManager.get(contextID, NodeList).getPacketReceiver();
        const registerListener = jest.spyOn(packetReceiver, "registerListener").mockImplementation(() => { /* no-op */ });

        const listenerReference = PacketReceiver.makeSourcedListenerReference(fn);
        expect(listenerReference.listener).toBe(fn);
        expect(listenerReference.sourced).toBe(true);
        expect(listenerReference.deliverPending).toBe(false);

        // Register.
        packetReceiver.registerListenerForTypes([PacketType.Ping, PacketType.KillAvatar], listenerReference);
        expect(registerListener).toHaveBeenCalledTimes(2);

        registerListener.mockRestore();
    });

    log.mockReset();
});
