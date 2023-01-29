//
//  MessagesClient.unit.test.js
//
//  Created by David Rowe on 2 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManagerMock from "../../../mocks/domain/networking/AccountManager.mock.js";
AccountManagerMock.mock();

import DomainServer from "../../../src/DomainServer";
import MessagesClient from "../../../src/domain/networking/MessagesClient";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;


describe("MessagesClient - unit tests", () => {

    test("Can subscribe to and unsubscribe from a channel", () => {
        const domainServer = new DomainServer();
        const messagesClient = new MessagesClient(domainServer.contextID);

        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        messagesClient.subscribe("com.vircadia.test.unit");
        messagesClient.unsubscribe("com.vircadia.test.unit");
        expect(error).toHaveBeenCalledTimes(0);
        error.mockReset();
    });

});
