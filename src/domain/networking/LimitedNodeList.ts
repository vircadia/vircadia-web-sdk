//
//  LimitedNodeList.ts
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NodeType from "./NodeType";
import PacketReceiver from "./PacketReceiver";
import SockAddr from "./SockAddr";
import PacketType from "./udt/PacketHeaders";
import Socket from "./udt/Socket";
import assert from "../shared/assert";
import NLPacket from "./NLPacket";
import { LocalID } from "./DomainHandler";
import Uuid from "../shared/Uuid";


/*@devdoc
 *  The <code>LimitedNodeList</code> class manages all the network nodes (assignment clients) that the client is connected to.
 *  This includes their presence and communications with them via the Vircadia protocol.
 *  <p>See also: {@link NodesList}.</p>
 *  <p>C++: <code>LimitedNodeList : public QObject, public Dependency</code>
 *  @class LimitedNodeList
 *  @param {NodeType} ownerType=DomainServer - Not used.
 *  @param {number} socketListenPort - Not used.
 *  @param {number} dtlsListenPort - Not used.
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


    protected _nodeSocket: Socket;
    protected _localSockAddr = new SockAddr();
    protected _publicSockAddr = new SockAddr();
    protected _packetReceiver: PacketReceiver;

    private _sessionUUID = new Uuid(Uuid.NULL);
    private _sessionLocalID: LocalID = 0;


    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line
    constructor(ownerType = NodeType.DomainServer, socketListenPort = LimitedNodeList.INVALID_PORT,
        // eslint-disable-next-line
        // @ts-ignore
        dtlsListenPort = LimitedNodeList.INVALID_PORT) {  // eslint-disable-line
        // C++  LimitedNodeList(char ownerType = NodeType::DomainServer, int socketListenPort = INVALID_PORT,
        //                      int dtlsListenPort = INVALID_PORT);

        this._nodeSocket = new Socket();
        this._packetReceiver = new PacketReceiver();

        // WEBRTC TODO: Address further C++ code.

        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._nodeSocket.setPacketHandler(this._packetReceiver.handleVerifiedPacket);  // handleVerifiedPacket is bound.

        // WEBRTC TODO: Address further C++ code.

        // Bind Slot methods.
        this.reset.bind(this);
    }


    /*@devdoc
     *  Sends a a solitary packet to an address, unreliably. The packet cannot be part of a multi-packet message.
     *  @param {NLPacket} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The address to send it to.
     *  @param {HMACAuth} [hmacAuth=null] - Not currently used.
     *  @returns {number} The number of bytes sent.
     */
    sendUnreliablePacket(packet: NLPacket, sockAddr: SockAddr, hmacAuth = null): number {
        // C++  qint64 sendUnreliablePacket(const NLPacket& packet, const SockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)

        assert(!packet.isPartOfMessage());
        assert(!packet.isReliable());

        // WEBRTC TODO: Address further C++ code.

        this.fillPacketHeader(packet, hmacAuth);

        return this._nodeSocket.writePacket(packet, sockAddr);
    }

    /*@devdoc
     *  Sends a solitary packet to an address, reliably or unreliably depending on the packet. The packet cannot be part of a
     *  multi-packet message.
     *  @param {NLPacket} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The address to send it to.
     *  @param {HMACAuth} [hmacAuth=null] - Not currently used.
     *  @returns {number} The number of bytes sent.
     */
    sendPacket(packet: NLPacket, sockAddr: SockAddr, hmacAuth = null): number {
        // C++  qint64 sendPacket(NLPacket* packet, const SockAddr& sockAddr, HMACAuth* hmacAuth = nullptr)
        assert(!packet.isPartOfMessage());

        if (packet.isReliable()) {

            console.error("Not implemented!");

            // WEBRTC TODO: Address further C++ code.

            return 0;

        }

        const size = this.sendUnreliablePacket(packet, sockAddr, hmacAuth);

        // WEBRTC TODO: Address further C++ code.

        return size;
    }


    /*@devdoc
     *  Gets the client's local socket network address.
     *  @returns {SockAddr} The local socket network address.
     */
    getLocalSockAddr(): SockAddr {
        // C++  SockAddr& getLocalSockAddr()

        // WEBRTC TODO: Set correct value.

        return this._localSockAddr;
    }

    /*@devdoc
     *  Gets the client's public socket network address.
     *  @returns {SockAddr} The local socket network address.
     */
    getPublicSockAddr(): SockAddr {
        // C++  SockAddr& getPublicSockAddr()

        // WEBRTC TODO: Set correct value.

        return this._publicSockAddr;
    }

    /*@devdoc
     *  Gets the packet receiver used for handling packets received from the assignment clients.
     *  @returns {PacketReceiver} The packet receiver.
     */
    getPacketReceiver(): PacketReceiver {
        // C++  PacketReceiver& getPacketReceiver()
        return this._packetReceiver;
    }


    /*@devdoc
     *  Gets the node's UUID as assigned by the domain server  for the connection session.
     *  @returns {LocalID} The node's session UUID.
     */
    getSessionUUID(): Uuid {
        // C++  LocalID getSessionUUID()
        return this._sessionUUID;
    }

    /*@devdoc
     *  Sets the node's UUID as assigned by the domain server  for the connection session.
     *  @param {LocalID} sessionUUID - The node's session UUID.
     */
    setSessionUUID(sessionUUID: Uuid): void {
        // C++  void setSessionUUID(const QUuid& sessionUUID);
        this._sessionUUID = sessionUUID;
    }

    /*@devdoc
     *  Gets the node's local ID as assigned by the domain server for the connection session.
     *  @returns {LocalID} The node's session local ID.
     */
    getSessionLocalID(): LocalID {
        // C++  LocalID getSessionLocalID()
        return this._sessionLocalID;
    }

    /*@devdoc
     *  Sets the node's local ID as assigned by the domain server for the connection session.
     *  @param {LocalID} sessionLocalID - The node's session local ID.
     */
    setSessionLocalID(sessionLocalID: LocalID): void {
        // C++  void setSessionLocalID(LocalID sessionLocalID);
        this._sessionLocalID = sessionLocalID;
    }


    /*@devdoc
     *  Resets the NodesList, closing all connections and deleting all node data.
     *  @param {string} reason - The reason for resetting.
     *  @returns {Slot}
     */
    // eslint-disable-next-line
    // @ts-ignore
    reset(reason: string): void {  // eslint-disable-line @typescript-eslint/no-unused-vars
        // C++  void reset(QString reason)
        // Cannot declare this Slot function as an arrow function because derived NodesList class calls this function.

        // WEBRTC TODO: Address further C++ code.

        this._nodeSocket.clearConnections();

        // WEBRTC TODO: Address further C++ code.

    }


    private fillPacketHeader(packet: NLPacket, hmacAuth: null): void {
        // C++  void fillPacketHeader(const NLPacket& packet, HMACAuth* hmacAuth = nullptr) {
        if (!PacketType.getNonSourcedPackets().has(packet.getType())) {
            packet.writeSourceID(this.getSessionLocalID());
        }

        if (hmacAuth) {
            console.error("Not implemented!");

            // WEBRTC TODO: Address further C++ code.

        }
    }

}

export default LimitedNodeList;
