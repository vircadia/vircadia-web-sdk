//
//  Socket.ts
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Packet from "./Packet";
import UDT from "./UDT";
import { NodeTypeValue } from "../NodeType";
import SockAddr from "../SockAddr";
import { default as WebRTCSocket, WebRTCSocketDatagram } from "../webrtc/WebRTCSocket";
import assert from "../../shared/assert";


/*@devdoc
 *  Called to handle a received packet.
 *  @callback Socket~handlePacketCallback
 *  @param {Packet} packet - The received packet to handle.
 */
type PacketHandlerCallback = (packet: Packet) => void;


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


    // Use WebRTCSocket directly without going through an intermediary NetworkSocket as is done in C++.
    private _webrtcSocket: WebRTCSocket;

    // WEBRTC TODO: Address further C++ code.

    private _packetHandler: PacketHandlerCallback | null = null;

    private _WEBRTCSOCKET_TO_SOCKET_STATES = [Socket.UNCONNECTED, Socket.UNCONNECTED, Socket.CONNECTING, Socket.CONNECTED];


    constructor() {
        // C++  Socket(QObject* parent = 0, bool shouldChangeSocketOptions = true)
        // All parameters are unused in TypeScript code so don't implement.

        this._webrtcSocket = new WebRTCSocket();

        // Connect signals.
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._webrtcSocket.readyRead.connect(this.readPendingDatagrams);  // Method has been bound above.

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
        return this._WEBRTCSOCKET_TO_SOCKET_STATES[this._webrtcSocket.state(url.trim(), nodeType)] as number;
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
        this._webrtcSocket.connectToHost(url, nodeType, callback);
    }


    /*@devdoc
     *  Clears all connections and closes the socket, without waiting for reading and writing to complete.
     */
    clearConnections(): void {
        // C++  void clearConnections()

        // WEBRTC TODO: Address further C++ code.

        // Close WebRTC signaling and data channels.
        this._webrtcSocket.abort();
    }


    /*@devdoc
     *  Clears any connection with a given address.
     *  @param {SockAddr} sockAddr - The address to clear the connection for.
     */
    // eslint-disable-next-line
    // @ts-ignore
    cleanupConnection(sockAddr: SockAddr): void {  // eslint-disable-line
        // C++  void cleanupConnection(SockAddr sockAddr) {

        // WEBRTC TODO: Address further C++ code.

        console.warn("cleanupConnection() : Not implemented!");
    }


    /*@devdoc
     *  Sends a packet to a destination.
     *  @param {Packet} packet - The packet to send.
     *  @param {SockAddr} sockAddr - The destination to send the packet to.
     *  @returns {number} The number of bytes if successfully sent, otherwise <code>-1</code>.
     */
    writePacket(packet: Packet, sockAddr: SockAddr): number {
        // C++  qint64 writePacket(const Packet& packet, const SockAddr& sockAddr)
        assert(!packet.isReliable());

        // WEBRTC TODO: Address further C++ code.

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

        const bytesWritten = this._webrtcSocket.writeDatagram(datagram, sockAddr.getPort());

        // WEBRTC TODO: Address further C++ code.

        return bytesWritten;
    }

    /*@devdoc
     *  Sets the function called to handle a received packet.
     *  @param {Socket~handlePacketCallback} handler - The function to call to handle the received packet.
     */
    setPacketHandler(handler: PacketHandlerCallback): void {
        // C++  void setPacketHandler(PacketHandler handler)
        this._packetHandler = (packet: Packet) => {
            handler(packet);
        };
    }


    /*@devdoc
     *  Handles a change in the target node's address.
     *  @param {SockAddr} previousAddress - The previous address of the target node.
     *  @param {SockAddr} currentAddress - The current address of the target node.
     *  @returns {Slot}
     */
    handleRemoteAddressChange = (previousAddress: SockAddr, currentAddress: SockAddr): void => {
        // C++  void handleRemoteAddressChange(SockAddr previousAddress, SockAddr currentAddress)

        console.log("[networking] Remote address changes from", previousAddress.toString(), "to", currentAddress.toString());
        console.warn("handleRemoteAddressChange() : Not implemented!");

        // WEBRTC TODO: Address further C++ code.

    };

    /*@devdoc
     *  Reads datagrams from the {@link WebRTCSocket} and forwards them to the packet handler to process.
     *  @returns {Slot}
     */
    readPendingDatagrams = (): void => {
        // C++  void readPendingDatagrams();

        // WEBRTC TODO: Address further C++ code.

        while (this._webrtcSocket.hasPendingDatagrams()) {  // WEBRTC TODO: Further C++ code in condition.

            // WEBRRTC TODO: Address further C++ code.

            const datagram: WebRTCSocketDatagram = { buffer: undefined, sender: undefined };
            const sizeRead = this._webrtcSocket.readDatagram(datagram);
            if (sizeRead <= 0) {
                continue;  // eslint-disable-line no-continue
            }

            const dataView = new DataView(<ArrayBuffer>datagram.buffer);

            // WEBRTC TODO: Address further C++ code.

            const receiveTime = Date.now();

            const isControlPacket = dataView.getUint32(0, UDT.LITTLE_ENDIAN) & UDT.CONTROL_BIT_MASK;
            if (isControlPacket) {

                // WEBRTC TODO: Address further C++ code.

                console.warn("Control packets not yet implemented!");

            } else {

                const packet = Packet.fromReceivedPacket(dataView, dataView.byteLength, <SockAddr>datagram.sender);
                const messageData = packet.getMessageData();
                messageData.receiveTime = receiveTime;

                // WEBRTC TODO: Address further C++ code.

                if (packet.isReliable()) {
                    console.warn("Reliable packets not yet implemented!");

                    // WEBRTC TODO: Address further C++ code.

                    return;
                }

                // WEBRTC TODO: Address further C++ code.

                if (messageData.isPartOfMessage) {
                    console.warn("Multi-packet messages not yet implemented!");

                    // WEBRTC TODO: Address further C++ code.

                } else if (this._packetHandler) {
                    this._packetHandler(packet);
                }

            }
        }
    };

}

export default Socket;
