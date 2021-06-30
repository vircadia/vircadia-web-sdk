//
//  DomainHandler.js
//
//  Created by David Rowe on 5 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HifiSockAddr from "./HifiSockAddr.js";
import Signal from "../shared/Signal.js";
import Uuid from "../shared/Uuid.js";


/*@devdoc
 *  Handles the connection to and the features of a domain.
 *  <p>C++: <code>DomainHandler : QObject</code></p>
 *  @class DomainHandler
 */
class DomainHandler {
    // C++  DomainHandler

    #_domainURL = null;
    #_sockAddr = new HifiSockAddr();  // For WebRTC, the port is the critical part.
    #_isConnected = false;
    #_localID = 0;
    #_uuid = Uuid.NULL;

    #_connectedToDomain = new Signal();
    #_disconnectedFromDomain = new Signal();


    constructor() {

        // Set up slots.
        this.setURLAndID = this.setURLAndID.bind(this);

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Sets the domain's UUID.
     *  @param {Uuid} uuid - The domain's UUID.
     */
    setUUID(uuid) {
        // C++  void setUUID(const QUuid& uuid)
        this.#_uuid = uuid;

        // WEBRTC TODO: Address further C++ code.
    }

    /*@devdoc
     *  Gets the domain's UUID.
     *  @returns {Uuid} The domain's UUID.
     */
    getUUID() {
        // C++ QUuid& getUUID()
        return this.#_uuid;
    }

    /*@devdoc
     *  Sets the domain's local ID.
     *  @param {LocalID} localID - The domain's local ID.
     */
    setLocalID(localID) {
        // C++ void setLocalID(LocalID localID)
        this.#_localID = localID;
    }

    /*@devdoc
     *  Gets the domain's local ID.
     *  @returns {LocalID} The domain's local ID.
     */
    getLocalID() {
        // C++  LocalID getLocalID()
        return this.#_localID;
    }

    /*@devdoc
     *  Gets the current domain's URL. <em>JavaScript-specific method.</em>
     *  <p>Note: The web app uses the domain's URL rather than its IP address.<p>
     *  @returns {string} The current domain's URL.
     */
    getURL() {
        // C++  WebRTC-specific method.

        // WEBRTC TODO: Revisit using URL versus IP address..

        return this.#_domainURL;
    }

    /*@devdoc
     *  Gets the domain's address.
     *  @returns {HifiSockAddr} The domain's address.
     */
    getSockAddr() {
        // C++  HifiSockAddr& getSockAddr()
        return this.#_sockAddr;
    }

    /*@devdoc
     *  Sets the domain's network port.
     *  @param {number} port - The domain's network port.
     */
    setPort(port) {
        // C++  void setPort(quint16 port)
        this.#_sockAddr.setPort(port);
    }

    /*@devdoc
     *  Gets the domain's network port.
     *  @returns {number} The domain's network port.
     */
    getPort() {
        // C++  unsigned short getPort()
        return this.#_sockAddr.getPort();
    }

    /*@devdoc
     *  Gets whether Interface is connected to the domain.
     *  @returns {boolean} <code>true</code> if connect to the domain, <code>false</code> if not connected.
     */
    isConnected() {
        // C++  bool isConnected()
        return this.#_isConnected;
    }

    /*@devdoc
     *  Sets whether Interface is connected to the domain.
     *  @param {boolean} isConnected - <code>true</code> if Interface is connected to the domain, <code>false</code> if it
     *      isn't.
     */
    setIsConnected(isConnected) {
        // C++  void setIsConnected(bool isConnected)
        if (this.#_isConnected !== isConnected) {
            this.#_isConnected = isConnected;
            if (this.#_isConnected) {

                // WEBRTC TODO: Address further C++ code.

                this.connectedToDomain.emit(this.#_domainURL);

                // WEBRTC TODO: Address further C++ code.

            } else {
                this.disconnectedFromDomain.emit();
            }
        }
    }

    /*@devdoc
     *  Gets whether Interface's connection to the domain server has timed out &mdash; it hasn't been responding to
     *  DomainConnectRequest and DomainListRequest packets for a while.
     *  @returns {boolean} <code>true</code> if Interface's connection to the domain server has timed out, <code>false</code> if
     *      it hasn't.
     */
    // eslint-disable-next-line class-methods-use-this
    checkInPacketTimeout() {
        // C++  bool checkInPacketTimeout()

        // WEBRTC TODO: Address further C++ code. And add an integration test.

        return false;
    }


    /*@devdoc
     *  Sets the current domain's URL and pending ID.
     *  @function DomainHandler.setURLAndID
     *  @param {string} url - The domain's URL.
     *  @param {Uuid} id - The domain's pending ID.
     *  @returns {Slot}
     */
    setURLAndID(url, id) {
        // C++  void setURLAndID(QUrl domainURL, QUuid domainID)

        // WEBRTC TODO: Address further C++ code.

        this.#_domainURL = url;

        // WEBRTC TODO: Address further C++ code.
    }


    /*@devdoc
     *  Triggered when Interface connects to then domain.
     *  @function DomainHandler.connectedToDomain
     *  @param {string} domainURL - The domain's URL.
     *  @returns {Signal}
     */
    get connectedToDomain() {
        // C++  void connectedToDomain(QUrl domainURL)
        return this.#_connectedToDomain;
    }

    /*@devdoc
     *  Triggered when Interface disconnects from the domain.
     *  @function DomainHandler.disconnectedFromDomain
     *  @returns {Signal}
     */
    get disconnectedFromDomain() {
        // C++  void disconnectedFromDomain()
        return this.#_disconnectedFromDomain;
    }

}

export default DomainHandler;
