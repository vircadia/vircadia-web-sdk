//
//  AccountManager.unit.test.js
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManager from "../../../src/domain/networking/AccountManager";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("AccountManager - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */

    test("The AccountManager can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager instanceof AccountManager).toBe(true);
    });

    test("Can set and get a user name", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.getUsername()).toEqual("");
        accountManager.usernameChanged.connect((username) => {
            expect(username).toEqual("newusername");
            expect(accountManager.getUsername()).toEqual("newusername");
            done();
        });
        accountManager.setUsername("newusername");
    });

    test("Can set an access token", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager);
        const accountManager = ContextManager.get(contextID, AccountManager);
        accountManager.loginComplete.connect(() => {
            expect(true).toEqual(true);
            done();
        });
        accountManager.setAccessTokenFromJSON({
            /* eslint-disable camelcase */
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
            /* eslint-enable camelcase */
        });
    });

    test("Can log out", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager);
        const accountManager = ContextManager.get(contextID, AccountManager);
        let signalsReceived = 0;
        accountManager.logoutComplete.connect(() => {
            signalsReceived += 1;
        });
        accountManager.usernameChanged.connect((username) => {
            expect(username).toEqual("");
            signalsReceived += 1;
            setTimeout(() => {
                expect(signalsReceived).toEqual(2);
                done();
            }, 200);
        });
        accountManager.logout();
    });

});
