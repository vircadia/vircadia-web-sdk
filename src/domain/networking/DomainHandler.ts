//
//  DomainHandler.ts
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ContextManager from "../shared/ContextManager";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Url from "../shared/Url";
import Uuid from "../shared/Uuid";
import PacketScribe from "./packets/PacketScribe";
import AccountManager from "./AccountManager";
import { LocalID } from "./NetworkPeer";
import NodeList from "./NodeList";
import ReceivedMessage from "./ReceivedMessage";
import SockAddr from "./SockAddr";


enum ConnectionRefusedReason {
    Unknown,
    ProtocolMismatch,
    LoginErrorMetaverse,
    NotAuthorizedMetaverse,
    TooManyUsers,
    TimedOut,
    LoginErrorDomain,
    NotAuthorizedDomain
}


/*@devdoc
 *  The <code>DomainHandler</code> class handles the connection to and the features of a domain.
 *  <p>C++: <code>DomainHandler : QObject</code></p>
 *  @class DomainHandler
 *  @param {NodeList} parent - The parent {@link NodeList} object.
 *
 *  @property {DomainHandler.ConnectionRefusedReasons} ConnectionRefusedReason - The reasons that a client may be refused
 *      connection to a domain.
 *      <em>Static. Read-only.</em>
 */
class DomainHandler {
    // C++  DomainHandler : public QObject

    /*@devdoc
     *  <p>The reasons that a client may be refused connection to a domain.</p>
     *  <table>
     *      <thead>
     *          <tr><th>Reason</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *  <tbody>
     *      <tr><td>Unknown</td><td><code>0</code></td>
     *          <td>Some unknown reason.</td></tr>
     *      <tr><td>ProtocolMismatch</td><td><code>1</code></td>
     *          <td>The communications protocols of the domain and your client are not the same.</td></tr>
     *      <tr><td>LoginErrorMetaverse</td><td><code>2</code></td>
     *          <td>You could not be logged into the domain per your metaverse login.</td></tr>
     *      <tr><td>NotAuthorizedMetaverse</td><td><code>3</code></td>
     *          <td>You are not authorized to connect to the domain per your metaverse login.</td></tr>
     *      <tr><td>TooManyUsers</td><td><code>4</code></td>
     *          <td>The domain already has its maximum number of users.</td></tr>
     *      <tr><td>TimedOut</td><td><code>5</code></td>
     *          <td>Connecting to the domain timed out.</td></tr>
     *      <tr><td>LoginErrorDomain</td><td><code>6</code></td>
     *          <td>You could not be logged into the domain per your domain login.</td></tr>
     *      <tr><td>NotAuthorizedDomain</td><td><code>7</code></td>
     *          <td>You are not authorized to connect to the domain per your domain login.</td></tr>
     *   </tbody>
     * </table>
     * @typedef {number} DomainHandler.ConnectionRefusedReason
     */
    /*@devdoc
     *  The reasons that a client may be refused connection to a domain.
     *  @typedef {object} DomainHandler.ConnectionRefusedReasons
     *  @property {DomainHandler.ConnectionRefusedReason} Unknown - <code>0</code>:
     *      Some unknown reason.
     *  @property {DomainHandler.ConnectionRefusedReason} ProtocolMismatch - <code>1</code>:
     *      The communications protocols of the domain and your client are not the same.
     *  @property {DomainHandler.ConnectionRefusedReason} LoginErrorMetaverse - <code>2</code>:
     *      You could not be logged into the domain per your metaverse login.
     *  @property {DomainHandler.ConnectionRefusedReason} NotAuthorizedMetaverse - <code>3</code>:
     *      You are not authorized to connect to the domain per your metaverse login.
     *  @property {DomainHandler.ConnectionRefusedReason} TooManyUsers - <code>4</code>:
     *      The domain already has its maximum number of users.
     *  @property {DomainHandler.ConnectionRefusedReason} TimedOut - <code>5</code>:
     *      Connecting to the domain timed out.
     *  @property {DomainHandler.ConnectionRefusedReason} LoginErrorDomain - <code>6</code>:
     *      You could not be logged into the domain per your domain login.
     *  @property {DomainHandler.ConnectionRefusedReason} NotAuthorizedDomain - <code>7</code>:
     *      You are not authorized to connect to the domain per your domain login.
     */
    static readonly ConnectionRefusedReason = new class {
        readonly Unknown: ConnectionRefusedReason = 0;
        readonly ProtocolMismatch: ConnectionRefusedReason = 1;
        readonly LoginErrorMetaverse: ConnectionRefusedReason = 2;
        readonly NotAuthorizedMetaverse: ConnectionRefusedReason = 3;
        readonly TooManyUsers: ConnectionRefusedReason = 4;
        readonly TimedOut: ConnectionRefusedReason = 5;
        readonly LoginErrorDomain: ConnectionRefusedReason = 6;
        readonly NotAuthorizedDomain: ConnectionRefusedReason = 7;
    }();

    static readonly #SILENT_DOMAIN_TRAFFIC_DROP_MIN = 2;
    static readonly #MAX_SILENT_DOMAIN_SERVER_CHECK_INS = 5;


    #_domainURL = new Url();
    #_sockAddr = new SockAddr();  // For WebRTC, the port is the critical part.
    #_isConnected = false;
    #_localID = 0;
    #_uuid = new Uuid();
    #_connectionToken = new Uuid();

    #_errorDomainURL = new Url();
    #_domainConnectionRefusals: Set<string> = new Set();
    #_checkInPacketsSinceLastReply = 0;

    #_connectedToDomain = new SignalEmitter();
    #_disconnectedFromDomain = new SignalEmitter();
    #_domainConnectionRefused = new SignalEmitter();
    #_limitOfSilentDomainCheckInsReached = new SignalEmitter();

    #_pendingPath = "";
    #_hasCheckedForAccessToken = false;
    #_connectionDenialsSinceKeypairRegen = 0;

    // Context.
    #_contextID;
    #_nodeList;


    constructor(contextID: number, parent: NodeList) {
        // C++  DomainHandler(QObject* parent = 0);

        this.#_contextID = contextID;

        this.#_nodeList = parent;
        this.#_sockAddr.setObjectName("DomainServer");

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Sets the domain's UUID.
     *  @param {Uuid} uuid - The domain's UUID.
     */
    setUUID(uuid: Uuid): void {
        // C++  void setUUID(const QUuid& uuid)
        this.#_uuid = uuid;

        // WEBRTC TODO: Address further C++ code.
    }

    /*@devdoc
     *  Gets the domain's UUID.
     *  @returns {Uuid} The domain's UUID.
     */
    getUUID(): Uuid {
        // C++ QUuid& getUUID()
        return this.#_uuid;
    }

    /*@devdoc
     *  Sets the domain's local ID.
     *  @param {LocalID} localID - The domain's local ID.
     */
    setLocalID(localID: LocalID): void {
        // C++ void setLocalID(LocalID localID)
        this.#_localID = localID;
    }

    /*@devdoc
     *  Gets the domain's local ID.
     *  @returns {LocalID} The domain's local ID.
     */
    getLocalID(): LocalID {
        // C++  LocalID getLocalID()
        return this.#_localID;
    }

    /*@devdoc
     *  Gets the current domain's URL.
     *  <p>Note: The web app uses the domain's URL rather than its IP address.<p>
     *  @returns {string} The current domain's URL.
     */
    getURL(): Url {
        // C++  N/A

        // WEBRTC TODO: Revisit using URL versus IP address..

        return this.#_domainURL;
    }

    /*@devdoc
     *  Gets the domain's address.
     *  @returns {SockAddr} The domain's address.
     */
    getSockAddr(): SockAddr {
        // C++  SockAddr& getSockAddr()
        return this.#_sockAddr;
    }

    /*@devdoc
     *  Sets the domain's network port.
     *  @param {number} port - The domain's network port.
     */
    setPort(port: number): void {
        // C++  void setPort(quint16 port)
        this.#_sockAddr.setPort(port);
    }

    /*@devdoc
     *  Gets the domain's network port.
     *  @returns {number} The domain's network port.
     */
    getPort(): number {
        // C++  unsigned short getPort()
        return this.#_sockAddr.getPort();
    }

    /*@devdoc
     *  Gets whether the client is connected to the domain.
     *  @returns {boolean} <code>true</code> if connect to the domain, <code>false</code> if not connected.
     */
    isConnected(): boolean {
        // C++  bool isConnected()
        return this.#_isConnected;
    }

    /*@devdoc
     *  Gets the token for the domain connection.
     *  @returns {Uuid} The domain connection token.
     */
    getConnectionToken(): Uuid {
        // C++  const QUuid& getConnectionToken() const
        return this.#_connectionToken;
    }

    /*@devdoc
     *  Sets the token for the domain connection.
     *  @param {Uuid} connectionToken - The domain connection token.
     */
    setConnectionToken(connectionToken: Uuid): void {
        // C++  void setConnectionToken(const QUuid& connectionToken)
        this.#_connectionToken = connectionToken;
    }

    /*@devdoc
     *  Sets whether the client is connected to the domain.
     *  @param {boolean} isConnected - <code>true</code> if the client is connected to the domain, <code>false</code> if it
     *      isn't.
     *  @param {boolean} forceDisconnect - <code>true</code> if any partly open communications channels to the domain server
     *      should be closed (e.g., if currently trying to connect), <code>false</code> if they need not be.
     */
    setIsConnected(isConnected: boolean, forceDisconnect = false): void {
        // C++  void setIsConnected(bool isConnected)
        //      The extra forceDisconnect parameter is used to cause the WebRTC signaling channel to be closed.
        if (this.#_isConnected !== isConnected) {
            this.#_isConnected = isConnected;
            if (this.#_isConnected) {

                // WEBRTC TODO: Address further C++ code.

                this.#_connectedToDomain.emit(this.#_domainURL);

                // WEBRTC TODO: Address further C++ code.

            } else {
                this.#_disconnectedFromDomain.emit();
            }
        } else if (!this.#_isConnected && forceDisconnect) {
            // Close the WebRTC communications channel.
            this.#_disconnectedFromDomain.emit();
        }
    }

    /*@devdoc
     *  Gets whether the DomainHandler is in an error state.
     *  @returns {boolean} <code>true</code> if in an error state, <code>false</code> if not.
     */
    isInErrorState(): boolean {  // eslint-disable-line class-methods-use-this
        // C++  bool isInErrorState()
        // Always false in the Web SDK because interstitial mode is not supported.
        return false;
    }

    /*@devdoc
     *  Disconnects the user client from the Domain Server.
     *  @param {string} reason - The reason for disconnecting.
     *  @param {boolean} forceDisconnect - <code>true</code> if any partly open communications channels to the domain server
     *      should be closed (e.g., if currently trying to connect), <code>false</code> if they need not be.
     */
    disconnect(reason: string, forceDisconnect = false): void {
        // C++  void DomainHandler::disconnect(QString reason)
        //      The extra forceDisconnect parameter is used to cause the WebRTC signaling channel to be closed.
        if (this.#_isConnected) {
            this.#sendDisconnectPacket();
        }

        // Clear member variables that hold the connection state to a domain.
        this.#_uuid = new Uuid();
        this.#_connectionToken = new Uuid();

        // WEBRTC TODO: Address further C++ code.

        // WEBRTC TODO: Should C++ clear _domainConnectionRefusals also?
        this.#_domainConnectionRefusals.clear();  // Re-report any refusals if retry connecting to the same domain.

        console.log("[networking] Disconnecting from domain server.");
        console.log("[networking] REASON:", reason);
        this.setIsConnected(false, forceDisconnect);
    }

    /*@devdoc
     *  Gets the number of check-in packets sent since the last reply from the domain server.
     *  @returns {number} The number of check-in packets sent since the last reply from the domain server.
     */
    getCheckInPacketsSinceLastReply(): number {
        return this.#_checkInPacketsSinceLastReply;
    }

    /*@devdoc
     *  Clears the count of check-in packets sent since the last reply from the domain server.
     */
    clearPendingCheckins(): void {
        this.#_checkInPacketsSinceLastReply = 0;
    }

    /*@devdoc
     *  Checks whether the client's connection to the domain server has timed out &mdash; it hasn't been responding to
     *  DomainConnectRequest and DomainListRequest packets for a while. Triggers
     *  {@link DomainHandler.limitOfSilentDomainCheckInsReached|limitOfSilentDomainCheckInsReached} when timed out.
     *  @returns {boolean} <code>true</code> if the client's connection to the domain server has timed out, <code>false</code>
     *      if it hasn't.
     */
    // eslint-disable-next-line class-methods-use-this
    checkInPacketTimeout(): boolean {
        // C++  bool checkInPacketTimeout()

        this.#_checkInPacketsSinceLastReply += 1;

        if (this.#_checkInPacketsSinceLastReply > 1) {
            console.log("[networking] Silent domain checkins:", this.#_checkInPacketsSinceLastReply);
        }

        if (this.#_checkInPacketsSinceLastReply > DomainHandler.#SILENT_DOMAIN_TRAFFIC_DROP_MIN) {
            console.log("[networking]", this.#_checkInPacketsSinceLastReply,
                "seconds since last domain check-in; squelching traffic");
            this.#_nodeList.setDropOutgoingNodeTraffic(true);
        }

        if (this.#_checkInPacketsSinceLastReply > DomainHandler.#MAX_SILENT_DOMAIN_SERVER_CHECK_INS) {
            console.log("[networking] Limit of silent domain check-ins reached");
            this.#_limitOfSilentDomainCheckInsReached.emit();
            return true;
        }

        return false;
    }


    /*@devdoc
     *  Disconnects from the domain and restart the connection process.
     *  @param {string} reason - The reason for the  reset.
     */
    softReset(reason: string): void {
        // C++  void softReset(QString reason) {
        console.log("[networking] Resetting current domain connection information.");
        this.disconnect(reason);

        // WEBRTC TODO: Address further C++ code.

        this.#_connectionDenialsSinceKeypairRegen = 0;
        this.#_checkInPacketsSinceLastReply = 0;

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Processes a {@link PacketType(1)|DomainConnectionDenied} message received from the domain server.
     *  @function DomainHandler.processDomainServerConnectionDeniedPacket
     *  @type {Listener}
     *  @param {ReceivedMessage} message - The DomainConnectionDenied message.
     */
    processDomainServerConnectionDeniedPacket = (message: ReceivedMessage): void => {
        // C++  void DomainHandler::processDomainServerConnectionDeniedPacket(ReceivedMessage* message)

        // WEBRTC TODO: Address further C++ code.

        this.#_checkInPacketsSinceLastReply = 0;

        const info = PacketScribe.DomainConnectionDenied.read(message.getMessage());
        const sanitizedExtraInfo = info.extraInfo.toLowerCase().startsWith("http") ? "" : info.extraInfo;  // Don't log URLs.
        console.warn("[networking] The domain-server denied a connection request: ", info.reasonMessage, "extraInfo:",
            sanitizedExtraInfo);

        if (!this.#_domainConnectionRefusals.has(info.reasonMessage)) {
            this.#_domainConnectionRefusals.add(info.reasonMessage);
            this.setRedirectErrorState(this.#_errorDomainURL, info.reasonMessage, info.reasonCode, info.extraInfo);
        }

        // Some connection refusal reasons imply that a login is required. If so, suggest a new login.
        if (this.#reasonSuggestsMetaverseLogin(info.reasonCode)) {
            console.warn("[networking] Make sure you are logged in to the metaverse.");

            const accountManager = ContextManager.get(this.#_contextID, AccountManager) as AccountManager;

            if (!this.#_hasCheckedForAccessToken) {
                accountManager.checkAndSignalForAccessToken();
                this.#_hasCheckedForAccessToken = true;
            }

            // Regenerate the key pair after several failed attempts.
            const CONNECTION_DENIALS_FOR_KEYPAIR_REGEN = 3;
            this.#_connectionDenialsSinceKeypairRegen += 1;
            if (this.#_connectionDenialsSinceKeypairRegen >= CONNECTION_DENIALS_FOR_KEYPAIR_REGEN) {
                accountManager.generateNewUserKeypair();
                this.#_connectionDenialsSinceKeypairRegen = 0;
            }

            // WEBRTC TODO: Address further C++ code - domain login.

        } else if (this.#reasonSuggestsDomainLogin(info.reasonCode)) {
            console.warn("[networking] Make sure you are logged in to the domain.");

            // WEBRTC TODO: Address further C++ code.

            console.error("Domain login not implemented.");
        }

    };


    /*@devdoc
     *  Sets the current domain's URL and pending ID.
     *  @function DomainHandler.setURLAndID
     *  @type {Slot}
     *  @param {Url} url - The domain's URL.
     *  @param {Uuid} id - The domain's pending ID.
     */
    // eslint-disable-next-line
    // @ts-ignore
    setURLAndID = (domainURL: Url, domainID: Uuid): void => {  // eslint-disable-line
        // C++  void setURLAndID(QUrl domainURL, QUuid domainID)

        // WEBRTC TODO: Address further C++ code.

        if (this.#_domainURL.toString() !== domainURL.toString()) {
            this.#hardReset("Changing domain URL");

            // WEBRTC TODO: Address further C++ code.

            this.#_domainURL = domainURL;

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

    };

    /*@devdoc
     *  Acts upon a domain connection refusal, triggering a
     *  {@link DomainHandler.domainConnectionRefused|domainConnectionRefused} signal to be emitted.
     *  @function DomainHandler.setRedirectErrorState
     *  @type {Slot}
     *  @param {Url} errorUrl - Not currently used.
     *  @param {string} reasonMessage - The reason that the client was refused connection to the domain.
     *  @param {DomainHandler.ConnectionRefusedReason} reasonCode - The reason code for the refusal.
     *  @param {string} extraInfo - Extra information about the refusal.
     */
    // eslint-disable-next-line
    // @ts-ignore
    setRedirectErrorState = (errorUrl: Url, reasonMessage = "", reasonCode = -1, extraInfo = ""): void => {
        // C++  void setRedirectErrorState(QUrl errorUrl, QString reasonMessage = "", int reasonCode = -1,
        //          const QString& extraInfo = "")

        // WEBRTC TODO: Address further C++ code.
        this.#_domainConnectionRefused.emit(reasonMessage, reasonCode, extraInfo);
    };


    /*@devdoc
     *  Sets the domain path to query the domain server about once it is connected, to retrieve the viewpoint (position and
     *  orientation) set for the path.
     *  @param {string} pendingPath - The domain path to query the domain server on.
     */
    setPendingPath(pendingPath: string): void {
        // C++  void setPendingPath(const QString& pendingPath)
        this.#_pendingPath = pendingPath;
    }

    /*@devdoc
     *  Gets the domain path to query the domain server about once it is connected, to retrieve the viewpoint (position and
     *  orientation) set for the path.
     *  @returns {string} The domain path to query the domain server on.
     */
    getPendingPath(): string {
        //  const QString& getPendingPath()
        return this.#_pendingPath;
    }

    /*@devdoc
     *  Clears the domain path to query the domain server about.
     */
    clearPendingPath(): void {
        // C++  void clearPendingPath()
        this.#_pendingPath = "";
    }


    /*@devdoc
     *  Triggered when the client connects to then domain.
     *  @function DomainHandler.connectedToDomain
     *  @param {Url} domainURL - The domain's URL.
     *  @returns {Signal}
     */
    get connectedToDomain(): Signal {
        // C++  void connectedToDomain(QUrl domainURL)
        return this.#_connectedToDomain.signal();
    }

    /*@devdoc
     *  Triggered when the client disconnects from the domain.
     *  @function DomainHandler.disconnectedFromDomain
     *  @returns {Signal}
     */
    get disconnectedFromDomain(): Signal {
        // C++  void disconnectedFromDomain()
        return this.#_disconnectedFromDomain.signal();
    }

    /*@devdoc
     *  Triggered when the client is refused connection to a domain.
     *  @function DomainHandler.domainConnectionRefused
     *  @param {string} reasonMessage - The reason that the client was refused connection to the domain.
     *  @param {DomainHandler.ConnectionRefusedReason} reasonCode - The reason code for the refusal.
     *  @param {string} extraInfo - Extra information about the refusal.
     *  @returns {Signal}
     */
    get domainConnectionRefused(): Signal {
        // C++  void domainConnectionRefused(QString reasonMessage, int reasonCode, const QString& extraInfo)
        return this.#_domainConnectionRefused.signal();
    }

    /*@devdoc
     *  Triggered when the maximum number of check-in packets have been sent without reply.
     *  @function DomainHandler.limitOfSilentDomainCheckInsReached
     *  @returns {Signal}
     */
    get limitOfSilentDomainCheckInsReached(): Signal {
        // C++  void limitOfSilentDomainCheckInsReached()
        return this.#_limitOfSilentDomainCheckInsReached.signal();
    }


    #sendDisconnectPacket(): void {
        // C++  void sendDisconnectPacket()
        const packet = PacketScribe.DomainDisconnectRequest.write();
        this.#_nodeList.sendUnreliablePacket(packet, this.#_sockAddr);
    }

    #hardReset(reason: string): void {
        // C++  void DomainHandler::hardReset(QString reason)

        // WEBRTC TODO: Address further C++ code.

        this.softReset(reason);

        // WEBRTC TODO: Address further C++ code.

        this.#_domainURL = new Url();
        this.#_sockAddr = new SockAddr();
        this.#_domainConnectionRefusals.clear();

        this.#_hasCheckedForAccessToken = false;
        this.#_pendingPath = "";
    }

    #reasonSuggestsMetaverseLogin(reasonCode: ConnectionRefusedReason): boolean {  // eslint-disable-line class-methods-use-this
        // C++  bool reasonSuggestsMetaverseLogin(ConnectionRefusedReason reasonCode)

        switch (reasonCode) {
            case ConnectionRefusedReason.LoginErrorMetaverse:
            case ConnectionRefusedReason.NotAuthorizedMetaverse:
                return true;

            case ConnectionRefusedReason.Unknown:
            case ConnectionRefusedReason.ProtocolMismatch:
            case ConnectionRefusedReason.TooManyUsers:
            case ConnectionRefusedReason.NotAuthorizedDomain:
            default:
                return false;
        }
    }

    #reasonSuggestsDomainLogin(reasonCode: ConnectionRefusedReason): boolean {  // eslint-disable-line class-methods-use-this
        // C++  bool reasonSuggestsDomainLogin(ConnectionRefusedReason reasonCode) {
        switch (reasonCode) {
            case ConnectionRefusedReason.LoginErrorDomain:
            case ConnectionRefusedReason.NotAuthorizedDomain:
                return true;

            case ConnectionRefusedReason.Unknown:
            case ConnectionRefusedReason.ProtocolMismatch:
            case ConnectionRefusedReason.TooManyUsers:
            case ConnectionRefusedReason.NotAuthorizedMetaverse:
            default:
                return false;
        }
    }
}

export default DomainHandler;
