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
        /* eslint-disable camelcase */
        const startDate = Date.now();
        const oAuthAccessToken = new OAuthAccessToken({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
        });
        expect(oAuthAccessToken instanceof OAuthAccessToken).toBe(true);
        expect(oAuthAccessToken.token).toBe("abcd");
        expect(oAuthAccessToken.tokenType).toBe("efgh");
        expect((oAuthAccessToken.expiryTimestamp - startDate) / 10).toBeCloseTo(123.4, 0);
        expect(oAuthAccessToken.refreshToken).toBe("ijkl");
        /* eslint-enable camelcase */
    });

    test("Can check whether an access token has expired", () => {
        /* eslint-disable camelcase */
        expect(new OAuthAccessToken({
            access_token: "abcd",
            token_type: "efgh",
            // expires_in: 1234,
            refresh_token: "ijkl"
        }).isExpired()).toBe(false);
        expect(new OAuthAccessToken({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
        }).isExpired()).toBe(false);
        expect(new OAuthAccessToken({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: -100,
            refresh_token: "ijkl"
        }).isExpired()).toBe(true);
        /* eslint-enable camelcase */
    });

    test("Can get the authorization header value", () => {
        /* eslint-disable camelcase */
        const oAuthAccessToken = new OAuthAccessToken({
            access_token: "abcd",
            token_type: "efgh",
            expires_in: 1234,
            refresh_token: "ijkl"
        });
        expect(oAuthAccessToken.authorizationHeaderValue()).toBe("Bearer abcd");
        /* eslint-enable camelcase */
    });

});
