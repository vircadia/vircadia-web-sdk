//
//  OAuthAccessToken.unit.test.js
//
//  Created by David Rowe on 1 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import OAuthAccessToken from "../../../src/domain/networking/OAuthAccessToken";


describe("OAuthAccessToken - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can create an OAuthAccessToken", () => {
        const oAuthAccessToken = new OAuthAccessToken({
            /* eslint-disable camelcase */
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
            /* eslint-enable camelcase */
        });
        expect(oAuthAccessToken instanceof OAuthAccessToken).toBe(true);
        expect(oAuthAccessToken.token).toEqual("abcd");
        expect(oAuthAccessToken.tokenType).toEqual("efgh");
        expect(oAuthAccessToken.expiryTimestamp).toEqual(1234);
        expect(oAuthAccessToken.refreshToken).toEqual("ijkl");
    });

});
