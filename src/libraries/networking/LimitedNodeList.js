//
//  LimitedNodeList.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HifiSockAddr from "./HifiSockAddr.js";
import PacketReceiver from "./PacketReceiver.js";


/*@devdoc
 *  All the network nodes (assignment clients) that Interface is connected to. This includes their presence and communications
 *  with them via the Vircadia protocol.
 *  <p>Used by {@link NodesList}.</p>
 *  <p>C++: <code>LimitedNodeList : public QObject, public Dependency</code>
 *  @class LimitedNodeList
 *  @property {LimitedNodeList.ConnectReason} ConnectReason - Connect reason values.
 */
class LimitedNodeList {
    // C++  LimitedNodeList : public QObject, public Dependency

    /*@devdoc
     *  The reason for requesting a connection to a domain.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>Connect</td><td>0</td><td>The client wants to connect to the domain.</td></tr>
     *          <tr><td>SilentDomainDisconnect</td><td>1</td><td>Communications with the domain have been disrupted.</td></tr>
     *          <tr><td>Awake</td><td>2</td><td>The system is waking up from sleep or hibernation.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} LimitedNodeList.ConnectReason
     */
    static ConnectReason = {
        // C++  enum ConnectReason : quint32
        Connect: 0,
        SilentDomainDisconnect: 1,
        Awake: 2
    };


    #_localSockAddr = new HifiSockAddr();
    #_publicSockAddr = new HifiSockAddr();

    #_packetReceiver;


    constructor(socketListenPort, dtlsListenPort) {
        // C++  LimitedNodeList(int socketListenPort, int dtlsListenPort)

        // WEBRTC TODO: Address further C++ code.

        this.#_packetReceiver = new PacketReceiver();

        // WEBRTC TODO: Address further C++ code.
    }


    /*@devdoc
     *  Gets the client's local socket network address.
     *  @returns {HifiSockAddr} The local socket network address.
     */
    getLocalSockAddr() {
        // C++  HifiSockAddr& getLocalSockAddr()

        // WEBRTC TODO: Set correct value.

        return this.#_localSockAddr;
    }

    /*@devdoc
     *  Gets the client's public socket network address.
     *  @returns {HifiSockAddr} The local socket network address.
     */
    getPublicSockAddr() {
        // C++  HifiSockAddr& getPublicSockAddr()

        // WEBRTC TODO: Set correct value.

        return this.#_publicSockAddr;
    }

    /*@devdoc
     *  Gets the packet receiver used for handling packets received from the assignment clients.
     *  @returns {PacketReceiver} The packet receiver.
     */
    getPacketReceiver() {
        // C++  PacketReceiver& getPacketReceiver()
        return this.#_packetReceiver;
    }

}

export default LimitedNodeList;
