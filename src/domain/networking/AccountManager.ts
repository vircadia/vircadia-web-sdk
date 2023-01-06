//
//  AccountManager.ts
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { OAuthJSON } from "../interfaces/AccountInterface";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Url from "../shared/Url";
import Uuid from "../shared/Uuid";
import DataServerAccountInfo from "./DataServerAccountInfo";
import MetaverseAPI from "./MetaverseAPI";


/*@sdkdoc
 *  The <code>AccountManagerAuth</code> namespace provides types of authentication.
 *  @namespace AccountManagerAuth
 *  @property {number} None=0 - No authentication is required.
 *  @property {number} Required=1 - Authentication is required.
 *  @property {number} Optional=2 - Authentication is optional.
 */
enum AccountManagerAuth {
    // C++  namespace AccountManagerAuth
    None = 0,
    Required,
    Optional
}


/*@devdoc
 *  The <code>AccountManager</code> class manages the user's account on the domain.
 *  @class AccountManager
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @property {Signal<AccountManager~UsernameChanged>} usernameChanged - Triggered when the username changes.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~LoginComplete>} loginComplete - Triggered when the user completes their login.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~LogoutComplete>} logoutComplete - Triggered when the user logs out.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~NewKeypair>} newKeypair - Triggered when a new key pair for the user has been uploaded to
 *      the metaverse.
 *      <em>Read-only.</em>
 */
class AccountManager {
    // C++  class AccountManager : public QObject, public Dependency

    static readonly contextItemType = "AccountManager";


    #_contextID: number;

    #_accountInfo = new DataServerAccountInfo();
    #_usernameChanged = new SignalEmitter();
    #_loginComplete = new SignalEmitter();
    #_logoutComplete = new SignalEmitter();
    #_newKeypair = new SignalEmitter();

    #_isWaitingForKeypairResponse = false;
    #_pendingPrivateKey = new Uint8Array();
    #_pendingPublicKey = new Uint8Array();

    #_METAVERSE_SESSION_ID_HEADER = "HFM-SessionID";
    #_ACCESS_TOKEN_AUTHORIZATION_HEADER = "Authorization";
    #_sessionID = Uuid.createUuid();
    #_authURL = new Url();
    #_isWaitingForTokenRefresh = false;

    #_VERBOSE_HTTP_REQUEST_DEBUGGING = false;


    /*@sdkdoc
     *  Called when the username changes.
     *  @callback AccountManager~UsernameChanged
     *  @param {string} username - The new username.
     */
    get usernameChanged(): Signal {
        return this.#_usernameChanged.signal();
    }

    /*@sdkdoc
     *  Called when the user completes their login.
     *  @callback AccountManager~LoginComplete
     *  @param {Url} authURL -  The authentication URL on the metaverse server.
     */
    get loginComplete(): Signal {
        return this.#_loginComplete.signal();
    }

    /*@sdkdoc
     *  Called when a new key pair for the user has been uploaded to the metaverse.
     *  @callback AccountManager~NewKeypair
     */
    get newKeypair(): Signal {
        return this.#_newKeypair.signal();
    }

    /*@sdkdoc
     *  Called when the user logs out.
     *  @callback AccountManager~LogoutComplete
     */
    get logoutComplete(): Signal {
        return this.#_logoutComplete.signal();
    }


    constructor(contextID: number) {
        // C++  AccountManager(bool accountSettingsEnabled, UserAgentGetter userAgentGetter)

        // Just use the browser's default UserAgent.

        this.#_contextID = contextID;

        // WEBRTC TODO: Address further C++ code.

        this.#_loginComplete.connect(() => {
            void this.#uploadPublicKey();
        });

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Gets the metaverse server authentication URL.
     *  @returns {string} The metaverse server authentication URL.
     */
    getAuthURL(): Url {
        // C++  const QUrl& getAuthURL() const
        return this.#_authURL;
    }

    /*@devdoc
     *  Sets the metaverse server authentication URL.
     *  @param {string} authURL - The metaverse server authentication URL.
     */
    setAuthURL(authURL: Url): void {
        // C++  void setAuthURL(const QUrl& authURL)

        if (authURL.toString() !== this.#_authURL.toString()) {
            this.#_authURL = authURL;

            // WEBRTC TODO: Address further C++ code - user account info and profile.

            if (this.needsToRefreshToken()) {
                this.refreshAccessToken();
            }

            if (this.isLoggedIn()) {
                this.#_loginComplete.emit(this.#_authURL);
            }

            // authEndpointChanged signal not implemented - it isn't used in C++.
        }
    }

    /*@devdoc
     *  Updates the metaverse server authentication URL with that set in the {@link MetaverseAPI}.
     */
    updateAuthURLFromMetaverseServerURL(): void {
        // C++  void updateAuthURLFromMetaverseServerURL() {
        const metaverseAPI = ContextManager.get(this.#_contextID, MetaverseAPI) as MetaverseAPI;
        this.setAuthURL(metaverseAPI.getCurrentMetaverseServerURL());
    }

    /*@devdoc
     *  Sets the user's username.
     *  @param {string} username - The user's username.
     */
    setUsername(username: string): void {
        // C++  void requestProfileFinished()

        // WEBRTC TODO: Address further C++ code.

        this.#_accountInfo.setUsername(username);

        // WEBRTC TODO: Address further C++ code.

        this.#_usernameChanged.emit(this.#_accountInfo.getUsername());

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Gets the user's username.
     *  @returns {string} The user's username.
     */
    getUsername(): string {
        // C++  N/A
        return this.#_accountInfo.getUsername();
    }

    /*@devdoc
     *  Sets the access token from a JSON object.
     *  @param {OAuthJSON} json - The JSON object containing the access token details.
     */
    setAccessTokenFromJSON(json: OAuthJSON): void {
        // void requestAccessTokenFinished()

        // WEBRTC TODO: Address further C++ code.

        this.#_accountInfo.setAccessTokenFromJSON(json);

        this.#_loginComplete.emit();

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Refreshes the current access token.
     */
    // eslint-disable-next-line class-methods-use-this
    refreshAccessToken(): void {
        // C++  void refreshAccessToken()

        // WEBRTC TODO: Address C++ code.

        console.error("[networking] AccountManager.refreshAccessToken() not implemented!");

    }

    /*@devdoc
     *  Gets whether the token is valid and needs to be refreshed - it expires within an hour.
     *  @returns {boolean} <code>true</code> if a valid token and it needs to be refreshed, <code>false</code> if it doesn't.
     */
    needsToRefreshToken(): boolean {
        // C++  bool needsToRefreshToken()
        if (this.#_accountInfo.getAccessToken().token !== "" && this.#_accountInfo.getAccessToken().expiryTimestamp > 0) {
            const MIN_REMAINING_MS = 3600000;  // 1h
            const expireThreshold = Date.now() + MIN_REMAINING_MS;
            return this.#_accountInfo.getAccessToken().expiryTimestamp < expireThreshold;
        }
        return false;
    }

    /*@devdoc
     *  Checks whether there is a valid access token for the metaverse server. If there is a valid access token and it needs a
     *  refresh then refreshing the token is initiated.
     *  @returns {boolean} <code>true</code> if there is a valid access token, <code>false<code> if there isn't.
     */
    hasValidAccessToken(): boolean {
        // C++  bool hasValidAccessToken()

        if (this.#_accountInfo.getAccessToken().token === "" || this.#_accountInfo.getAccessToken().isExpired()) {
            if (this.#_VERBOSE_HTTP_REQUEST_DEBUGGING) {
                console.debug("[networking] An access token is required for requests to", this.#_authURL.toString());
            }
            return false;
        }

        if (!this.#_isWaitingForTokenRefresh && this.needsToRefreshToken()) {
            this.refreshAccessToken();
        }

        return true;
    }


    /*@devdoc
     *  Gets whether that user is logged in.
     *  @returns {boolean} <code>true</code> if the user is logged in, <code>false</code> if they aren't.
     */
    isLoggedIn(): boolean {
        // C++  bool isLoggedIn()
        return !this.#_authURL.isEmpty() && this.hasValidAccessToken();
    }

    /*@devdoc
     *  Logs the user out.
     */
    logout(): void {
        // C++  void logout()

        // WEBRTC TODO: Address further C++ code.

        // A logout means we want to delete the DataServerAccountInfo we currently have.
        this.#_accountInfo = new DataServerAccountInfo();

        // WEBRTC TODO: Address further C++ code.

        this.#_logoutComplete.emit();

        // The username has been cleared.
        this.#_usernameChanged.emit("");

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Gets the temporary key for a domain.
     *  @param {Uuid} domainID - The domain to get the temporary key for.
     */
    getTemporaryDomainKey(domainID: Uuid): string {
        // C++  const QString& getTemporaryDomainKey(const QUuid& domainID)
        return this.#_accountInfo.getTemporaryDomainKey(domainID);
    }

    /*@devdoc
     *  Gets whether there is a key pair.
     *  @returns {boolean} <code>true</code> if there is a key pair, <code>false</code> if there isn't.
     */
    hasKeyPair(): boolean {
        // C++  bool hasKeyPair() const
        return this.#_accountInfo.hasPrivateKey();
    }

    /*@devdoc
     *  Generates a new pair of private and public user keys.
     */
    generateNewUserKeypair(): void {
        // C++  void generateNewUserKeypair()
        void this.#generateNewKeypair();
    }


    /*@devdoc
     *  Gets the user's session ID on the domain.
     *  @returns {Uuid} The user's session ID on the domain.
     */
    getSessionID(): Uuid {
        // C++  QUuid getSessionID() const
        return this.#_sessionID;
    }


    /*@devdoc
     *  Gets the metaverse server URL.
     *  @returns {Url} The metaverse server URL.
     */
    getMetaverseServerURL(): Url {
        // C++  QUrl getMetaverseServerURL() {
        const metaverseAPI = ContextManager.get(this.#_contextID, MetaverseAPI) as MetaverseAPI;
        return metaverseAPI.getCurrentMetaverseServerURL();
    }

    /*@devdoc
     *  Gets the metaverse server URL's path.
     *  @param {boolean} [appendForwardSlash=false] <code>true</code> to include a trailing forward slash, <code>false</code> to
     *      not.
     *  @returns {string} The metaverse server URL's path.
     */
    getMetaverseServerURLPath(appendForwardSlash = false): string {
        // C++  QString getMetaverseServerURLPath(bool appendForwardSlash = false)
        const metaverseAPI = ContextManager.get(this.#_contextID, MetaverseAPI) as MetaverseAPI;
        return metaverseAPI.getCurrentMetaverseServerURLPath(appendForwardSlash);
    }


    async #generateNewKeypair(isUserKeypair = true /* , domainID = new Uuid() */): Promise<void> {
        // C++  void generateNewKeypair(bool isUserKeypair = true, const QUuid& domainID = QUuid())

        if (!isUserKeypair) {
            console.error("[networking] Domain key pair not implemented.");
            return;
        }

        // !isUserKeypair case not implemented.

        // Make sure we don't already have an outbound keypair generation request.
        if (!this.#_isWaitingForKeypairResponse) {
            this.#_isWaitingForKeypairResponse = true;

            // Clear the current private key.
            console.log("[networking] Clearing current private key in DataServerAccountInfo");
            this.#_accountInfo.setPrivateKey(new Uint8Array());

            try {
                const keyPair = await crypto.subtle.generateKey(
                    {
                        name: "RSASSA-PKCS1-v1_5",
                        modulusLength: 2048,
                        publicExponent: new Uint8Array([1, 0, 1]),
                        hash: "SHA-256"
                    },
                    true,
                    ["sign", "verify"]
                );

                if (keyPair.publicKey !== undefined && keyPair.privateKey !== undefined) {
                    const publicKey = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
                    const privateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
                    this.#processGeneratedKeypair(publicKey, privateKey);
                } else {
                    this.#handleKeypairGenerationError();
                }
            } catch (e) {
                this.#handleKeypairGenerationError();
            }
        }
    }

    #processGeneratedKeypair(publicKey: Uint8Array, privateKey: Uint8Array): void {
        // C++  void processGeneratedKeypair(QByteArray publicKey, QByteArray privateKey)
        console.log("[networking] Generated 2048-bit RSA keypair.");

        // hold the private key to later set our metaverse API account info if upload succeeds
        this.#_pendingPublicKey = publicKey;
        this.#_pendingPrivateKey = privateKey;
        void this.#uploadPublicKey();
    }

    #handleKeypairGenerationError(): void {
        // C++  void handleKeypairGenerationError()
        console.error("[networking] Error generating keypair - this is likely to cause authentication issues.");

        // reset our waiting state for keypair response
        this.#_isWaitingForKeypairResponse = false;
    }

    #uploadPublicKey = async (): Promise<void> => {
        // C++  void uploadPublicKey()
        if (this.#_pendingPrivateKey.byteLength === 0) {
            return;
        }

        console.log("[networking] Attempting upload of public key.");

        // WEBRTC TODO: Address further C++ code.

    };

}

export default AccountManager;
export { AccountManagerAuth };
