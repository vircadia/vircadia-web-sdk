//
//  AccountInterface.unit.test.js
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountInterface from "../../../src/domain/interfaces/AccountInterface";
import AccountManager from "../../../src/domain/networking/AccountManager";
import ContextManager from "../../../src/domain/shared/ContextManager";
import DomainServer from "../../../src/DomainServer";


describe("AccountInterface - unit tests", () => {

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager);

    /* eslint-disable camelcase */
    const validOAuthJSON = {
        access_token: "abcd",
        token_type: "efgh",
        expires_in: 1234,
        refresh_token: "ijkl"
    };
    const errorOAuthJSON = {
        access_token: "abcd",
        token_type: "efgh",
        expires_in: 1234,
        refresh_token: "ijkl",
        error: "invalid",
        error_description: "error description"
    };
    /* eslint-enable camelcase */

    test("Can access the account interface", () => {
        const domainServer = new DomainServer();
        expect(domainServer.account instanceof AccountInterface).toBe(true);
    });

    test("Error if try to login with invalid username", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(error).toHaveBeenCalledTimes(0);
        accountInterface.login(undefined, validOAuthJSON);
        expect(error).toHaveBeenCalledTimes(1);
        accountInterface.login("", validOAuthJSON);
        expect(error).toHaveBeenCalledTimes(2);
        error.mockReset();
    });

    test("Error if try to login with error in OAuth JSON", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(error).toHaveBeenCalledTimes(0);
        accountInterface.login("me", errorOAuthJSON);
        expect(error).toHaveBeenCalledTimes(1);
        error.mockReset();
    });

    test("Error if try to login with invalid OAuth JSON", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(error).toHaveBeenCalledTimes(0);
        /* eslint-disable camelcase */
        accountInterface.login("me", {
            accesstoken: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
        });
        expect(error).toHaveBeenCalledTimes(1);
        accountInterface.login("me", {
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refreshtoken: "ijkl"
        });
        /* eslint-enable camelcase */
        expect(error).toHaveBeenCalledTimes(2);
        error.mockReset();
    });

    test("Success if try to login with valid username and valid OAuth JSON", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(error).toHaveBeenCalledTimes(0);
        accountInterface.login("me", validOAuthJSON);
        expect(error).toHaveBeenCalledTimes(0);
        error.mockReset();
    });

});
