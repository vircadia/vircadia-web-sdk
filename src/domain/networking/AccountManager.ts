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
import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Url from "../shared/Url";
import Uuid from "../shared/Uuid";
import DataServerAccountInfo from "./DataServerAccountInfo";
import MetaverseAPI from "./MetaverseAPI";
import NetworkAccessManager, { HttpMultiPart } from "./NetworkAccessManager";
import NetworkReply from "./NetworkReply";
import NetworkRequest from "./NetworkRequest";


/*@devdoc
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


type CallbackParameters = {
    // C++  class JSONCallbackParameters
    jsonCallbackMethod?: (reply: NetworkReply) => void,
    errorCallbackMethod?: (reply: NetworkReply) => void
};


/*@devdoc
 *  The <code>AccountManager</code> class manages the user's account on the domain.
 *  <p>C++: <code>class AccountManager : public QObject, public Dependency</code></p>
 *  @class AccountManager
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @property {Signal<AccountManager~authRequired>} authRequired - Triggered when the user needs to authenticate with the
 *      metaverse in order to connect to the domain.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~usernameChanged>} usernameChanged - Triggered when the username changes.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~loginComplete>} loginComplete - Triggered when the user completes their login.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~logoutComplete>} logoutComplete - Triggered when the user logs out.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~newKeypair>} newKeypair - Triggered when a new key pair for the user has been uploaded to
 *      the metaverse.
 *      <em>Read-only.</em>
 */
class AccountManager {
    // C++  class AccountManager : public QObject, public Dependency

    /*@devdoc
     *  A function called with the reply from a network request.
     *  @callback AccountManager.CallbackFunction
     *  @param {NetworkReply} reply - The reply from the network request.
     */

    /*@devdoc
     *  Specifies network request callback functions.
     *  Specifies network request callback functions.
     *  @typedef {object} AccountManager.CallbackParameters
     *  @property {AccountManager.CallbackFunction} [jsonCallbackMethod] - Function to call upon network request success.
     *  @property {AccountManager.CallbackFunction} [errorCallbackMethod] - Function to call upon network request error.
     */

    static readonly contextItemType = "AccountManager";


    // Naively reads ANS1 format public or private key, skipping the headers and returning just the first BIT STRING data found:
    // expecting it to be a 2 element sequence containing 2048 bit integer plus 65537 integer.
    static #extractBitString(key: Uint8Array): Uint8Array {
        // C++  N/A

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const EOC = 0x00;
        const BIT_STRING = 0x03;
        const NULL = 0x05;
        const OBJECT_IDENTIFIER = 0x06;
        const SEQUENCE = 0x10;

        let element = 0;
        let index = 0;
        let found = false;
        let abort = false;
        let length = 0;

        const processLength = () => {
            const byte = key.at(index) as number;
            index += 1;

            // Definite, short length.
            if (byte < 0x80) {
                return byte & 0x0f;
            }

            // Definite, long length.
            if (byte > 0x80) {
                const numLengthBytes = byte & 0x0f;
                let lengthValue = 0;
                for (let i = 0; i < numLengthBytes; i += 1) {
                    lengthValue = lengthValue * 0x100 + (key.at(index) as number);
                    index += 1;
                }
                return lengthValue;
            }

            // Not expected; not handled.
            console.error("[networking] Unhandled content in key.");
            element = NULL;
            abort = true;
            return 0;
        };

        // Skip over expected header elements until we find a BIT STRING element.
        element = (key.at(index) as number) & 0x1F;
        index += 1;
        while (!found && !abort) {
            switch (element) {
                case SEQUENCE:
                    processLength();  // Skip over length bytes only because we want to process SEQUENCE contents.
                    break;
                case OBJECT_IDENTIFIER:
                    length = processLength();
                    index += length;
                    break;
                case NULL:
                    index += 1;
                    break;
                case BIT_STRING:
                    processLength();  // Skip over length bytes only because we want to process BIT_STRING contents.
                    element = (key.at(index) as number) & 0x1F;
                    index += 1;
                    if (element !== EOC) {
                        element = NULL;
                        abort = true;
                        break;
                    }
                    found = true;
                    break;
                default:
                    console.error("[networking] Unhandled content in key.");
                    element = NULL;
                    abort = true;
            }

            if (!found) {
                element = (key.at(index) as number) & 0x1F;
                index += 1;
            }
        }

        if (found) {
            return new Uint8Array(key.buffer.slice(index));
        }

        console.error("[networking] Could not extract BIT STRING data from key.");
        return new Uint8Array();

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }


    #_contextID: number;

    #_accountInfo = new DataServerAccountInfo();
    #_authRequired = new SignalEmitter();
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
     *  Called when the user needs to authenticate with the metaverse in order to connect to the domain.
     *  @callback AccountManager~authRequired
     */
    get authRequired(): Signal {
        return this.#_authRequired.signal();
    }

    /*@sdkdoc
     *  Called when the username changes.
     *  @callback AccountManager~usernameChanged
     *  @param {string} username - The new username.
     */
    get usernameChanged(): Signal {
        return this.#_usernameChanged.signal();
    }

    /*@sdkdoc
     *  Called when the user completes their login.
     *  @callback AccountManager~loginComplete
     *  @param {Url} authURL -  The authentication URL on the metaverse server.
     */
    get loginComplete(): Signal {
        return this.#_loginComplete.signal();
    }

    /*@sdkdoc
     *  Called when a new key pair for the user has been uploaded to the metaverse.
     *  @callback AccountManager~newKeypair
     */
    get newKeypair(): Signal {
        return this.#_newKeypair.signal();
    }

    /*@sdkdoc
     *  Called when the user logs out.
     *  @callback AccountManager~logoutComplete
     */
    get logoutComplete(): Signal {
        return this.#_logoutComplete.signal();
    }


    constructor(contextID: number) {
        // C++  AccountManager(bool accountSettingsEnabled, UserAgentGetter userAgentGetter)

        // Just use the browser's default UserAgent.

        this.#_contextID = contextID;

        // WEBRTC TODO: Address further C++ code.

        this.#_loginComplete.connect(this.#uploadPublicKey);

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Gets the metaverse server authentication URL.
     *  @returns {string} The metaverse server authentication URL.
     */
    getAuthURL(): Url {
        // C++  const QUrl& getAuthURL() const
        return new Url(this.#_authURL);
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
     *  Gets the user's account info.
     *  @returns {DataServerAccountInfo} The user's account info.
     */
    getAccountInfo(): DataServerAccountInfo {
        return this.#_accountInfo;
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
     *  Checks whether there is a valid access token for the metaverse server, and if not then emits an
     *  {@link AccountManager~authRequired} signal.
     *  @returns {boolean} <code>true</code> if there is a valid access token, <code>false<code> if there isn't.
     */
    checkAndSignalForAccessToken(): boolean {
        // C++  bool checkAndSignalForAccessToken()
        const hasToken = this.hasValidAccessToken();
        if (!hasToken) {
            const SIGNAL_DELAY = 500;
            setTimeout(() => {
                this.#_authRequired.emit();
            }, SIGNAL_DELAY);
        }

        return hasToken;
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
     *  Generates a new pair of private and public user keys and sends the public key to the metaverse server.
     */
    generateNewUserKeypair(): void {
        // C++  void generateNewUserKeypair()
        void this.#generateNewKeypair();
    }

    /*@devdoc
     *  Gets the user's metaverse server session ID.
     *  <p>Note: The metaverse server session ID is not currently used.</p>
     *  @returns {Uuid} The user's metaverse server session ID.
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
        return new Url(metaverseAPI.getCurrentMetaverseServerURL().toString());
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


    /*@devdoc
     *  Creates an empty network request ready to fill in and send.
     *  @param {string} path - The path on the metaverse server to send the request to.
     *  @param {AccountManagerAuth} authType - The type of authentication required.
     *  @returns {NetworkRequest} The network request ready to complete and send.
     */
    createRequest(path: string, authType: AccountManagerAuth): NetworkRequest {
        // C++  QNetworkRequest createRequest(QString path, AccountManagerAuth::Type authType)

        const networkRequest = new NetworkRequest();
        networkRequest.setAttribute(NetworkRequest.FollowRedirectsAttribute, true);
        // Don't set UserAgentHeader - just use the browser's user agent.

        networkRequest.setRawHeader(this.#_METAVERSE_SESSION_ID_HEADER, this.#_sessionID.stringify());

        let requestURL = new Url(this.#_authURL);

        if (requestURL.isEmpty()) {  // Assignment client doesn't set _authURL.
            requestURL = this.getMetaverseServerURL();
        }

        let queryStringLocation = path.indexOf("?");
        if (queryStringLocation === -1) {
            queryStringLocation = path.length;
        }
        if (path.startsWith("/")) {
            requestURL.setPath(this.getMetaverseServerURLPath(false) + path.slice(0, queryStringLocation));
        } else {
            requestURL.setPath(this.getMetaverseServerURLPath(true) + path.slice(0, queryStringLocation));
        }

        if (queryStringLocation >= 0) {
            const query = path.slice(queryStringLocation);
            requestURL.setQuery(query);
        }

        if (authType !== AccountManagerAuth.None) {
            if (this.hasValidAccessToken()) {
                networkRequest.setRawHeader(this.#_ACCESS_TOKEN_AUTHORIZATION_HEADER,
                    this.#_accountInfo.getAccessToken().authorizationHeaderValue());
            } else if (authType === AccountManagerAuth.Required) {
                console.log("[networking] No valid access token present. Bailing on invoked request to", path,
                    "that requires authentication.");
                return new NetworkRequest();
            }
        }

        networkRequest.setUrl(requestURL);
        return networkRequest;
    }

    /*@devdoc
     *  Sends a network request to the metaverse server.
     *  @param {string} path - The path on the metaverse server to send the request to.
     *  @param {AccountManagerAuth} authType - The type of authentication required.
     *  @param {NetworkAccessManager.Operation} [operation=PUT] - The type of HTTP operation to perform.
     *  @param {AccountManager.CallbackParameters} ]callbackParams=empty] - The success and error callbacks for the network
     *      request.
     *  @param {ArrayBuffer|null} [dataByteArray=empty] - Data bytes to send.
     *  @param {NetworkAccessManager.HttpMultiPart|null} [NetworkAccessManager.HttpMultiPart=empty] - Multi-part form data to
     *      send.
     *  @param {Map|null} [propertyMap=empty] - Properties for the sender to set on the reply.
     */
    sendRequest(path: string, authType: AccountManagerAuth, operation = NetworkAccessManager.GetOperation,
        callbackParams: CallbackParameters = {}, dataByteArray = new Uint8Array().buffer,
        dataMultiPart: HttpMultiPart = new Set(), propertyMap: Map<string, string> = new Map()): void {
        // C++  void sendRequest(const QString& path, AccountManagerAuth::Type authType,
        //          QNetworkAccessManager::Operation operation = QNetworkAccessManager::GetOperation,
        //          const JSONCallbackParameters& callbackParams = JSONCallbackParameters(),
        //          const QByteArray& dataByteArray = QByteArray(), QHttpMultiPart* dataMultiPart = NULL,
        //          const QVariantMap& propertyMap = QVariantMap())

        // Strategy: Implement only what's needed; raise errors for non-implemented code.

        const networkAccessManager = NetworkAccessManager.getInstance();

        const networkRequest = this.createRequest(path, authType);

        if (this.#_VERBOSE_HTTP_REQUEST_DEBUGGING) {
            console.debug("[networking] Making a request to:", networkRequest.url());
            if (dataByteArray && dataByteArray.byteLength > 0) {
                console.debug("[networking] The POST/PUT body:", new Uint8Array(dataByteArray).toString());
            }
        }

        let networkReply: NetworkReply | null = null;

        switch (operation) {
            /*
            case NetworkAccessManager.GetOperation:
                networkReply = networkAccessManager.get(networkRequest);
                break;
            case NetworkAccessManager.PostOperation:
            */
            case NetworkAccessManager.PutOperation:
                if (dataMultiPart) {
                    if (operation === NetworkAccessManager.PostOperation) {
                        // WEBRTC TODO: Address further C++ code.
                        console.error("[networking] POST operation not implemented.");
                    } else {
                        networkReply = networkAccessManager.put(networkRequest, dataMultiPart);
                    }
                } else {
                    // WEBRTC TODO: Address further C++ code.
                    console.error("[networking] Non multi-part operations not implemented.");
                }
                break;
            /*
            case NetworkAccessManager.DeleteOperation:
                networkReply = networkAccessManager.sendCustomRequest(networkRequest, "DELETE");
                break;
            */
            default:
                // Other methods not handled.
                console.error("[networking] HTTP operation not implemented:", operation);
                break;
        }

        if (networkReply) {
            if (propertyMap.size !== 0) {
                // WEBRTC TODO: Address further C++ code.
                console.error("[networking] Property map not implemented.");
            }

            networkReply.finished.connect(() => {
                if (networkReply && networkReply.hasRawHeader(this.#_METAVERSE_SESSION_ID_HEADER)) {
                    this.#_sessionID = new Uuid(networkReply.rawHeader(this.#_METAVERSE_SESSION_ID_HEADER));
                    console.debug("[networking] Set session ID from header:", this.#_sessionID.stringify());
                }
            });

            if (Object.keys(callbackParams).length > 0) {
                networkReply.finished.connect(() => {
                    assert(networkReply !== null);
                    if (networkReply.error() === NetworkReply.NoError) {
                        if (callbackParams.jsonCallbackMethod) {
                            callbackParams.jsonCallbackMethod(networkReply);
                        } else if (this.#_VERBOSE_HTTP_REQUEST_DEBUGGING) {
                            console.debug("[networking] Received JSON response from metaverse API with no matching callback.");
                            console.debug("[networking]", networkReply.readAll());
                        }
                    } else {  // eslint-disable-next-line no-lonely-if
                        if (callbackParams.errorCallbackMethod) {
                            callbackParams.errorCallbackMethod(networkReply);
                        } else if (this.#_VERBOSE_HTTP_REQUEST_DEBUGGING) {
                            console.debug("[networking] Received error response from metaverse API with no matching callback.");
                            console.debug("[networking]", networkReply.readAll());
                        }
                    }
                });
            }
        }
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
                    let publicKey = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
                    publicKey = AccountManager.#extractBitString(publicKey);
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
        console.log("[networking] Generated 2048-bit RSA key pair.");

        // Hold the private key to later set our metaverse API account info if upload succeeds.
        this.#_pendingPublicKey = publicKey;
        this.#_pendingPrivateKey = privateKey;
        this.#uploadPublicKey();
    }

    #handleKeypairGenerationError(): void {
        // C++  void handleKeypairGenerationError()
        console.error("[networking] Error generating key pair - this is likely to cause authentication issues.");

        // reset our waiting state for keypair response
        this.#_isWaitingForKeypairResponse = false;
    }

    #uploadPublicKey = (): void => {
        // C++  void uploadPublicKey()

        if (this.#_pendingPrivateKey.byteLength === 0) {
            return;
        }

        console.log("[networking] Attempting upload of public key.");

        const USER_PUBLIC_KEY_UPDATE_PATH = "/api/v1/user/public_key";
        const DOMAIN_PUBLIC_KEY_UPDATE_PATH = "/api/v1/domains/%1/public_key";

        let uploadPath = "";
        const domainID = this.#_accountInfo.getDomainID();
        if (domainID.isNull()) {
            uploadPath = USER_PUBLIC_KEY_UPDATE_PATH;
        } else {
            uploadPath = DOMAIN_PUBLIC_KEY_UPDATE_PATH.replace("%1", domainID.stringify());
        }

        const requestMultiPart: HttpMultiPart = new Set();
        const part = new Map();
        // The FormData polyfill needed for Node only accepts string, Buffer, and file stream multipart data.
        try {
            // Browser.
            part.set("public_key", new Blob([this.#_pendingPublicKey.buffer], { type: "application/octet-stream" }));
        } catch (e) {
            // Node.
            part.set("public_key", Buffer.from(this.#_pendingPublicKey));
        }
        if (!domainID.isNull()) {
            const key = this.getTemporaryDomainKey(domainID);
            part.set("api_key", key);
        }
        requestMultiPart.add(part);

        const callbackParams = {
            jsonCallbackMethod: this.#publicKeyUploadSucceeded,
            errorCallbackMethod: this.#publicKeyUploadFailed
        };
        this.sendRequest(uploadPath, AccountManagerAuth.Optional, NetworkAccessManager.PutOperation,
            callbackParams, undefined, requestMultiPart);
    };

    #publicKeyUploadSucceeded = (/* reply: NetworkReply */): void => {
        // C++ void publicKeyUploadSucceeded(QNetworkReply* reply)

        console.log("[networking] Uploaded public key to metaverse. RSA key pair generation is completed.");

        this.#_accountInfo.setPrivateKey(this.#_pendingPrivateKey);
        this.#_pendingPublicKey = new Uint8Array();
        this.#_pendingPrivateKey = new Uint8Array();

        // WEBRTC TODO: Address further code - persist account to file.

        this.#_isWaitingForKeypairResponse = false;

        this.#_newKeypair.emit();
    };

    #publicKeyUploadFailed = (reply: NetworkReply): void => {
        // C++  void AccountManager:: publicKeyUploadFailed(QNetworkReply* reply)

        console.warn("[networking] Public key upload to metaverse failed:", reply.url().toString(), reply.errorString());
        this.#_isWaitingForKeypairResponse = false;
    };

}

export default AccountManager;
export { AccountManagerAuth };
