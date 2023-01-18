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

import AccountManager, { AccountManagerAuth } from "../../../src/domain/networking/AccountManager";
import MetaverseAPI from "../../../src/domain/networking/MetaverseAPI";
import NetworkingConstants from "../../../src/domain/networking/NetworkingConstants";
import ContextManager from "../../../src/domain/shared/ContextManager";
import Url from "../../../src/domain/shared/Url";
import Uuid from "../../../src/domain/shared/Uuid";

import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;


describe("AccountManager - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */

    test("The AccountManager can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager instanceof AccountManager).toBe(true);
    });

    test("Can get the user's session ID", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        const sessionID = accountManager.getSessionID();
        expect(sessionID.value()).toBeGreaterThan(0n);
    });

    test("Can set and get the authURL", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.getAuthURL().toString()).toBe("");
        accountManager.setAuthURL(new Url("https://abc.def/ghi"));
        expect(accountManager.getAuthURL().toString()).toBe("https://abc.def/ghi");
    });

    test("The authURL returned is a copy", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        accountManager.setAuthURL(new Url("https://abc.def/ghi"));
        const authURL1 = accountManager.getAuthURL();
        const authURL2 = accountManager.getAuthURL();
        expect(authURL1.toString()).toBe(authURL2.toString());
        expect(authURL1).not.toBe(authURL2);
        authURL1.setPath("/jkl");
        expect(authURL1.toString()).not.toBe(authURL2.toString());
    });

    test("Can update the authURL from the metaverse server", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, MetaverseAPI);
        const accountManager = ContextManager.get(contextID, AccountManager);
        const metaverseAPI = ContextManager.get(contextID, MetaverseAPI);
        const SOME_URL = new Url("https://something.com/somewhere");
        metaverseAPI.setBaseUrl(SOME_URL);
        accountManager.updateAuthURLFromMetaverseServerURL();
        expect(accountManager.getAuthURL().toString()).toBe(SOME_URL.toString());
    });

    test("Can set and get a user name", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.getUsername()).toBe("");
        let logMessage = "";
        const log = jest.spyOn(console, "log").mockImplementation((...message) => {
            logMessage = message.join(" ");
        });
        accountManager.usernameChanged.connect((username) => {
            expect(username).toBe("newusername");
            expect(accountManager.getUsername()).toBe("newusername");
            expect(log).toHaveBeenCalledTimes(1);
            expect(logMessage).toBe("[networking] Username changed to newusername");
            log.mockRestore();
            done();
        });
        accountManager.setUsername("newusername");
    });

    test("Can get the user's account info", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        let logMessage = "";
        const log = jest.spyOn(console, "log").mockImplementation((...message) => {
            logMessage = message.join(" ");
        });
        accountManager.setUsername("someusername");
        expect(logMessage).toBe("[networking] Username changed to someusername");
        log.mockRestore();
        const accountInfo = accountManager.getAccountInfo();
        expect(accountInfo.getUsername()).toBe("someusername");
    });

    test("Can set an access token", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        accountManager.loginComplete.connect(() => {
            expect(true).toBe(true);
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

    test("Can determine if an access token needs to be refreshed", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        /* eslint-disable camelcase */

        // Empty token doesn't need to be refreshed.
        expect(accountManager.needsToRefreshToken()).toBe(false);

        // Token without an expiry doesn't need to be refreshed.
        accountManager.setAccessTokenFromJSON({
            access_token: "abcd",
            token_type: "efgh",
            // expires_in: 1234,
            refresh_token: "ijkl"
        });
        expect(accountManager.needsToRefreshToken()).toBe(false);

        // Token with an expiry > an hour away doesn't need to be refreshed.
        accountManager.setAccessTokenFromJSON({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 3605000,  // 1 hour plus 5 seconds.
            refresh_token: "ijkl"
        });
        expect(accountManager.needsToRefreshToken()).toBe(false);

        // Token with an expiry < an hour away needs to be refreshed.
        accountManager.setAccessTokenFromJSON({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 3595000,  // 1 hour minus 5 seconds.
            refresh_token: "ijkl"
        });
        expect(accountManager.needsToRefreshToken()).toBe(true);

        /* eslint-enable camelcase */
    });

    test("Can check whether there is a valid access token", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        /* eslint-disable camelcase */

        let errorMessage = "";
        const error = jest.spyOn(console, "error").mockImplementation((...message) => {
            errorMessage = message.join(" ");
        });

        // Invalid if there is no access token.
        expect(accountManager.hasValidAccessToken()).toBe(false);

        // Invalid if the access token has expired.
        accountManager.setAccessTokenFromJSON({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: -1,
            refresh_token: "ijkl"
        });
        expect(accountManager.hasValidAccessToken()).toBe(false);

        // Valid if the access token has not expired.
        accountManager.setAccessTokenFromJSON({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 5000,  // 5 seconds away.
            refresh_token: "ijkl"
        });
        expect(accountManager.hasValidAccessToken()).toBe(true);

        expect(errorMessage).toBe("[networking] AccountManager.refreshAccessToken() not implemented!");
        error.mockRestore();

        /* eslint-enable camelcase */
    });

    test("Can get whether the user is logged in", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        /* eslint-disable camelcase */

        // Invalid authURL and invalid token.
        expect(accountManager.isLoggedIn()).toBe(false);

        // Valid authURL but invalid token.
        accountManager.setAuthURL(new Url("https://abc.def/ghi"));
        expect(accountManager.isLoggedIn()).toBe(false);

        // Valid authURL and valid token.
        accountManager.setAccessTokenFromJSON({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 36005000,  // 1 hour 5 seconds away.
            refresh_token: "ijkl"
        });
        expect(accountManager.isLoggedIn()).toBe(true);

        /* eslint-enable camelcase */
    });

    test("Can log out", (done) => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        let signalsReceived = 0;
        accountManager.logoutComplete.connect(() => {
            signalsReceived += 1;
        });
        accountManager.usernameChanged.connect((username) => {
            expect(username).toBe("");
            signalsReceived += 1;
            setTimeout(() => {
                expect(signalsReceived).toBe(2);
                done();
            }, 200);
        });
        accountManager.logout();
    });

    test("Can determine whether there is a key pair", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.hasKeyPair()).toBe(false);
        // True case only occurs after public key has been successfully uploaded to the metaverse server.
    });

    test("The temporary domain key is \"\"", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.getTemporaryDomainKey(new Uuid(1234n))).toBe("");
    });

    test("Can get the metaverse server URL", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, MetaverseAPI);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.getMetaverseServerURL().toString()).toBe(NetworkingConstants.METAVERSE_SERVER_URL_STABLE);
    });

    test("Can get the metaverse server URL's path", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, MetaverseAPI);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager.getMetaverseServerURLPath()).toBe("/live");
        expect(accountManager.getMetaverseServerURLPath(false)).toBe("/live");
        expect(accountManager.getMetaverseServerURLPath(true)).toBe("/live/");
    });

    test("The metaverse server URL returned is a copy", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, MetaverseAPI);
        const accountManager = ContextManager.get(contextID, AccountManager);
        const metaverseServerURL1 = accountManager.getMetaverseServerURL();
        const metaverseServerURL2 = accountManager.getMetaverseServerURL();
        expect(metaverseServerURL1.toString()).toBe(metaverseServerURL2.toString());
        expect(metaverseServerURL1).not.toBe(metaverseServerURL2);
        metaverseServerURL1.setPath("/a/b/c");
        expect(metaverseServerURL1.toString()).not.toBe(metaverseServerURL2.toString());
    });

    test("Can create a request", () => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, MetaverseAPI);
        const accountManager = ContextManager.get(contextID, AccountManager);
        const request = accountManager.createRequest("/api/v1/user/heartbeat", AccountManagerAuth.Optional);
        expect(request.rawHeaders().get("HFM-SessionID")).toBe(accountManager.getSessionID().stringify());
        expect(request.url().toString()).toBe("https://metaverse.vircadia.com/live/api/v1/user/heartbeat");
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });

});
