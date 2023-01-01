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


describe("DataServerAccountInfo - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can set the username", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();
        expect(dataServerAccountInfo.getUsername()).toEqual("");
        dataServerAccountInfo.setUsername("something");
        expect(dataServerAccountInfo.getUsername()).toEqual("something");
    });

    test("Can set the access token", () => {
        const dataServerAccountInfo = new DataServerAccountInfo();

        let accessToken = dataServerAccountInfo.getAccessToken();
        expect(accessToken.token).toEqual("");
        expect(accessToken.tokenType).toEqual("");
        expect(accessToken.expiryTimestamp).toEqual(-1);
        expect(accessToken.refreshToken).toEqual("");

        dataServerAccountInfo.setAccessTokenFromJSON({
            /* eslint-disable camelcase */
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
            /* eslint-enable camelcase */
        });
        accessToken = dataServerAccountInfo.getAccessToken();
        expect(accessToken.token).toEqual("abcd");
        expect(accessToken.tokenType).toEqual("efgh");
        expect(accessToken.expiryTimestamp).toEqual(1234);
        expect(accessToken.refreshToken).toEqual("ijkl");
    });

});
