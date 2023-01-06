//
//  OAuthAccessToken.ts
//
//  Created by David Rowe on 1 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { OAuthJSON } from "../interfaces/AccountInterface";


/*@devdoc
 *  The <code>OAuthAccessToken</code> class implements an OAuth access token.
 *  @class OAuthAccessToken
 *  @param {OAuthJSON} jsonObject - A OAuth JSON object to create the access token from.
 *
 *  @property {string} token - The token.
 *      <em>Read-only.</em>
 *  @property {string} tokenType - The token type.
 *      <em>Read-only.</em>
 *  @property {number} expiryTimestamp - How long the access token is valid for, in seconds.
 *      <em>Read-only.</em>
 *  @property {string} refreshToken] - The refresh token.
 *      <em>Read-only.</em>
 */
class OAuthAccessToken {
    // C++  class OAuthAccessToken : public QObject

    #_token = "";
    #_refreshToken = "";
    #_expiryTimestamp = -1;
    #_tokenType = "";

    constructor(jsonObject: OAuthJSON) {
        // C++  OAuthAccessToken(const QJsonObject& jsonObject)
        this.#_token = jsonObject.access_token ?? "";
        this.#_refreshToken = jsonObject.refresh_token ?? "";
        this.#_expiryTimestamp = jsonObject.expires_in ? Date.now() + jsonObject.expires_in : -1;
        this.#_tokenType = jsonObject.token_type ?? "";
    }

    get token(): string {
        return this.#_token;
    }

    get refreshToken(): string {
        return this.#_refreshToken;
    }

    get expiryTimestamp(): number {
        return this.#_expiryTimestamp;
    }

    get tokenType(): string {
        return this.#_tokenType;
    }


    /*@devdoc
     *  Gets whether the token, if it has an expiry, has expired.
     *  @returns {boolean} <code>true<code> if the token has an expiry and it has expired, <code>false</code> if not.
     */
    isExpired(): boolean {
        // C++  bool isExpired() const
        return this.#_expiryTimestamp !== -1 && this.#_expiryTimestamp <= Date.now();
    }

    /*@devdoc
     *  Gets the authorization header value - <code>"Bearer "</code> followed by the token.
     *  @returns {string} The authorization header value.
     */
    authorizationHeaderValue(): string {
        // C++  QByteArray authorizationHeaderValue() const
        return "Bearer " + this.#_token;
    }


}

export default OAuthAccessToken;
export type { OAuthJSON };
