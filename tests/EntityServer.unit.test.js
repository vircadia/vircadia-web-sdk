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

import Camera from "../src/Camera";
import DomainServer from "../src/DomainServer";
import EntityServer from "../src/EntityServer";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;


describe("EntityServer - unit tests", () => {

    test("Can create an EntityServer with a DomainServer", () => {
        const domainServer = new DomainServer();
        const camera = new Camera(domainServer.contextID);  // eslint-disable-line @typescript-eslint/no-unused-vars
        const entityServer = new EntityServer(domainServer.contextID);

        expect(entityServer instanceof EntityServer).toBe(true);
    });

});
