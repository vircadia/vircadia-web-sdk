//
//  OctreeEditPacketSender.unit.test.js
//
//  Created by David Rowe on 20 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import ContextManager from "../../../src/domain/shared/ContextManager";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders";
import NLPacket from "../../../src/domain/networking/NLPacket";
import NodeList from "../../../src/domain/networking/NodeList";
import SockAddr from "../../../src/domain/networking/SockAddr";
import OctreeEditPacketSender from "../../../src/domain/octree/OctreeEditPacketSender";


describe("OctreeEditPacketSender - unit tests", () => {

    test("An OctreeEditPacketSender can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, OctreeEditPacketSender, contextID);
        const octreeEditPacketSender = ContextManager.get(contextID, OctreeEditPacketSender);
        expect(octreeEditPacketSender instanceof OctreeEditPacketSender).toBe(true);
    });

    test("A warning is logged when try to send a packet without an entity server connection", () => {
        let lastWarning = "";
        const warn = jest.spyOn(console, "warn").mockImplementation((message) => {
            lastWarning = message;  // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        });

        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, OctreeEditPacketSender, contextID);
        const octreeEditPacketSender = ContextManager.get(contextID, OctreeEditPacketSender);

        const nlPacket = new NLPacket(PacketType.EntityEdit);
        octreeEditPacketSender.queueOctreeEditMessage(nlPacket);  // eslint-disable-line @typescript-eslint/no-unsafe-call
        expect(lastWarning).toBe("[EntityServer] Could not send edit message because not connected.");

        warn.mockRestore();
    });

    test("Asserts if try to send a non-entity packet", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, OctreeEditPacketSender, contextID);
        const octreeEditPacketSender = ContextManager.get(contextID, OctreeEditPacketSender);

        let lastAssert = "";
        try {
            const nlPacket = new NLPacket(PacketType.DomainListRequest);
            octreeEditPacketSender.queueOctreeEditMessage(nlPacket);  // eslint-disable-line @typescript-eslint/no-unsafe-call
        } catch (e) {
            // eslint-disable-next-line
            lastAssert = e.message;
        }
        expect(lastAssert).toBe("Assertion failed! queueOctreeEditMessage() unexpected packet type: 13");
    });

    test("Can send an NLPacket to the entity server", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, OctreeEditPacketSender, contextID);
        const octreeEditPacketSender = ContextManager.get(contextID, OctreeEditPacketSender);

        const mockSoloNodeOfType = jest.spyOn(ContextManager.get(contextID, NodeList), "soloNodeOfType")
            .mockImplementation(() => {
                return {
                    getActiveSocket: () => {
                        return new SockAddr();
                    }
                };  // Entity server node.
            });
        const mockSendPacket = jest.spyOn(ContextManager.get(contextID, NodeList), "sendPacket")
            .mockImplementation((editMessage) => {
                expect(editMessage.getType()).toBe(PacketType.EntityEdit);  // eslint-disable-line
                mockSendPacket.mockRestore();
                mockSoloNodeOfType.mockRestore();
                done();
            });

        const nlPacket = new NLPacket(PacketType.EntityEdit);
        octreeEditPacketSender.queueOctreeEditMessage(nlPacket);  // eslint-disable-line @typescript-eslint/no-unsafe-call
    });

    // WEBRTC TODO: Test an NLPacketList can be sent to the entity server using an EntityAdd message.

});
