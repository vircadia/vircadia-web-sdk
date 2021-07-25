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
import NodesList from "./domain/networking/NodesList";


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
 *  The <code>DomainServer</code> API provides the interface for connecting to a domain server.
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
 *  @property {string} refusalError - A description of the reason if <code>state == DomainServer.REFUSED</code>, otherwise
 *      <code>""</code>.
 *      <em>Read-only.</em>
 *  @property {string} errorError - A description of the reason if <code>state == DomainServer.ERROR</code>, otherwise
 *      <code>""</code>.
 *      <em>Read-only.</em>
 *  @property {DomainServer~onStateChangedCallback} onStateChanged - Sets a single function to be called when the state of the
 *      domain server connection changes.
 *      <em>Write-only.</em>
 */
class DomainServer {

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


    static readonly #DOMAIN_SERVER_CHECK_IN_MSECS = 1000;
    static readonly #DOMAIN_SERVER_CHECK_IN_MIN_MSECS = 100;


    #_location = "";
    #_state: ConnectionState = DomainServer.DISCONNECTED;
    #_refusalInfo = "";
    #_errorInfo = "";
    #_onStateChangedCallback: OnStateChangedCallback | null = null;

    #_domainCheckInTimer: ReturnType<typeof setTimeout> | null = null;
    #_domainCheckInLastSent = 0;


    constructor() {
        // C++  Application::Application()

        // WEBRTC TODO: Address further C++ code.

        const domainHandler = NodesList.getDomainHandler();
        domainHandler.connectedToDomain.connect(() => {
            this.#setState(DomainServer.CONNECTED);
        });
        domainHandler.disconnectedFromDomain.connect(() => {
            this.#setState(DomainServer.DISCONNECTED);
        });

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
        if (typeof callback !== "function") {
            this.#_onStateChangedCallback = null;
        }
        this.#_onStateChangedCallback = callback;
    }


    /*@sdkdoc
     *  Initiates connection to a Domain Server.
     *  <p>The following types of location are supported:</p>
     *  <table>
     *      <tbody>
     *          <tr><td ><code>WEBRTC TODO</code></td><td>WEBRTC TODO</td></tr>
     *      </tbody>
     *  </table>
     *  @param {string} location - The location of the Domain Server to connect to.
     */
    connect(location: string): void {

        this.#_location = typeof location === "string" ? location.trim() : "";

        if (this.#_location === "") {
            this.#setState(DomainServer.ERROR, "No location specified.");
            return;
        }


        this.#setState(DomainServer.CONNECTING);

        AddressManager.handleLookupString(location);

        // Start sending domain server check-ins.
        this.#sendDomainServerCheckIns();
    }

    /*@sdkdoc
     *  Disconnects from the domain server.
     */
    disconnect(): void {
        this.#setState(DomainServer.DISCONNECTED);
        if (this.#_domainCheckInTimer !== null) {
            clearInterval(this.#_domainCheckInTimer);
            this.#_domainCheckInTimer = null;
        }
    }


    #setState(state: ConnectionState, info = ""): void {
        this.#_state = state;
        this.#_refusalInfo = "";
        this.#_errorInfo = "";
        if (this.#_state === DomainServer.REFUSED) {
            this.#_refusalInfo = info;
        } else if (this.#_state === DomainServer.ERROR) {
            this.#_errorInfo = info;
        }
        if (this.#_onStateChangedCallback) {
            this.#_onStateChangedCallback(state, info);
        }
    }

    #sendDomainServerCheckIns(): void {
        const timestamp = Date.now();

        // Schedule next send.
        let nextTimeout = DomainServer.#DOMAIN_SERVER_CHECK_IN_MSECS - (timestamp - this.#_domainCheckInLastSent);
        nextTimeout = Math.max(nextTimeout, DomainServer.#DOMAIN_SERVER_CHECK_IN_MIN_MSECS);
        this.#_domainCheckInTimer = setTimeout(() => {
            this.#sendDomainServerCheckIns();
        }, nextTimeout);

        // Perform this send.
        NodesList.sendDomainServerCheckIn();
        this.#_domainCheckInLastSent = timestamp;
    }
}

export default DomainServer;
