//
//  DomainServer.ts
//
//  Vircadia Web SDK's Domain Server API.
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "./domain/networking/AddressManager";
import { ConnectionRefusedReasonValue } from "./domain/networking/ConnectionRefusedReason";
import NodesList from "./domain/networking/NodesList";
import NodeType from "./domain/networking/NodeType";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>DISCONNECTED</td><td>0</td><td>Disconnected from the domain.</td></tr>
 *          <tr><td>CONNECTING</td><td>1</td><td>Connecting to the domain.</td></tr>
 *          <tr><td>CONNECTED</td><td>2</td><td>Connected to the domain.</td></tr>
 *          <tr><td>REFUSED</td><td>3</td><td>Connection to the domain refused; not connected to the domain.</td></tr>
 *          <tr><td>ERROR</td><td>4</td><td>Error connecting to the domain; not connected to the domain.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} DomainServer.ConnectionState
 */
enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTING,
    CONNECTED,
    REFUSED,
    ERROR
}

type OnStateChangedCallback = (state: ConnectionState, info: string) => void;


/*@sdkdoc
 *  The <code>DomainServer</code> class provides the interface for connecting to a domain server.
 *
 *  @class DomainServer
 *  @property {DomainServer.ConnectionState} DISCONNECTED - Disconnected from the domain.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.ConnectionState} CONNECTING - Connecting to the domain.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.ConnectionState} CONNECTED - Connected to the domain.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.ConnectionState} REFUSED - Connection to the domain refused; not connected to the domain. See
 *      <code>refusalInfo</code> for details.
 *      <em>Static. Read-only.</em>
 *  @property {DomainServer.ConnectionState} ERROR - Error connecting to the domain; not connected to the domain. See
 *      <code>errorInfo</code> for details.
 *      <em>Static. Read-only.</em>
 *  @property {string} location - The current location that the domain server is pointed at. <code>""</code> if no location has
 *      been set.
 *      <em>Read-only.</em>
 *  @property {DomainServer.ConnectionState} state - The current state of the connection to the domain server.
 *      <em>Read-only.</em>
 *  @property {string} refusalInfo - A description of the reason if <code>state == DomainServer.REFUSED</code>, otherwise
 *      <code>""</code>.
 *      <em>Read-only.</em>
 *  @property {string} errorInfo - A description of the reason if <code>state == DomainServer.ERROR</code>, otherwise
 *      <code>""</code>.
 *      <em>Read-only.</em>
 *  @property {DomainServer~onStateChangedCallback|null} onStateChanged - Sets a single function to be called when the state of
 *      the domain server connection changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 */
class DomainServer {
    // C++  Application.cpp
    //      The Web SDK differs from the C++ in that a "disconnect" command is explicitly provides which disconnects from the
    //      current domain and stops the check-ins from being sent. The C++ never stops sending check-ins.

    /*@sdkdoc
     *  Called when the state of the domain server connection changes.
     *  @callback DomainServer~onStateChangedCallback
     *  @param {DomainServer.ConnectionState} state - The state of the domain server connection.
     *  @param {string} info - Refusal or error information if the state is <code>REFUSAL</code> or <code>ERROR</code>.
     */

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
     *  @param {DomainServer.ConnectionState} state - The state to get the string representation of.
     *  @returns {string} The string representing the connection state if a valid state, otherwise <code>""</code>.
     */
    static stateToString(state: ConnectionState): string {
        const text = ConnectionState[state];
        return text ? text : "";
    }


    static readonly #DOMAIN_SERVER_CHECK_IN_MSECS = 1000;


    #_location = "";
    #_state: ConnectionState = DomainServer.DISCONNECTED;
    #_refusalInfo = "";
    #_errorInfo = "";
    #_onStateChangedCallback: OnStateChangedCallback | null = null;

    #_domainCheckInTimer: ReturnType<typeof setTimeout> | null = null;

    // Context objects.
    #_nodesList: NodesList;
    #_addressManager: AddressManager;

    #_DEBUG = false;


    constructor() {
        // C++  Application::Application()

        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AddressManager);
        ContextManager.set(contextID, NodesList, contextID);

        this.#_nodesList = <NodesList>ContextManager.get(contextID, NodesList);
        this.#_addressManager = <AddressManager>ContextManager.get(contextID, AddressManager);

        // WEBRTC TODO: Address further C++ code.

        const domainHandler = this.#_nodesList.getDomainHandler();
        domainHandler.connectedToDomain.connect(() => {
            this.#setState(DomainServer.CONNECTED);
        });
        domainHandler.disconnectedFromDomain.connect(() => {
            if (this.#_state !== DomainServer.DISCONNECTED) {
                this.#stopDomainServerCheckins();
                this.#setState(DomainServer.DISCONNECTED);
            }
        });
        domainHandler.domainConnectionRefused.connect(this.#domainConnectionRefused);

        // WEBRTC TODO: Address further C++ code.

        this.#_nodesList.addSetOfNodeTypesToNodeInterestSet(new Set([
            NodeType.AudioMixer,
            NodeType.MessagesMixer,
            NodeType.AvatarMixer
        ]));

        // WEBRTC TODO: Address further C++ code.

    }


    get location(): string {
        return this.#_location;
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

    set onStateChanged(callback: OnStateChangedCallback) {
        if (typeof callback === "function" || callback === null) {
            this.#_onStateChangedCallback = callback;
        } else {
            console.error("ERROR: DomainServer.onStateChanged callback not a function or null!");
            this.#_onStateChangedCallback = null;
        }
    }


    /*@sdkdoc
     *  Initiates connection of the user client to a Domain Server and keeps the connection alive.
     *  <p>The following types of location are supported:</p>
     *  <table>
     *      <tbody>
     *          <tr><td><code>WebSocket URL and port</code></td><td>For example, <code>ws://127.0.0.1:40102</code></td></tr>
     *          <tr><td colspan="2">WEBRTC TODO: Support Vircadia URLs instead (<code>hifi://...</code>, place names,
     *          ...)</td></tr>
     *      </tbody>
     *  </table>
     *  @param {string} location - The location of the Domain Server to connect to.
     */
    connect(location: string): void {
        // C++  Application.cpp's domainCheckInTimer.
        //      AddressManager.handleLoockupString() called in many different locations.

        const oldLocation = this.#_location;

        if (typeof location === "string") {
            this.#_location = location.trim();
        } else {
            console.error("ERROR: DomainServer.connect() location parameter not a string!");
            this.#_location = "";
        }

        if (this.#_location === "") {
            this.#stopDomainServerCheckins();
            this.#_nodesList.getDomainHandler().disconnect("Invalid location");
            this.#setState(DomainServer.ERROR, "No location specified.");
            return;
        }

        // If the domain hasn't changed we don't need to restart with a new connection.
        // WEBRTC TODO: Test the host rather than the full location value. Perhaps work in with AddressManager's signals,
        //              hostChanged and possibleDomainChangeRequired.
        // WEBRTC TODO: If changing domains host a DomainDisconnectRequest should probably be sent to the current domain. The
        // `            C++ currently doesn't do this so leave this for now.
        if (this.#_location === oldLocation && this.#_domainCheckInTimer) {
            return;
        }

        this.#setState(DomainServer.CONNECTING);

        this.#_addressManager.handleLookupString(location);

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
        if (this.#_state === DomainServer.DISCONNECTED) {
            return;
        }
        this.#stopDomainServerCheckins();
        this.#_nodesList.getDomainHandler().disconnect("User disconnected", true);
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
        if (hasStateChanged && this.#_onStateChangedCallback) {
            this.#_onStateChangedCallback(state, info);
        }
    }

    #sendDomainServerCheckIns(): void {
        // Schedule next send.
        this.#_domainCheckInTimer = setTimeout(() => {
            this.#sendDomainServerCheckIns();
        }, DomainServer.#DOMAIN_SERVER_CHECK_IN_MSECS);

        // Perform this send.
        this.#_nodesList.sendDomainServerCheckIn();
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
    #domainConnectionRefused = (reasonMessage: string, reasonCode: ConnectionRefusedReasonValue, extraInfo: string): void => {
        // C++  Application::domainConnectionRefused(const QString& reasonMessage, int reasonCodeInt, const QString& extraInfo)

        // WEBRTC TODO: Address further C++ code.

        this.#setState(ConnectionState.REFUSED, reasonMessage);
    };

}

export default DomainServer;
