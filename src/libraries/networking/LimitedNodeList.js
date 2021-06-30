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
import NodeType from "./NodeType.js";
import PacketReceiver from "./PacketReceiver.js";
import PacketType from "./udt/PacketHeaders.js";
import Socket from "./udt/Socket.js";
import assert from "../shared/assert.js";


/*@devdoc
 *  All the network nodes (assignment clients) that Interface is connected to. This includes their presence and communications
 *  with them via the Vircadia protocol.
 *  <p>Used by {@link NodesList}.</p>
 *  <p>C++: <code>LimitedNodeList : public QObject, public Dependency</code>
 *  @class LimitedNodeList
 *  @param {string} ownerType - Not used.
 *  @param {number} socketListenPort - Not used.
 *  @param {number} dtlsListenPort - Not used.
 *  @param {Object} _privateFields - Provides access for derived classes to select private fields.
 *  
 *  @property {LimitedNodeList.ConnectReason} ConnectReason - Connect reason values.
 *  @property {number} INVALID_PORT=-1 - Invalid port.
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

    static INVALID_PORT = -1;


    #_nodeSocket;  // Socket

    #_localSockAddr = new HifiSockAddr();
    #_publicSockAddr = new HifiSockAddr();

    #_packetReceiver;  // PacketReceiver


    constructor(ownerType = NodeType.DomainServer, socketListenPort = LimitedNodeList.INVALID_PORT,
        dtlsListenPort = LimitedNodeList.INVALID_PORT, _privateFields = { }) {
        // C++  LimitedNodeList(char ownerType = NodeType::DomainServer, int socketListenPort = INVALID_PORT, 
        //                      int dtlsListenPort = INVALID_PORT);

        this.#_nodeSocket = new Socket(this, true, ownerType),
        this.#_packetReceiver = new PacketReceiver();

        // WEBRTC TODO: Address further C++ code.

        this.#_nodeSocket.setPacketHandler(this.#_packetReceiver.handleVerifiedPacket); 

        // WEBRTC TODO: Address further C++ code.

        // Provide access to private fields.
        _privateFields._nodeSocket = this.#_nodeSocket;
        _privateFields._packetReceiver = this.#_packetReceiver;
    }


    /*@devdoc
     *  Sends a a solitary packet to an address, unreliably. The packet cannot be part of a multi-packet message.
     *  @param {Packet} packet - The packet to send.
     *  @param {HifiSockAddr} sockAddr - The address to send it to.
     *  @param {HMACAuth} [hmacAuth=null] - Not currently used.
     *  @returns {number} The number of bytes sent.
     */
    sendUnreliablePacket(packet, sockAddr, hmacAuth = null) {
        // C++  qint64 sendUnreliablePacket(const NLPacket& packet, const HifiSockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)

        assert(!packet.isPartOfMessage());
        assert(!packet.isReliable());

        // WEBRTC TODO: Address further C++ code.

        this.#fillPacketHeader(packet, hmacAuth);

        return this.#_nodeSocket.writePacket(packet, sockAddr);
    }

    /*@devdoc
     *  Sends a solitary packet to an address, reliably or unreliably depending on the packet. The packet cannot be part of a
     *  multi-packet message.
     *  @param {Packet} packet - The packet to send.
     *  @param {HifiSockAddr} sockAddr - The address to send it to.
     *  @param {HMACAuth} [hmacAuth=null] - Not currently used.
     *  @returns {number} The number of bytes sent.
     */
    sendPacket(packet, sockAddr, hmacAuth = null) {
        // C++  qint64 sendPacket(NLPacket* packet, const HifiSockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)
        assert(!packet.isPartOfMessage());

        if (packet.isReliable()) {

            console.error("Not implemented!");

            // WEBRTC TODO: Address further C++ code.

            return 0;

        } else {
            const size = this.sendUnreliablePacket(packet, sockAddr, hmacAuth);

            // WEBRTC TODO: Address further C++ code.

            return size;
        }
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


    #fillPacketHeader(packet, hmacAuth) {
        // C++  void fillPacketHeader(const NLPacket& packet, HMACAuth* hmacAuth = nullptr) {
        if (!PacketType.getNonSourcedPackets().has(packet.getType())) {

            console.error("Not implemented!");

            // WEBRTC TODO: Address further C++ code.

        }

        // WEBRTC TODO: Address further C++ code.

    }

}

export default LimitedNodeList;
