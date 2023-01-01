//
//  DataServerAccountInfo.ts
//
//  Created by David Rowe on 1 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { OAuthJSON } from "../interfaces/AccountInterface";
import OAuthAccessToken from "./OAuthAccessToken";


/*@devdoc
 *  The <code>DataServerAccountInfo</code> class is used to hold information about the user's metaverse account.
 *  @class DataServerAccountInfo
 *
 */
class DataServerAccountInfo {
    // C++  class DataServerAccountInfo : public QObject

    #_username = "";
    #_accessToken = new OAuthAccessToken({});


    /*@devdoc
     *  Gets the user's username.
     *  @returns {string} The user's username.
     */
    getUsername(): string {
        // C++  const QString& getUsername()
        return this.#_username;
    }

    /*@devdoc
     *  Sets the user's username.
     *  @param {string} username - The user's username.
     */
    setUsername(username: string): void {
        // C++  void setUsername(const QString& username)
        if (username !== this.#_username) {
            this.#_username = username;
            console.log("[networking] Username changed to", username);
        }
    }

    /*@devdoc
     *  Gets the current OAuth access token.
     *  @returns {OAuthAccessToken} The current OAuth access token.
     */
    getAccessToken(): OAuthAccessToken {
        // C++  const OAuthAccessToken& getAccessToken()
        return this.#_accessToken;
    }

    /*@devdoc
     *  Sets the OAuth access token from a JSON object.
     *  @param {OAuthJSON} jsonObject - The JSON containing the OAuth token details.
     */
    setAccessTokenFromJSON(jsonObject: OAuthJSON): void {
        // C++  void setAccessTokenFromJSON(const QJsonObject& jsonObject)
        this.#_accessToken = new OAuthAccessToken(jsonObject);
    }

}

export default DataServerAccountInfo;
