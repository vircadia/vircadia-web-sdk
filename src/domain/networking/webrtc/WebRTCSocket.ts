//
//  WebRTCSocket.ts
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import WebRTCDataChannel from "./WebRTCDataChannel";
import WebRTCSignalingChannel from "./WebRTCSignalingChannel";
import { NodeTypeValue } from "../NodeType";
import SockAddr from "../SockAddr";
import Signal from "../../shared/Signal";


type WebRTCSocketDatagram = { buffer: ArrayBuffer | undefined, sender: SockAddr | undefined };

type WebRTCDataChannelsByNodeType = Map<NodeTypeValue, { channelID: number, webrtcDataChannel: WebRTCDataChannel }>;
type WebRTCDataChannelsByChannelID = Map<number, { nodeType: NodeTypeValue, webrtcDataChannel: WebRTCDataChannel }>;


/*@devdoc
 *  The <code>WebRTCSocket</code> class provides a one-to-many UDP-style socket wrapper for {@link WebRTCDataChannel} and
 *  {@link WebRTCSignalingChannel}. It uses these to provide WebRTC data channels to the domain server and assignment clients
 *  of a particular domain. The domain server and assignment clients are all considered to be at the same IP address (that of
 *  the domain server's WebRTC signaling channel) even though they may be at different IP addresses. The port numbers
 *  (internally-assigned WebRTC data channel IDs) distinguish the different connections.
 *  <p>C++: <code>WebRTCSocket : public QObject</code></p>
 *  <p>The JavaScript differs from the C++ because the JavaScript client explicitly connects to specific domains rather than
 *  accepting incoming connections.</p>
 *
 *  @class WebRTCSocket
 *  @property {WebRTCSocket.State} UNCONNECTED - There is no connection to the node on the domain.</td></tr>
 *  @property {WebRTCSocket.State} SIGNALING - A WebRTC signaling channel is open or being established.</td></tr>
 *  @property {WebRTCSocket.State} CONNECTING - A WebRTC data channel is being established.</td></tr>
 *  @property {WebRTCSocket.State} CONNECTED - There is a connection to the node on the domain.</td></tr>
 */
class WebRTCSocket {
    // C++  WebRTCSocket : public QObject
    //      WebRTCDataChannels : public QObject - incorporates some functionality from this.

    /*@devdoc
     *  Received datagram data and information.
     *  @typedef {object} WebRTCSocket.Datagram
     *  @property {ArrayBuffer} buffer - The datagram data.
     *  @property {SockAddr} sender - The sender that the datagram was received from.
     */


    /*@devdoc
     *  The state of a WebRTCDataChannel connection.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNCONNECTED</td><td>0</td><td>There is no connection to the node on the domain.</td></tr>
     *          <tr><td>SIGNALING</td><td>1</td><td>A WebRTC signaling channel is open or being established.</td></tr>
     *          <tr><td>CONNECTING</td><td>2</td><td>A WebRTC data channel is being established.</td></tr>
     *          <tr><td>CONNECTED</td><td>3</td><td>There is a connection to the node on the domain.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} WebRTCSocket.State
     */
    static readonly UNCONNECTED = 0;
    static readonly SIGNALING = 1;
    static readonly CONNECTING = 2;
    static readonly CONNECTED = 3;


    // A single WebRTC signaling channel connected to the domain server for use in establishing WebRTC connections with both the
    // domain server and each assignment client.
    #_webrtcSignalingChannel: WebRTCSignalingChannel | null = null;
    #_webrtcSignalingChannelAddress = "";

    // A WebRTC data channel per domain server and assignment client node.
    #_webrtcDataChannelsByNodeType: WebRTCDataChannelsByNodeType = new Map();
    #_webrtcDataChannelsByChannelID: WebRTCDataChannelsByChannelID = new Map();

    // WebRTC data channel IDs are assigned by us and are the equivalent of UDP ports.
    // WEBRTC TODO: Move into WebRTCDataChannel and make read-only.
    // WEBRTC TODO: Reimplement as a generator function?
    #_lastDataChannelID = 0;  // First data channel ID is 1.

    #_receivedQueue: Array<{ channelID: number, message: ArrayBuffer }> = [];

    #_readyRead = new Signal();


    constructor() {  // eslint-disable-line @typescript-eslint/no-useless-constructor
        // C++  WebRTCSocket(QObject* parent)

        // WEBRTC TODO: Address further C++ code.

    }


    /*@devdoc
     *  Gets the state of the socket for a specified domain and node type.
     *  @param {string} url - The URL of the domain.
     *  @param {NodeType} nodeType - The node type.
     *  @returns {WebRTCSocket.State} The state of the socket for the node type on the domain.
     */
    state(url: string, nodeType: NodeTypeValue): number {
        // C++  N/A
        if (url !== this.#_webrtcSignalingChannelAddress) {
            return WebRTCSocket.UNCONNECTED;
        }

        if (this.#_webrtcDataChannelsByNodeType.has(nodeType)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            switch (this.#_webrtcDataChannelsByNodeType.get(nodeType)!.webrtcDataChannel.readyState) {
                case WebRTCDataChannel.OPEN:
                    return WebRTCSocket.CONNECTED;
                case WebRTCDataChannel.CONNECTING:
                    return WebRTCSocket.CONNECTING;
                default:
                    // Fall through.
            }
        }
        if (nodeType === NodeTypeValue.DomainServer && this.#_webrtcSignalingChannel !== null) {
            switch (this.#_webrtcSignalingChannel.readyState) {
                case WebRTCSignalingChannel.OPEN:
                case WebRTCSignalingChannel.CONNECTING:
                    return WebRTCSocket.SIGNALING;
                default:
                    // Fall through.
            }
        }
        return WebRTCSocket.UNCONNECTED;
    }

    /*@devdoc
     *  Called when a connection is successfully established.
     *  @callback WebRTCSocket~connectToHostCallback
     *  @param {number} socketID - The WebRTC data channel ID of the socket connection. This is considered to be the "port"
     *      number.
     */
    /*@devdoc
     *  Connect to a specific type of node on a domain. If the domain is different to the one currently connected to, all
     *  connections to the current domain are closed.
     *  @param {string} url - The URL of the domain to connect to.
     *  @param {NodeType} nodeType - The type of node to connect to.
     *  @param {WebRTCSocket~connectToHostCallback} callback - Function to call when the connection has been established.
     */
    connectToHost(url: string, nodeType: NodeTypeValue, callback: (socketID: number) => void): void {
        // C++  N/A

        // Close any current connections if for a different URL.
        if (url !== this.#_webrtcSignalingChannelAddress) {
            this.#closeWebRTCDataChannels();
            this.#closeWebRTCSignalingChannel();
        }

        // Adopt the URL.
        this.#_webrtcSignalingChannelAddress = url.trim();
        if (url.length === 0) {
            return;
        }

        // Open signaling channel if not already open, and data channel.
        if (this.#_webrtcSignalingChannel === null
                || this.#_webrtcSignalingChannel.readyState === WebRTCSignalingChannel.CLOSED) {
            this.#openWebRTCSignalingChannel(() => {
                this.#openWebRTCDataChannel(nodeType, callback);
            });
        } else {
            this.#openWebRTCDataChannel(nodeType, callback);
        }
    }

    /*@devdoc
     *  Immediately closes all connections and clears the receive queue and without waiting for any outgoing data to complete
     *  being sent.
     */
    abort(): void {
        // C++  N/A
        this.#closeWebRTCDataChannels();
        this.#closeWebRTCSignalingChannel();
        while (this.#_receivedQueue.length > 0) {
            this.#_receivedQueue.pop();
        }
    }


    /*@devdoc
     *  Gets whether there are any datagrams waiting to be read.
     *  @returns {boolean} <code>true</code> if there is a datagram waiting to be read, <code>false</code> if there isn't.
     */
    hasPendingDatagrams(): boolean {
        // C++  bool hasPendingDatagrams()
        return this.#_receivedQueue.length > 0;
    }

    /*@devdoc
     *  Reads the next datagram, up to a maximum number of bytes.
     *  Any remaining data in the datagram is lost.
     *  @param {WebRTCSocket.Datagram} datagram The destination object to read the datagram into.
     *  @param {number} [maxSize=-1] The maximum number of bytes to read. <code>-1</code> to read all bytes in the datagram.
     *  @returns {number} The number of bytes read on success; <code>-1</code> if reading unsuccessful.
     */
    readDatagram(datagram: WebRTCSocketDatagram, maxSize = -1): number {
        // C++  qint64 readDatagram(char* data, qint64 maxSize, QHostAddress* address = nullptr, quint16* port = nullptr);

        // WEBRTC TODO: Address further C++.

        const data = this.#_receivedQueue.shift();
        if (data) {
            const length = maxSize >= 0 ? Math.min(data.message.byteLength, maxSize) : data.message.byteLength;

            if (length === data.message.byteLength) {
                datagram.buffer = data.message;
            } else {
                datagram.buffer = data.message.slice(0, length);
            }

            datagram.sender = new SockAddr();
            datagram.sender.setPort(data.channelID);

            return length;
        }

        // WEBRTC TODO: Address further C++.

        return -1;
    }

    /*@devdoc
     *  Sends a datagram on a data channel.
     *  @param {ArrayBuffer} datagram The datagram to send.
     *  @param {number} port The data channel ID.
     *  @returns {number} The number of bytes if successfully sent, otherwise <code>-1</code>.
     */
    writeDatagram(datagram: ArrayBuffer, port: number): number {
        // C++  qint64 writeDatagram(const QByteArray& datagram, quint16 port);

        // WEBRTC TODO: Address further code.

        const dataChannel = this.#_webrtcDataChannelsByChannelID.get(port);
        if (dataChannel && dataChannel.webrtcDataChannel.send(datagram)) {
            return datagram.byteLength;
        }

        // WEBRTC TODO: Address further code.

        return -1;
    }


    /*@devdoc
     *  Triggered each time new data becomes available for reading.
     *  @function WebRTCSocket.readyRead
     *  @returns {Signal}
     */
    get readyRead(): Signal {
        // C++  void readyRead()
        return this.#_readyRead;
    }


    #openWebRTCSignalingChannel(callback: () => void): void {
        // C++  WebRTC-specific method
        this.#_webrtcSignalingChannel = new WebRTCSignalingChannel(this.#_webrtcSignalingChannelAddress);
        this.#_webrtcSignalingChannel.onopen = callback;
    }

    #closeWebRTCSignalingChannel(): void {
        // C++  N/A
        if (this.#_webrtcSignalingChannel) {
            this.#_webrtcSignalingChannel.close();
            this.#_webrtcSignalingChannel = null;
        }
    }

    #openWebRTCDataChannel(nodeType: NodeTypeValue, callback: (socketID: number) => void): void {
        // C++  WebRTC-specific method
        if (this.#_webrtcSignalingChannel === null) {
            return;
        }
        const webrtcDataChannel = new WebRTCDataChannel(nodeType, this.#_webrtcSignalingChannel);
        webrtcDataChannel.onopen = () => {
            this.#_lastDataChannelID += 1;
            const channelID = this.#_lastDataChannelID;
            webrtcDataChannel.id = channelID;
            this.#_webrtcDataChannelsByNodeType.set(nodeType, { channelID, webrtcDataChannel });
            this.#_webrtcDataChannelsByChannelID.set(channelID, { nodeType, webrtcDataChannel });
            if (callback) {
                callback(channelID);
            }
        };
        webrtcDataChannel.onmessage = (message) => {
            const channelID = webrtcDataChannel.id;
            this.#_receivedQueue.push({ channelID, message });
            this.#_readyRead.emit();
        };
    }

    #closeWebRTCDataChannels(): void {
        // C++  WebRTC-specific method
        this.#_webrtcDataChannelsByNodeType.forEach((dataChannel) => {
            if (dataChannel.webrtcDataChannel) {
                dataChannel.webrtcDataChannel.close();
            }
        });
        this.#_webrtcDataChannelsByNodeType = new Map();
        this.#_webrtcDataChannelsByChannelID = new Map();
    }

}

export default WebRTCSocket;
export type { WebRTCSocketDatagram };
