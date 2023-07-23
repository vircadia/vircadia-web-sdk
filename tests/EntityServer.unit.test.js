//
//  EntityServer.unit.test.js
//
//  Created by Julien Merzoug on 26 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManagerMock from "../mocks/domain/networking/AccountManager.mock.js";
AccountManagerMock.mock();

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import { HostType } from "../src/domain/entities/EntityItem";
import { EntityType } from "../src/domain/entities/EntityTypes";
import Uuid from "../src/domain/shared/Uuid";
import Camera from "../src/Camera";
import DomainServer from "../src/DomainServer";
import EntityServer from "../src/EntityServer";


describe("EntityServer - unit tests", () => {

    test("Can create an EntityServer with a DomainServer", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);  // eslint-disable-line @typescript-eslint/no-unused-vars
        const entityServer = new EntityServer(domainServer.contextID);

        expect(entityServer instanceof EntityServer).toBe(true);
    });

    test("Can get user permissions", () => {

        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);  // eslint-disable-line @typescript-eslint/no-unused-vars
        const entityServer = new EntityServer(domainServer.contextID);

        expect(typeof entityServer.canRez).toBe("boolean");
        expect(typeof entityServer.canRezChanged.connect).toBe("function");
        expect(typeof entityServer.canRezChanged.disconnect).toBe("function");
        expect(typeof entityServer.canRezTemp).toBe("boolean");
        expect(typeof entityServer.canRezTempChanged.connect).toBe("function");
        expect(typeof entityServer.canRezTempChanged.disconnect).toBe("function");
        expect(typeof entityServer.canGetAndSetPrivateUserData).toBe("boolean");
        expect(typeof entityServer.canGetAndSetPrivateUserDataChanged.connect).toBe("function");
        expect(typeof entityServer.canGetAndSetPrivateUserDataChanged.disconnect).toBe("function");
    });

    test("Calling addEntity() with invalid parameters generates errors", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);  // eslint-disable-line @typescript-eslint/no-unused-vars
        const entityServer = new EntityServer(domainServer.contextID);

        let errorMessage = "";
        const error = jest.spyOn(console, "error").mockImplementation((...message) => {
            errorMessage = message.join(" ");
        });

        // No parameters.
        let uuid = entityServer.addEntity();
        expect(errorMessage).toBe("[EntityServer] addEntity() called with invalid entity properties!");
        expect(uuid.isNull()).toBe(true);

        // Missing entity type.
        uuid = entityServer.addEntity({ name: "something" });
        expect(errorMessage).toBe("[EntityServer] addEntity() called with invalid entity type!");
        expect(uuid.isNull()).toBe(true);

        // Invalid host type.
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, 7);
        expect(errorMessage).toBe("[EntityServer] addEntity() called with invalid entity hostType!");
        expect(uuid.isNull()).toBe(true);

        // Unsupported host type.
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, HostType.AVATAR);
        expect(errorMessage).toBe("[EntityServer] addEntity() for avatar entities not implemented!");
        expect(uuid.isNull()).toBe(true);
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, HostType.LOCAL);
        expect(errorMessage).toBe("[EntityServer] addEntity() for local entities not implemented!");
        expect(uuid.isNull()).toBe(true);

        // Successful call.
        errorMessage = "";
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, HostType.DOMAIN);
        expect(errorMessage).toBe("");
        expect(uuid.isNull()).toBe(false);

        error.mockRestore();
    });

    test("Calling editEntity() with invalid parameters generates errors", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);  // eslint-disable-line @typescript-eslint/no-unused-vars
        const entityServer = new EntityServer(domainServer.contextID);

        let warnMessage = "";
        const warn = jest.spyOn(console, "warn").mockImplementation((...message) => {
            warnMessage = message.join(" ");
        });
        let errorMessage = "";
        const error = jest.spyOn(console, "error").mockImplementation((...message) => {
            errorMessage = message.join(" ");
        });

        // No parameters.
        let uuid = entityServer.editEntity();
        expect(warnMessage).toBe("");
        expect(errorMessage).toBe("[EntityServer] editEntity() called with invalid entity ID!");
        expect(uuid.isNull()).toBe(true);

        // Invalid ID.
        uuid = entityServer.editEntity("string");
        expect(warnMessage).toBe("");
        expect(errorMessage).toBe("[EntityServer] editEntity() called with invalid entity ID!");
        expect(uuid.isNull()).toBe(true);

        // Invalid properties.
        uuid = entityServer.editEntity(Uuid.createUuid(), "string");
        expect(warnMessage).toBe("");
        expect(errorMessage).toBe("[EntityServer] editEntity() called with invalid entity properties!");
        expect(uuid.isNull()).toBe(true);

        // Required properties missing.
        uuid = entityServer.editEntity(Uuid.createUuid(), {
            color: { red: 255, green: 255, blue: 255 }
        });
        expect(warnMessage).toBe("");
        expect(errorMessage).toBe("[EntityServer] editEntity() called with invalid entity type value!");
        expect(uuid.isNull()).toBe(true);
        uuid = entityServer.editEntity(Uuid.createUuid(), {
            entityType: EntityType.Box,
            color: { red: 255, green: 255, blue: 255 }
        });
        expect(warnMessage).toBe("");
        expect(errorMessage).toBe("[EntityServer] editEntity() called with invalid lastEdited value!");
        expect(uuid.isNull()).toBe(true);

        // Valid properties.
        errorMessage = "";
        const MS_TO_TICKS = 10000n;
        uuid = entityServer.editEntity(Uuid.createUuid(), {
            entityType: EntityType.Box,
            lastEdited: BigInt(Date.now()) * MS_TO_TICKS,
            color: { red: 255, green: 255, blue: 255 }
        });
        expect(warnMessage).toBe("[EntityServer] Could not send edit message because not connected.");
        expect(errorMessage).toBe("");
        expect(uuid.isNull()).toBe(true);

        warn.mockRestore();
        error.mockRestore();
    });

});
