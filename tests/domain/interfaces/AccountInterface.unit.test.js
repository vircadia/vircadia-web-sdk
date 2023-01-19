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

import AccountManagerMock from "../../../mocks/domain/networking/AccountManager.mock.js";
AccountManagerMock.mock();

import AccountInterface from "../../../src/domain/interfaces/AccountInterface";
import AccountManager from "../../../src/domain/networking/AccountManager";
import NetworkingConstants from "../../../src/domain/networking/NetworkingConstants";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Url from "../../../src/domain/shared/Url";
import DomainServer from "../../../src/DomainServer";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;


describe("AccountInterface - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-unsafe-call */

    const contextID = ContextManager.createContext();
    ContextManager.set(contextID, AccountManager, contextID);
    const accountManager = ContextManager.get(contextID, AccountManager, contextID);
    accountManager.setAuthURL(new Url(NetworkingConstants.METAVERSE_SERVER_URL_STABLE));

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

    test("Can access the signals", () => {
        const accountInterface = new AccountInterface(contextID);
        expect(typeof accountInterface.authRequired.connect).toBe("function");
    });

    test("Error if try to login with invalid username", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(error).toHaveBeenCalledTimes(0);
        accountInterface.login(undefined, validOAuthJSON);
        expect(error).toHaveBeenCalledTimes(1);
        accountInterface.login("", validOAuthJSON);
        expect(accountInterface.isLoggedIn()).toBe(false);
        expect(error).toHaveBeenCalledTimes(2);
        error.mockReset();
    });

    test("Error if try to login with error in OAuth JSON", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(error).toHaveBeenCalledTimes(0);
        accountInterface.login("me", errorOAuthJSON);
        expect(error).toHaveBeenCalledTimes(1);
        expect(accountInterface.isLoggedIn()).toBe(false);
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
        expect(accountInterface.isLoggedIn()).toBe(false);
        error.mockReset();
    });

    test("Success if try to login with valid username and valid OAuth JSON", () => {
        const accountInterface = new AccountInterface(contextID);
        let logMessage = "";
        const log = jest.spyOn(console, "log").mockImplementation((...message) => {
            logMessage = message.join(" ");
        });
        expect(accountInterface.isLoggedIn()).toBe(false);
        accountInterface.login("me", validOAuthJSON);
        expect(accountInterface.isLoggedIn()).toBe(true);
        expect(log).toHaveBeenCalledTimes(1);
        expect(logMessage).toBe("[networking] Username changed to me");
        log.mockReset();
    });

    test("Can log out when logged in", () => {
        const accountInterface = new AccountInterface(contextID);
        accountInterface.login("me", validOAuthJSON);
        expect(accountInterface.isLoggedIn()).toBe(true);
        accountInterface.logout();
        expect(accountInterface.isLoggedIn()).toBe(false);
    });

    test("Can log out when not logged in", () => {
        const accountInterface = new AccountInterface(contextID);
        const error = jest.spyOn(console, "error").mockImplementation(() => { /* no-op */ });
        expect(accountInterface.isLoggedIn()).toBe(false);
        accountInterface.logout();
        expect(accountInterface.isLoggedIn()).toBe(false);
        expect(error).toHaveBeenCalledTimes(0);
        error.mockReset();
    });

});
