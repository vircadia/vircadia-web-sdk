//
//  DomainServer.ts
//
//  Vircadia Web SDK's Domain Server API.
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountInterface from "./domain/interfaces/AccountInterface";
import UsersInterface from "./domain/interfaces/UsersInterface";
import AccountManager from "./domain/networking/AccountManager";
import AddressManager from "./domain/networking/AddressManager";
import MetaverseAPI from "./domain/networking/MetaverseAPI";
import Node from "./domain/networking/Node";
import NodeList from "./domain/networking/NodeList";
import NodeType from "./domain/networking/NodeType";
import ContextManager from "./domain/shared/ContextManager";
import SignalEmitter, { Signal } from "./domain/shared/SignalEmitter";
import Url from "./domain/shared/Url";
import Uuid from "./domain/shared/Uuid";


/*@sdkdoc
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>DISCONNECTED</td><td>0</td><td>Disconnected from the domain server.</td></tr>
 *          <tr><td>CONNECTING</td><td>1</td><td>Connecting to the domain server.</td></tr>
 *          <tr><td>CONNECTED</td><td>2</td><td>Connected to the domain server.</td></tr>
 *          <tr><td>REFUSED</td><td>3</td><td>Connection to the domain server refused; not connected.</td></tr>
 *          <tr><td>ERROR</td><td>4</td><td>Error connecting to the domain server; not connected.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} DomainServer.State
 */
enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTING,
    CONNECTED,
    REFUSED,
    ERROR
}

type OnStateChanged = (state: ConnectionState, info: string) => void;


/*@sdkdoc
 *  The <code>DomainServer</code> class provides the interface for connecting to a domain server.
 *
 *  @class DomainServer
 *  @property {DomainServer.State} DISCONNECTED - Disconnected from the domain server.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.State} CONNECTING - Connecting to the domain server.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.State} CONNECTED - Connected to the domain server.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.State} REFUSED - Connection to the domain server refused; not connected to the domain. See
 *      <code>refusalInfo</code> for details.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.State} ERROR - Error connecting to the domain server; not connected to the domain. See
 *      <code>errorInfo</code> for details.
 *      <em>Static. Read-only.</em>
 *  @property {number} contextID - Identifies the shared context which the DomainServer and associated assignment client objects
 *      (AudioMixer, AvatarMixer, etc.) use to connect to and interact with a domain. The context ID is assigned when the
 *      DomainServer object is constructed.
 *      <em>Read-only.</em>
 *  @property {string} location - The current address that the DomainServer is connected to or trying to connect to.
 *      <code>""</code> if no address has been set.
 *      <em>Read-only.</em>
 *  @property {Uuid} sessionUUID - Unique ID assigned to the user client in the domain. {@link Uuid(1)|Uuid.NULL} if not
 *      connected to a domain.
 *      <em>Read-only.</em>
 *  @property {Signal<DomainServer~OnSessionUuidChanged>} sessionUUIDChanged - Triggered when the <code>sessionUUID</code>
 *      changes.
 *      <em>Read-only.</em>
 *  @property {DomainServer.State} state - The current state of the connection to the domain server.
 *      <em>Read-only.</em>
 *  @property {string} refusalInfo - A description of the reason if <code>state == DomainServer.REFUSED</code>, otherwise
 *      <code>""</code>.
 *      <em>Read-only.</em>
 *  @property {string} errorInfo - A description of the reason if <code>state == DomainServer.ERROR</code>, otherwise
 *      <code>""</code>.
 *      <em>Read-only.</em>
 *  @property {DomainServer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      connection to the domain server changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 *
 *  @property {string} metaverseServerURL="https://metaverse.vircadia.com/live" - The URL of the metaverse server used for the
 *      domain. <code>""</code> if an invalid URL is set.
 *  @property {AccountInterface} account - Properties and methods for working with the user's account in the domain.
 *      <em>Read-only.</em>
 *  @property {UsersInterface} users - Properties and methods for working with users in the domain.
 *      <em>Read-only.</em>
 */
class DomainServer {
    // C++  Application.cpp
    //      The Web SDK differs from the C++ in that a "disconnect" command is explicitly provided to disconnect from the
    //      current domain and stop the check-ins from being sent; the C++ never stops sending check-ins.

    static get DISCONNECTED(): ConnectionState {
        return ConnectionState.DISCONNECTED;
    }

    static get CONNECTING(): ConnectionState {
        return ConnectionState.CONNECTING;
    }

    static get CONNECTED(): ConnectionState {
        return ConnectionState.CONNECTED;
    }

    static get REFUSED(): ConnectionState {
        return ConnectionState.REFUSED;
    }

    static get ERROR(): ConnectionState {
        return ConnectionState.ERROR;
    }

    /*@sdkdoc
     *  Gets the string representing a connection state.
     *  <p><em>Static</em></p>
     *  @param {DomainServer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the connection state if a valid state, otherwise <code>""</code>.
     */
    static stateToString(state: ConnectionState): string {
        const text = ConnectionState[state];
        return text ? text : "";
    }


    static readonly #DOMAIN_SERVER_CHECK_IN_MSECS = 1000;


    #_address = "";
    #_state = DomainServer.DISCONNECTED;
    #_refusalInfo = "";
    #_errorInfo = "";
    #_onStateChanged: OnStateChanged | null = null;

    #_domainCheckInTimer: ReturnType<typeof setTimeout> | null = null;

    // Context objects.
    #_contextID;
    #_nodeList: NodeList;
    #_accountManager: AccountManager;
    #_addressManager: AddressManager;
    #_metaverseAPI: MetaverseAPI;

    #_sessionUUID = new Uuid();
    #_sessionUUIDChanged = new SignalEmitter();

    #_accountInterface: AccountInterface;
    #_usersInterface: UsersInterface;

    #_DEBUG = false;


    constructor() {
        // C++  Application::Application()

        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager, contextID);
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodeList, contextID);
        ContextManager.set(contextID, MetaverseAPI);

        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        this.#_accountManager = ContextManager.get(contextID, AccountManager) as AccountManager;
        this.#_addressManager = ContextManager.get(contextID, AddressManager) as AddressManager;
        this.#_metaverseAPI = ContextManager.get(contextID, MetaverseAPI) as MetaverseAPI;
        this.#_contextID = contextID;

        // WEBRTC TODO: Address further C++ code.

        this.#_accountManager.setAuthURL(this.#_metaverseAPI.getCurrentMetaverseServerURL());
        if (!this.#_accountManager.hasKeyPair()) {
            this.#_accountManager.generateNewUserKeypair();
        }

        // WEBRTC TODO: Address further C++ code.

        const domainHandler = this.#_nodeList.getDomainHandler();
        domainHandler.connectedToDomain.connect(() => {
            this.#setState(DomainServer.CONNECTED);
        });
        domainHandler.disconnectedFromDomain.connect(() => {
            if (this.#_state !== DomainServer.DISCONNECTED) {
                this.#setState(DomainServer.DISCONNECTED);
            }
        });
        domainHandler.domainConnectionRefused.connect(this.#domainConnectionRefused);

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeList.nodeAdded.connect(this.#nodeAdded);
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);
        this.#_nodeList.nodeKilled.connect(this.#nodeKilled);
        this.#_nodeList.uuidChanged.connect(this.#setSessionUUID);

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeList.getDomainHandler().limitOfSilentDomainCheckInsReached.connect(() => {
            this.#_nodeList.reset("Domain checkin limit");
        });

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeList.addSetOfNodeTypesToNodeInterestSet(new Set([

            // WEBRTC TODO: Configure interest set per AC APIs used.

            NodeType.AudioMixer,
            NodeType.AvatarMixer,
            NodeType.EntityServer,
            NodeType.MessagesMixer
        ]));

        // WEBRTC TODO: Address further C++ code.

        this.#_accountInterface = new AccountInterface(contextID);
        this.#_usersInterface = new UsersInterface(contextID);
    }


    get location(): string {
        return this.#_address;
    }

    get state(): ConnectionState {
        return this.#_state;
    }

    get refusalInfo(): string {
        return this.#_refusalInfo;
    }

    get errorInfo(): string {
        return this.#_errorInfo;
    }

    /*@sdkdoc
     *  Called when the state of the connection to the domain changes.
     *  @callback DomainServer~onStateChanged
     *  @param {DomainServer.State} state - The state of the connection to the domain server connection.
     *  @param {string} info - Refusal or error information if the state is <code>REFUSAL</code> or <code>ERROR</code>.
     */
    set onStateChanged(callback: OnStateChanged) {
        if (typeof callback === "function" || callback === null) {
            this.#_onStateChanged = callback;
        } else {
            console.error("ERROR: DomainServer.onStateChanged callback not a function or null!");
            this.#_onStateChanged = null;
        }
    }

    get contextID(): number {
        return this.#_contextID;
    }

    get sessionUUID(): Uuid {
        return this.#_sessionUUID;
    }

    /*@sdkdoc
     *  Called when the <code>sessionUUID</code> property value changes.
     *  @callback DomainServer~OnSessionUuidChanged
     *  @param {Uuid} sessionUUID - Unique ID assigned to the user client in the domain. {@lnk Uuid|Uuid.NULL} if not connected
     *      to a domain.
     */
    get sessionUUIDChanged(): Signal {
        return this.#_sessionUUIDChanged.signal();
    }


    get metaverseServerURL(): string {
        return this.#_metaverseAPI.getCurrentMetaverseServerURL().toString();
    }

    set metaverseServerURL(address: string) {
        const url = new Url(address);
        if (!url.isValid()) {
            console.error("ERROR: Set DomainServer.metaverseServerURL to an invalid address:", address);
        }
        this.#_metaverseAPI.setBaseUrl(url);
        this.#_accountManager.updateAuthURLFromMetaverseServerURL();
    }

    get account(): AccountInterface {
        return this.#_accountInterface;
    }

    get users(): UsersInterface {
        return this.#_usersInterface;
    }


    /*@sdkdoc
     *  Initiates connection of the user client to a domain server.
     *  <p>The following types of address are supported:</p>
     *  <table>
     *      <tbody>
     *          <tr><td>WebSocket URL and path of the form:</code><br />
     *          <code>ws[s]://127.0.0.1:40102[/path]</code><br />
     *          The address may be an IP address or a DNS address.
     *          The optional path is a viewpoint path set in the domain server's settings.</td>
     *      </tbody>
     *  </table>
     *  @param {string} address - The address of the domain server to connect to.
     */
    connect(address: string): void {
        // C++  Application.cpp's domainCheckInTimer.
        //      AddressManager.handleLoockupString() called in many different locations.

        const oldAddress = this.#_address;

        if (typeof address === "string") {
            this.#_address = address.trim();
        } else {
            console.error("ERROR: DomainServer.connect() address parameter is not a string!");
            this.#_address = "";
        }

        if (this.#_address === "") {
            this.#stopDomainServerCheckins();
            this.#_nodeList.getDomainHandler().disconnect("Invalid address");
            this.#setState(DomainServer.ERROR, "No address specified.");
            return;
        }

        // If the domain hasn't changed we don't need to restart with a new connection.
        // WEBRTC TODO: Test the host rather than the full location value. Perhaps work in with AddressManager's signals,
        //              hostChanged and possibleDomainChangeRequired.
        // WEBRTC TODO: If changing domains host a DomainDisconnectRequest should probably be sent to the current domain. The
        // `            C++ currently doesn't do this so leave this for now.
        if (this.#_address === oldAddress && this.#_domainCheckInTimer) {
            return;
        }

        this.#setState(DomainServer.CONNECTING);

        this.#_addressManager.handleLookupString(address);

        // Start sending domain server check-ins.
        if (!this.#_domainCheckInTimer) {
            setTimeout(() => {  // Yield to AddressManager.handleLookupString() and its Signals.
                if (this.#_state === DomainServer.CONNECTING) {
                    this.#sendDomainServerCheckIns();
                }
            }, 0);
        }

    }

    /*@sdkdoc
     *  Disconnects the user client from the domain server.
     */
    disconnect(): void {
        // C++  N/A
        if (this.#_state === DomainServer.DISCONNECTED) {
            return;
        }
        this.#stopDomainServerCheckins();
        this.#_nodeList.getDomainHandler().disconnect("User disconnected", true);
        this.#setState(DomainServer.DISCONNECTED);
    }


    #setState(state: ConnectionState, info = ""): void {
        const hasStateChanged = state !== this.#_state;
        if (this.#_DEBUG && !hasStateChanged) {
            console.warn("DomainServer: State hasn't changed.");
        }

        this.#_state = state;
        this.#_refusalInfo = "";
        this.#_errorInfo = "";
        if (this.#_state === DomainServer.REFUSED) {
            this.#_refusalInfo = info;
        } else if (this.#_state === DomainServer.ERROR) {
            this.#_errorInfo = info;
        }
        if (hasStateChanged && this.#_onStateChanged) {
            this.#_onStateChanged(state, info);
        }
    }

    #sendDomainServerCheckIns(): void {
        // Schedule next send.
        this.#_domainCheckInTimer = setTimeout(() => {
            this.#sendDomainServerCheckIns();
        }, DomainServer.#DOMAIN_SERVER_CHECK_IN_MSECS);

        // Perform this send.
        void this.#_nodeList.sendDomainServerCheckIn();
    }

    #stopDomainServerCheckins(): void {
        if (this.#_domainCheckInTimer !== null) {
            clearTimeout(this.#_domainCheckInTimer);
            this.#_domainCheckInTimer = null;
        }
    }


    // Slot.
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    #domainConnectionRefused = (reasonMessage: string, reasonCodeInt: number, extraInfo: string): void => {
        // C++  Application::domainConnectionRefused(const QString& reasonMessage, int reasonCodeInt, const QString& extraInfo)

        // WEBRTC TODO: Address further C++ code.

        this.#setState(ConnectionState.REFUSED, reasonMessage);
    };

    // Slot.
    #nodeAdded = (node: Node): void => {
        // C++  void Application::nodeAdded(Node* node)
        if (node.getType() === NodeType.EntityServer) {
            // Safe landing code not implemented.
        }
    };

    // Slot.
    #nodeActivated = (node: Node): void => {
        // C++  void Application::nodeActivated(Node* node)
        const nodeType = node.getType();

        // AudioMixer node is handled in AudioClient.ts.
        // AvatarMixer node is handled in AvatarManager.ts.
        // EntityServer node is handled in EntityServer.ts.

        if (nodeType === NodeType.AssetServer) {
            console.warn("DomainServer: AssetServer support not implemented!");

            // WEBRTC TODO: Address further code - for AssetServer node.

        }
    };

    // Slot.
    #nodeKilled = (node: Node): void => {
        // C++  void Application::nodeKilled(Node* node)

        const nodeType = node.getType();

        // AudioMixer node is handled in AudioMixer.ts.
        // EntityServer node is handled in EntityServer.ts.

        if (nodeType === NodeType.AssetServer) {
            console.warn("DomainServer: AssetServer support not implemented!");

            // WEBRTC TODO: Address further code - for AssetServer node.

        }
    };

    // Slot
    #setSessionUUID = (sessionUUID: Uuid /* , oldUUID: Uuid */): void => {
        // C++  void setSessionUUID(const QUuid& sessionUUID)
        //      void LimitedNodeList::uuidChanged(const QUuid& ownerUUID, const QUuid& oldUUID);

        // WEBRTC TODO: Address further C++ code. - Physics session UUID.

        // WebRTC: Handle the session UUID directly in DomainServer rather than going through Avatar and AvatarData.
        this.#_sessionUUID = sessionUUID;
        this.#_sessionUUIDChanged.emit(sessionUUID);
    };

}

export default DomainServer;
export { ConnectionState };
