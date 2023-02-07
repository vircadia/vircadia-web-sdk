//
//  AccountManager.integration.test.js
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

import AccountManager from "../../../src/domain/networking/AccountManager";
import MetaverseAPI from "../../../src/domain/networking/MetaverseAPI";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("AccountManager - integration tests", () => {

    /* eslint-disable @typescript-eslint/no-unsafe-call */

    test("Can generate a new user key pair", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, MetaverseAPI);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.hasKeyPair()).toBe(false);
        // Public key upload to metaverse should fail because we're not authenticated.
        const log = jest.spyOn(console, "log").mockImplementation(/* no-op */);
        const warn = jest.spyOn(console, "warn").mockImplementation((...message) => {
            const errorMessage = message.join(" ");
            expect(errorMessage.startsWith("[networking] Public key upload to metaverse failed")).toBe(true);
            expect(errorMessage.endsWith("Not authenticated")).toBe(true);
            expect(accountManager.hasKeyPair()).toBe(false);  // Only true if public key has been uploaded to the metaverse.
            warn.mockReset();
            log.mockReset();
            done();
        });
        accountManager.generateNewUserKeypair();
    });

});
