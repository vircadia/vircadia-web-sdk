//
//  Socket.ts
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import BasePacket from "./BasePacket";
import CongestionControl from "./CongestionControl";
import Connection from "./Connection";
import ControlPacket from "./ControlPacket";
import Packet from "./Packet";
import SequenceNumber from "./SequenceNumber";
import UDT from "./UDT";
import NLPacket from "../NLPacket";
import NLPacketList from "../NLPacketList";
import { NodeTypeValue } from "../NodeType";
import SockAddr from "../SockAddr";
import { default as WebRTCSocket, WebRTCSocketDatagram } from "../webrtc/WebRTCSocket";
import assert from "../../shared/assert";


type PacketHandlerCallback = (packet: Packet) => void;
type MessageHandlerCallback = (packet: Packet) => void;
type MessageFailureHandlerCallback = (sockaAddr: SockAddr, messageNumber: number) => void;
type ConnectionCreationFilterOperator = (sockAddr: SockAddr) => boolean;
type PacketFilterOperator = (packet: Packet) => boolean;


/*@devdoc
 *  The <code>Socket</code> class provides a one-to-many socket used to communicate with a domain's domain server and
 *  assignment clients. Internally, a {@link WebRTCSocket} is used for the network connections.
 *  <p>C++: <code>Socket : public QObject</code></p>
 *  @class Socket
 *  @property {Socket.ConnectionState} UNCONNECTED - There is no connection.
 *      <em>Static. Read-only.</em>
 *  @property {Socket.ConnectionState} CONNECTING - A connection is being made.
 *      <em>Static. Read-only.</em>
 *  @property {Socket.ConnectionState} CONNECTED - A connection has been established.
 *      <em>Static. Read-only.</em>
 */
class Socket {
    // C++  Socket : public QObject

    /*@devdoc
     *  The state of a socket connection.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNCONNECTED</td><td>0</td><td>There is no connection.</td></tr>
     *          <tr><td>CONNECTING</td><td>1</td><td>A connection is being made.</td></tr>
     *          <tr><td>CONNECTED</td><td>2</td><td>A connection has been established.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} Socket.ConnectionState
     */
    static readonly UNCONNECTED = 0;
    static readonly CONNECTING = 1;
    static readonly CONNECTED = 2;

    static readonly #WEBRTCSOCKET_TO_SOCKET_STATES = [
        Socket.UNCONNECTED,
        Socket.CONNECTING,
        Socket.CONNECTING,
        Socket.CONNECTED
    ];

    static UDT_CONNECTION_DEBUG = false;


    // Use WebRTCSocket directly without going through an intermediary NetworkSocket as is done in C++.
    #_webrtcSocket: WebRTCSocket;
    #_packetFilterOperator: PacketFilterOperator | null = null;

    // WEBRTC TODO: Address further C++ code.

    #_packetHandler: PacketHandlerCallback | null = null;
    #_messageHandler: MessageHandlerCallback | null = null;
    #_messageFailureHandler: MessageFailureHandlerCallback | null = null;

    // WEBRTC TODO: Address further C++ code.

    #_connectionCreationFilterOperator: ConnectionCreationFilterOperator | null = null;

    // WEBRTC TODO: Address further C++ code.

    #_unreliableSequenceNumbers: Map<number, SequenceNumber> = new Map();  // Map<SockAdd port, SequenceNumber>
    #_connectionsHash: Map<number, Connection> = new Map();  // Map<port number, Connection>

    // WEBRTC TODO: Address further C++ code.


    constructor() {
        // C++  Socket(QObject* parent = 0, bool shouldChangeSocketOptions = true)
        // All parameters are unused in TypeScript code so don't implement.

        this.#_webrtcSocket = new WebRTCSocket();

        // Connect signals.
        this.#_webrtcSocket.readyRead.connect(this.readPendingDatagrams);

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Gets the state of the connection to a node.
     *  @param {string} URL - The URL of the domain server.
     *  @param {NodeType} nodeType - The type of node.
     *  @returns {Socket.ConnectionState} The state of the connection.
     */
    getSocketState(url: string, nodeType: NodeTypeValue): number {
        // C++  N/A
        return Socket.#WEBRTCSOCKET_TO_SOCKET_STATES[this.#_webrtcSocket.state(url.trim(), nodeType)] as number;
    }

    /*@devdoc
     *  Called when a socket is successfully opened.
     *  @callback Socket~openSocketCallback
     *  @param {number} socketID - The ID of the socket connection. This is considered to be the "port" number.
     */
    /*@devdoc
     *  Opens a connection to a node.
     *  @param {string} URL - The URL of the domain server.
     *  @param {NodeType} nodeType - The type of node to connect to.
     *  @param {Socket~openSocketCallback} callback - Function to call when the connection has been opened.
     */
    // Note: Not called "openConnection" because a "Connection" is a distinct type of object.
    openSocket(url: string, nodeType: NodeTypeValue, callback: (socketID: number) => void): void {
        // C++  N/A
        this.#_webrtcSocket.connectToHost(url, nodeType, callback);
    }


    /*@devdoc
     *  Clears all connections and closes the socket, without waiting for reading and writing to complete.
     */
    clearConnections(): void {
        // C++  void clearConnections()

        if (this.#_connectionsHash.size > 0) {
            console.log("[networking] Clearing all remaining connections in Socket.");
            this.#_connectionsHash.clear();
        }

        // Close WebRTC signaling and data channels.
        this.#_webrtcSocket.abort();
    }


    /*@devdoc
     *  Clears any connection with a given address.
     *  @param {SockAddr} sockAddr - The address to clear the connection for.
     */
    // eslint-disable-next-line
    // @ts-ignore
    cleanupConnection(sockAddr: SockAddr): void {  // eslint-disable-line
        // C++  void cleanupConnection(SockAddr sockAddr) {

        // eslint-disable-next-line @typescript-eslint/dot-notation
        const connectionErased = this.#_connectionsHash.delete(sockAddr.getPort());
        if (connectionErased && Socket.UDT_CONNECTION_DEBUG) {
            console.log("[networking] Socket.cleanupConnection called for connection to", sockAddr.toString());
        }
    }

    /*@devdoc
     *  Sends a control packet to a destination. Cannot be used to send Packet or NLPacket packets.
     *  @param {BasePacket} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The destination to send the packet to.
     */
    writeBasePacket(packet: BasePacket, sockAddr: SockAddr): number {
        // C++  qint64 writeBasePacket(const BasePacket& packet, const SockAddr &sockAddr)
        // Since this is a base packet we have no way to know if this is reliable or not - we just fire it off.

        // This should not be called with an instance of Packet.
        assert(!(packet instanceof Packet || packet instanceof NLPacket), "Socket.writeBasePacket",
            "Cannot send a Packet/NLPacket via writeBasePacket.");

        return this.writeDatagram(packet.getMessageData().buffer, packet.getDataSize(), sockAddr);
    }

    /*@devdoc
     *  Sends a packet to a destination.
     *  @param {Packet} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The destination to send the packet to.
     *  @returns {number} The number of bytes if successfully sent, otherwise <code>-1</code>.
     */
    writePacket(packet: Packet, sockAddr: SockAddr): number {
        // C++  qint64 writePacket(const Packet& packet, const SockAddr& sockAddr)

        // WEBRTC TODO: Address further C++ code. - Handle sending reliable packets. (There are two variants of this method.)

        assert(!packet.isReliable(), "Sending a reliable packet is not implemented.");

        let sequenceNumber = this.#_unreliableSequenceNumbers.get(sockAddr.getPort());
        if (sequenceNumber === undefined) {
            sequenceNumber = new SequenceNumber(1);
        } else {
            sequenceNumber.increment();
        }
        this.#_unreliableSequenceNumbers.set(sockAddr.getPort(), sequenceNumber);

        // WEBRTC TODO: Address further C++ code.

        packet.writeSequenceNumber(sequenceNumber);

        return this.writeDatagram(packet.getMessageData().data.buffer, packet.getDataSize(), sockAddr);
    }

    /*@devdoc
     *  Sends a datagram to a destination.
     *  @param {ArrayBuffer} data - The datagram to send.
     *  @param {number} size - The maximum number of bytes to send.
     *  @param {SockAddr} sockAddr - The destination to send the datagram to.
     *  @returns {number} The number of bytes if successfully sent, otherwise <code>-1</code>.
     */
    writeDatagram(data: ArrayBuffer, size: number, sockAddr: SockAddr): number {
        // C++  qint64 writeDatagram(const char* data, qint64 size, const SockAddr& sockAddr);

        const datagram = data.byteLength <= size ? data : data.slice(0, size);

        // C++  qint64 writeDatagram(const QByteArray& datagram, const SockAddr& sockAddr);
        // In-line this method because it's only called by the parent.

        // WEBRTC TODO: Address further C++ code.

        const bytesWritten = this.#_webrtcSocket.writeDatagram(datagram, sockAddr.getPort());

        // WEBRTC TODO: Address further C++ code.

        return bytesWritten;
    }


    /*@devdoc
     *  Called to filter the handling of a received packet.
     *  @callback Socket~packetFilterOperator
     *  @param {Packet} packet - The packet to filter.
     *  @returns {boolean} <code>true</code> if the packet should be handled, <code>false</code> if it should be discarded.
     */
    /*@devdoc
     *  Sets the function called to filter a received packet.
     *  @param {Socket~handlePacketCallback} handler - The function to call to filter the received packet.
     */
    setPacketFilterOperator(filterOperator: PacketFilterOperator): void {
        // C++  void setPacketFilterOperator(PacketFilterOperator filterOperator)
        this.#_packetFilterOperator = filterOperator;
    }

    /*@devdoc
     *  Called to handle a received packet.
     *  @callback Socket~handlePacketCallback
     *  @param {Packet} packet - The received packet to handle.
     */
    /*@devdoc
     *  Sets the function called to handle a received packet.
     *  @param {Socket~handlePacketCallback} handler - The function to call to handle the received packet.
     */
    setPacketHandler(handler: PacketHandlerCallback): void {
        // C++  void setPacketHandler(PacketHandler handler)
        this.#_packetHandler = (packet: Packet) => {
            handler(packet);
        };
    }

    /*@devdoc
     *  Called to handle a received packet.
     *  @callback Socket~handleMessageCallback
     *  @param {Packet} message - The received message to handle.
     */
    /*@devdoc
     *  Sets the function called to handle a received multi-packet message.
     *  @param {Socket~handleMessageCallback} handler - The function to call to handle the received message.
     */
    setMessageHandler(handler: MessageHandlerCallback): void {
        // C++  void setMessageHandler(MessageHandler handler)
        this.#_messageHandler = handler;
    }

    /*@devdoc
     *  Called to handle the failure to receive a multi-packet message.
     *  @callback Socket~handleMessageFailureCallback
     *  @param {SockAddr} sockAddr - The message sender.
     *  @param {number} messageNumber - The message number.
     */
    /*@devdoc
     *  Sets the function called to handle the failure to receive a multi-packet message.
     *  @param {Socket~handleMessageFailureCallback} handler - The function to call to handle the failure to receive a message.
     */
    setMessageFailureHandler(handler: MessageFailureHandlerCallback): void {
        // C++  void setMessageFailureHandler(MessageFailureHandler handler)
        this.#_messageFailureHandler = handler;
    }

    /*@devdoc
     *  Called to filter the creation of a connection to an address.
     *  @callback Socket~connectionCreationFilterOperator
     *  @param {SockAddr} sockAddr - The address to filter.
     *  @returns {boolean} <code>true</code> if the address is known and so connection should be allowed, <code>false</code> if
     *      it isn't known.
     */
    /*@devdoc
     *  Sets the function to use for filtering making connections to an address.
     *  @param {Socket~connectionCreationFilterOperator} filterOperator - The filter function.
     */
    setConnectionCreationFilterOperator(filterOperator: ConnectionCreationFilterOperator): void {
        // C++  void setConnectionCreationFilterOperator(ConnectionCreationFilterOperator filterOperator)
        this.#_connectionCreationFilterOperator = filterOperator;
    }

    /*@devdoc
     *  Sends an {@NLPacketList} to an address.
     *  @param {NLPacketList} packetList - The packet list to send.
     *  @param {SockAddr} sockAddr - The address to send the packet list to.
     *  @returns {number} The number of bytes known to have been sent &mdash; <code>0</code> if the packet list has been queued
     *      to send reliably.
     */
    writePacketList(packetList: NLPacketList, sockAddr: SockAddr): number {
        // C++  qint64 writePacketList(PacketList* packetList, const SockAddr& sockAddr)

        if (packetList.getNumPackets() === 0) {
            console.warn("[networking] Trying to send packet list with 0 packets, bailing.");
            return 0;
        }

        if (packetList.isReliable()) {
            this.#writeReliablePacketList(packetList, sockAddr);
            return 0;
        }

        // Unreliable and unordered.
        let totalBytesSent = 0;
        while (packetList.getNumPackets() > 0) {
            totalBytesSent += this.writePacket(packetList.takeFront(), sockAddr);
        }
        return totalBytesSent;
    }


    /*@devdoc
     *  Handles a change in the target node's address.
     *  @function Socket.handleRemoteAddressChange
     *  @type {Slot}
     *  @param {SockAddr} previousAddress - The previous address of the target node.
     *  @param {SockAddr} currentAddress - The current address of the target node.
     */
    handleRemoteAddressChange = (previousAddress: SockAddr, currentAddress: SockAddr): void => {
        // C++  void handleRemoteAddressChange(SockAddr previousAddress, SockAddr currentAddress)

        console.log("[networking] Remote address changes from", previousAddress.toString(), "to", currentAddress.toString());
        console.warn("handleRemoteAddressChange() : Not implemented!");

        // WEBRTC TODO: Address further C++ code.

        const connection = this.#_connectionsHash.get(previousAddress.getPort());
        // Don't move values that are unused so far.
        if (connection && connection.hasReceivedHandshake()) {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this.#_connectionsHash.delete(previousAddress.getPort());

            connection.setDestinationAddress(currentAddress);
            this.#_connectionsHash.set(currentAddress.getPort(), connection);
            console.log("[networking] Moved Connection class from", previousAddress.toString(), "to",
                currentAddress.toString());

            const sequenceNumber = this.#_unreliableSequenceNumbers.get(previousAddress.getPort());
            if (sequenceNumber !== undefined) {
                // eslint-disable-next-line @typescript-eslint/dot-notation
                this.#_unreliableSequenceNumbers.delete(previousAddress.getPort());
                this.#_unreliableSequenceNumbers.set(currentAddress.getPort(), sequenceNumber);
            }
        }
    };

    /*@devdoc
     *  Reads datagrams from the {@link WebRTCSocket} and forwards them to the packet handler to process.
     *  @function Socket.readPendingDatagrams
     *  @type {Slot}
     */
    readPendingDatagrams = (): void => {
        // C++  void readPendingDatagrams();

        // WEBRTC TODO: Address further C++ code.

        while (this.#_webrtcSocket.hasPendingDatagrams()) {  // WEBRTC TODO: Further C++ code in condition.

            // WEBRRTC TODO: Address further C++ code. - Processing timeout.

            // WEBRRTC TODO: Address further C++ code. - readyRead() backup.

            const receiveTime = Date.now();

            const datagram: WebRTCSocketDatagram = { buffer: undefined, sender: undefined };
            const sizeRead = this.#_webrtcSocket.readDatagram(datagram);

            // WEBRTC TODO: Address further C++ code. - readyRead() backup.

            if (sizeRead <= 0) {
                continue;  // eslint-disable-line no-continue
            }
            assert(datagram.sender !== undefined);

            const dataView = new DataView(<ArrayBuffer>datagram.buffer);

            // WEBRTC TODO: Address further C++ code. - Unfiltered handlers.

            const isControlPacket = dataView.getUint32(0, UDT.LITTLE_ENDIAN) & UDT.CONTROL_BIT_MASK;
            if (isControlPacket) {

                // Set up a control packet from the data we just read.
                const controlPacket = ControlPacket.fromReceivedPacket(dataView, dataView.byteLength, datagram.sender);
                controlPacket.setReceiveTime(receiveTime);

                // Process this control packet in the matching connection, if there is one.
                const connection = this.#findOrCreateConnection(datagram.sender, true);
                if (connection) {
                    connection.processControl(controlPacket);
                }

            } else {

                const packet = Packet.fromReceivedPacket(dataView, dataView.byteLength, datagram.sender);
                const messageData = packet.getMessageData();
                messageData.receiveTime = receiveTime;

                // WEBRRTC TODO: Address further C++ code. - readyRead() backup.

                // Call our verification operator to see if this packet is verified.
                if (!this.#_packetFilterOperator || this.#_packetFilterOperator(packet)) {
                    let connection = this.#findOrCreateConnection(datagram.sender, true);

                    if (packet.isReliable()) {
                        // If this is a reliable packet then signal the matching connection with the sequence number.

                        if (!connection
                            || !connection.processReceivedSequenceNumber(new SequenceNumber(messageData.sequenceNumber)
                            /* , packet.getDataSize(), packet.getPayloadSize() */)) {
                            // The connection could not be created or indicated that we should not continue processing packet.
                            if (Socket.UDT_CONNECTION_DEBUG) {
                                console.log("[networking] Can't process packet: type", NLPacket.typeInHeader(packet),
                                    ", version", NLPacket.versionInHeader(packet));

                            }
                            // eslint-disable-next-line no-continue
                            continue;
                        }

                        // WEBRTC TODO: Address further C++ code. - Connection stats.

                    }

                    if (messageData.isPartOfMessage) {
                        // WEBRTC TODO: May no need to find again?
                        connection = this.#findOrCreateConnection(datagram.sender, true);
                        if (connection) {
                            connection.queueReceivedMessagePacket(packet);
                        }

                    } else if (this.#_packetHandler) {
                        // Call the verified packet callback to let it handle this packet.
                        this.#_packetHandler(packet);
                    }
                }
            }
        }
    };

    /*@devdoc
     *  Handles a packet from a multi-packet message by calling the message handler that has been set. The packet is assumed to
     *  be in order relative to its message.
     *  @param {Packet} packet - The complete multi-packet message received.
     */
    messageReceived(packet: Packet): void {
        // C++  void messageReceived(Packet* packet)
        if (this.#_messageHandler) {
            this.#_messageHandler(packet);
        }
    }

    /*@devdoc
     *  Handles the failure to receive a complete multi-packet message.
     *  @param {Connection} connection - The connection that the message was being received on.
     *  @param {number} messageNumber - The message number that was being received.
     */
    messageFailed(connection: Connection, messageNumber: number): void {
        // C++  void messageFailed(Connection* connection, MessageNumber messageNumber)
        if (this.#_messageFailureHandler) {
            this.#_messageFailureHandler(connection.getDestination(), messageNumber);
        }
    }


    #writeReliablePacketList(packetList: NLPacketList, sockAddr: SockAddr): void {
        // C++  void writeReliablePacketList(PacketList* packetList, const SockAddr& sockAddr)
        const connection = this.#findOrCreateConnection(sockAddr);
        if (connection) {
            connection.sendReliablePacketList(packetList);
        } else if (Socket.UDT_CONNECTION_DEBUG) {
            console.log("[networking] Socket.writeReliablePacketList refusing to send packet list - no connection was created");
        }
    }

    #findOrCreateConnection(sockAddr: SockAddr, filterCreate = false): Connection | null {
        // C++  Connection* findOrCreateConnection(const SockAddr& sockAddr, bool filterCreate = false) {

        let connection = this.#_connectionsHash.get(sockAddr.getPort());

        if (connection === undefined) {
            // We did not have a matching connection, time to see if we should make one.

            if (filterCreate && this.#_connectionCreationFilterOperator && !this.#_connectionCreationFilterOperator(sockAddr)) {
                // The connection creation filter did not allow us to create a new connection.
                if (Socket.UDT_CONNECTION_DEBUG) {
                    console.log("[networking] Socket.findOrCreateConnection refusing to create Connection class for",
                        sockAddr.toString(), "due to connection creation filter");
                }
                return null;
            }

            const congestionControl = new CongestionControl();
            // Don't need to call congestionControl.setMaxBandwidth() because this is only changed in the asset server.
            connection = new Connection(this, sockAddr, congestionControl);

            // WEBRTC TODO: Address further C++ code.

            console.log("[networking] Creating new Connection class for", sockAddr.toString());

            this.#_connectionsHash.set(sockAddr.getPort(), connection);
        }

        return connection;
    }

}

export default Socket;
