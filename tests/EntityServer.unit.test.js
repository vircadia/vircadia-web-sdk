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

import { EntityHostType } from "../src/domain/entities/EntityHostType";
import { EntityType } from "../src/domain/entities/EntityTypes";
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
        expect(uuid.isNull()).toBe(true);
        expect(errorMessage).toBe("[EntityServer] addEntity() called with invalid entity properties!");

        // Missing entity type.
        uuid = entityServer.addEntity({ name: "something" });
        expect(uuid.isNull()).toBe(true);
        expect(errorMessage).toBe("[EntityServer] addEntity() called with invalid entity type!");

        // Invalid host type.
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, 7);
        expect(uuid.isNull()).toBe(true);
        expect(errorMessage).toBe("[EntityServer] addEntity() called with invalid entity hostType!");

        // Unsupported host type.
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, EntityHostType.AVATAR);
        expect(uuid.isNull()).toBe(true);
        expect(errorMessage).toBe("[EntityServer] addEntity() called with unsupported entity hostType!");

        // Successful call in contrast.
        errorMessage = "";
        uuid = entityServer.addEntity({ entityType: EntityType.Shape }, EntityHostType.DOMAIN);
        expect(uuid.isNull()).toBe(false);
        expect(errorMessage).toBe("");

        error.mockRestore();
    });

});
