//
//  EntityEditPacketSender.unit.test.js
//
//  Created by David Rowe on 19 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import EntityEditPacketSender from "../../../src/domain/entities/EntityEditPacketSender";
import { EntityPropertyList } from "../../../src/domain/entities/EntityPropertyFlags";
import { EntityType } from "../../../src/domain/entities/EntityTypes";
import PacketScribe from "../../../src/domain/networking/packets/PacketScribe";
import PacketType from "../../../src/domain/networking/udt/PacketHeaders";
import AccountManager from "../../../src/domain/networking/AccountManager";
import AddressManager from "../../../src/domain/networking/AddressManager";
import NodeList from "../../../src/domain/networking/NodeList";
import NodePermissions from "../../../src/domain/networking/NodePermissions";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Uuid from "../../../src/domain/shared/Uuid";


describe("EntityEditPacketSender - unit tests", () => {

    test("An EntityEditPacketSender can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, EntityEditPacketSender, contextID);
        const entityEditPacketSender = ContextManager.get(contextID, EntityEditPacketSender);
        expect(entityEditPacketSender instanceof EntityEditPacketSender).toBe(true);
    });

    test("AVATAR_SELF_ID parentID property value is replaced with the user's session UUID", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, EntityEditPacketSender, contextID);
        const entityEditPacketSender = ContextManager.get(contextID, EntityEditPacketSender);

        const log = jest.spyOn(console, "log").mockImplementation((...message) => {
            const messageString = message.join(" ");
            const EXPECTED_MESSAGE_SLICE = "[networking] NodeList UUID changed from 00000000-0000-0000-0000-000000000000";
            expect(messageString.slice(0, EXPECTED_MESSAGE_SLICE.length)).toBe(EXPECTED_MESSAGE_SLICE);
        });

        const sessionUUID = Uuid.createUuid();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ContextManager.get(contextID, NodeList).setSessionUUID(sessionUUID);

        log.mockRestore();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        const originalWrite = PacketScribe.EntityEdit.write;
        const queueOctreeEditPacket = jest.spyOn(entityEditPacketSender, "queueOctreeEditMessage").mockImplementation(() => {
            queueOctreeEditPacket.mockRestore();
            PacketScribe.EntityEdit.write = originalWrite;
            done();
        });
        PacketScribe.EntityEdit.write = jest.fn((info) => {
            expect(info.properties.parentID).toBe(sessionUUID);
            return originalWrite(info);
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        entityEditPacketSender.queueEditEntityMessage(PacketType.EntityEdit, Uuid.createUuid(), {
            entityType: EntityType.Box,
            lastEdited: 0n,
            parentID: new Uuid(Uuid.AVATAR_SELF_ID)
        });
    });

    test("Private user data property is removed if user doesn't have necessary permissions", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, EntityEditPacketSender, contextID);
        const entityEditPacketSender = ContextManager.get(contextID, EntityEditPacketSender);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const newPermissions = new NodePermissions();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ContextManager.get(contextID, NodeList).setPermissions(newPermissions);

        expect.assertions(2);

        let testWithPermissions = false;

        // eslint-disable-next-line @typescript-eslint/unbound-method
        const originalWrite = PacketScribe.EntityEdit.write;
        const queueOctreeEditPacket = jest.spyOn(entityEditPacketSender, "queueOctreeEditMessage").mockImplementation(() => {
            if (testWithPermissions) {
                queueOctreeEditPacket.mockRestore();
                PacketScribe.EntityEdit.write = originalWrite;
                done();
            }
        });
        PacketScribe.EntityEdit.write = jest.fn((info) => {
            expect(info.requestedProperties.getHasProperty(EntityPropertyList.PROP_PRIVATE_USER_DATA))
                .toBe(testWithPermissions);
            return originalWrite(info);
        });

        testWithPermissions = false;
        newPermissions.permissions = NodePermissions.Permission.canAdjustLocks;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ContextManager.get(contextID, NodeList).setPermissions(newPermissions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        entityEditPacketSender.queueEditEntityMessage(PacketType.EntityEdit, Uuid.createUuid(), {
            entityType: EntityType.Box,
            lastEdited: 0n,
            privateUserData: "private user data",
            color: { red: 0, green: 0, blue: 0 }
        });

        testWithPermissions = true;
        newPermissions.permissions = NodePermissions.Permission.canGetAndSetPrivateUserData;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ContextManager.get(contextID, NodeList).setPermissions(newPermissions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        entityEditPacketSender.queueEditEntityMessage(PacketType.EntityEdit, Uuid.createUuid(), {
            entityType: EntityType.Box,
            lastEdited: 0n,
            privateUserData: "private user data",
            color: { red: 0, green: 0, blue: 0 }
        });
    });

});
