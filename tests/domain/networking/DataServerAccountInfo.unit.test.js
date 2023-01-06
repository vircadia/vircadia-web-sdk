//
//  DataServerAccountInfo.unit.test.js
//
//  Created by David Rowe on 1 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DataServerAccountInfo from "../../../src/domain/networking/DataServerAccountInfo";
import Uuid from "../../../src/domain/shared/Uuid";


describe("DataServerAccountInfo - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can set and get the domain ID", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        const domainID = new Uuid(1234n);
        expect(dataServerAccountInfo.getDomainID().value()).toBe(Uuid.NULL);
        dataServerAccountInfo.setDomainID(domainID);
        expect(dataServerAccountInfo.getDomainID().value()).toBe(domainID.value());
    });

    test("Can set and get the username", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });
        expect(dataServerAccountInfo.getUsername()).toBe("");
        dataServerAccountInfo.setUsername("something");
        expect(dataServerAccountInfo.getUsername()).toBe("something");
        log.mockReset();
    });

    test("Can set and get the access token", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        let accessToken = dataServerAccountInfo.getAccessToken();
        expect(accessToken.token).toBe("");
        expect(accessToken.tokenType).toBe("");
        expect(accessToken.expiryTimestamp).toBe(-1);
        expect(accessToken.refreshToken).toBe("");

        dataServerAccountInfo.setAccessTokenFromJSON({
            /* eslint-disable camelcase */
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
            /* eslint-enable camelcase */
        });
        accessToken = dataServerAccountInfo.getAccessToken();
        expect(accessToken.token).toBe("abcd");
        expect(accessToken.tokenType).toBe("efgh");
        expect(accessToken.expiryTimestamp / 10).toBeCloseTo((Date.now() + 1234) / 10, 0);
        expect(accessToken.refreshToken).toBe("ijkl");
    });

    test("Can set and query the private key", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        expect(dataServerAccountInfo.hasPrivateKey()).toBe(false);
        dataServerAccountInfo.setPrivateKey(new Uint8Array([0, 1]));
        expect(dataServerAccountInfo.hasPrivateKey()).toBe(true);
        dataServerAccountInfo.setPrivateKey(new Uint8Array());
        expect(dataServerAccountInfo.hasPrivateKey()).toBe(false);
    });

    test("The temporary domain key is \"\"", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();
        expect(dataServerAccountInfo.getTemporaryDomainKey(new Uuid(1234n))).toBe("");
    });

});
