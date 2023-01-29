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
import "../shared/DataViewExtensions";
import Uuid from "../shared/Uuid";
import UDT from "./udt/UDT";
import OAuthAccessToken from "./OAuthAccessToken";


/*@devdoc
 *  The <code>DataServerAccountInfo</code> class is used to hold information about the user's metaverse account.
 *  <p>C++: <code>class DataServerAccountInfo : public QObject</code></p>
 *  @class DataServerAccountInfo
 */
class DataServerAccountInfo {
    // C++  class DataServerAccountInfo : public QObject

    #_username = "";
    #_accessToken = new OAuthAccessToken({});
    #_privateKey = new Uint8Array();

    #_domainID = new Uuid();
    #_temporaryDomainID = new Uuid();
    #_temporaryDomainApiKey = "";
    #_EMPTY_KEY = "";


    /*@devdoc
     *  Gets the current domain ID.
     *  @returns {Uuid} The current domain ID.
     */
    getDomainID(): Uuid {
        // C++  const QUuid& getDomainID()
        return this.#_domainID;
    }

    /*@devdoc
     *  Sets the current domain ID.
     *  @param {Uuid} domainID - The current domain ID.
     */
    setDomainID(domainID: Uuid): void {
        // C++  void setDomainID(const QUuid& domainID)
        this.#_domainID = domainID;
    }

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
     *  Gets the signature of the user name plus the connection token provided by the domain server.
     *  @async
     *  @param {Uuid} connectionToken - The connection token provided by the domain server.
     *  @returns {Uint8Array} The signature of the user name plus the connection token.
     */
    async getUsernameSignature(connectionToken: Uuid): Promise<Uint8Array> {
        // C++  QByteArray getUsernameSignature(const QUuid& connectionToken)

        // plaintext = lowercaseUsername + connectionToken
        const lowercaseUsername = new TextEncoder().encode(this.#_username.toLowerCase());
        const plaintext = new Uint8Array(lowercaseUsername.length + Uuid.NUM_BYTES_RFC4122_UUID);
        plaintext.set(lowercaseUsername);
        new DataView(plaintext.buffer).setBigUint128(lowercaseUsername.length, connectionToken.value(), UDT.BIG_ENDIAN);

        const signature = await this.signPlaintext(plaintext);
        if (signature.length > 0) {
            console.log("[networking] Returning username", this.#_username, "signed with connection UUID",
                connectionToken.stringify());
        } else {
            console.log("[networking] Error signing username with connection token.",
                "Will re-attempt on next domain-server check in.");
        }

        return signature;
    }

    /*@devdoc
     *  Gets the temporary key for a domain.
     *  @param {Uuid} domainID - The domain to get the temporary key for.
     */
    getTemporaryDomainKey(domainID: Uuid): string {
        // C++  const QString& getTemporaryDomainKey(const QUuid& domainID)
        // Always returns EMPTY_KEY for user client.
        return domainID.value() === this.#_temporaryDomainID.value() ? this.#_temporaryDomainApiKey : this.#_EMPTY_KEY;
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

    /*@devdoc
     *  Gets whether there is a private key.
     *  @returns {boolean} <code>true</code> if there is a private key, <code>false</code> if there isn't.
     */
    hasPrivateKey(): boolean {
        // C++  bool hasPrivateKey()
        return this.#_privateKey.length > 0;
    }

    /*@devdoc
     *  Sets a private key.
     *  @param {Uint8Array} privateKey - The private key. Use an empty (zero-length) value to clear the private key.
     */
    setPrivateKey(privateKey: Uint8Array): void {
        // C++  void setPrivateKey(const QByteArray& privateKey)
        this.#_privateKey = privateKey;
    }

    /*@devdoc
     *  Signs a plain text item with the private key.
     *  @async
     *  @param {Uint8Array} plaintext - The plain text item to sign.
     *  @returns {Uint8Array} The signature of the plain text signed with the private key.
     */
    async signPlaintext(plaintext: Uint8Array): Promise<Uint8Array> {
        // C++  QByteArray signPlaintext(const QByteArray& plaintext)
        if (this.#_privateKey.length > 0) {
            const cryptoKey = await crypto.subtle.importKey(
                "pkcs8",
                this.#_privateKey,
                {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: "SHA-256"
                },
                false,
                ["sign"]
            );

            // Unlike the C++, we don't hash the plaintext ourselves because crypto.suble.sign() hashes it for us.
            const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, plaintext);
            return new Uint8Array(signature);
        }
        return new Uint8Array();
    }

}

export default DataServerAccountInfo;
