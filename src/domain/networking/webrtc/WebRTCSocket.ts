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
import SockAddr from "../SockAddr";
import Signal from "../../shared/Signal";


/*@devdoc
 *  A one-to-many UDP-style socket wrapper for {@link WebRTCDataChannel}.
 *  <p>C++: <code>WebRTCSocket : public QObject</code></p>
 *  <p>The JavaScript differs from the C++ because the JavaScript client explicitly connects to different domains rather than
 *  accepting incoming connections.</p>
 *
 *  @class WebRTCSocket
 */
class WebRTCSocket {
    // C++  WebRTCSocket : public QObject
    //      WebRTCDataChannels : public QObject - incorporates some functionality from this.

    // A single WebRTC signaling channel connected to the domain server for use in establishing WebRTC connections with both the
    // domain server and each assignment client.
    #_webrtcSignalingChannel = null;
    #_webrtcSignalingChannelAddress = "";

    // A WebRTC data channel per domain server and assignment client node.
    #_webrtcDataChannelsByNodeType = new Map();     // Map(NodeType, { channelID, webrtcDataChannel })
    #_webrtcDataChannelsByChannelID = new Map();    // Map(ChannelID, { nodeType, webrtcDataChannel })

    // WebRTC data channel IDs are assigned by us and are the equivalent of UDP ports.
    #_lastDataChannelID = 0;  // First data channel ID is 1.

    #_receivedQueue = [];  // <{ channelID<number>, message<ArrayBuffer> }>

    #_readyRead = new Signal();


    constructor() {  // eslint-disable-line no-useless-constructor
        // C++  WebRTCSocket(QObject* parent, NodeType_t nodeType)

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Gets whether there are any datagrams waiting to be read.
     *  @returns {boolean} <code>true</code> if there is a datagram waiting to be read, <code>false</code> if there isn't.
     */
    hasPendingDatagrams() {
        // C++  bool hasPendingDatagrams()
        return this.#_receivedQueue.length > 0;
    }

    /*@devdoc
     *  Received datagram data and information.
     *  @typedef {object} WebRTCSocket.Datagram
     *  @property {ArrayBuffer} buffer - The datagram data.
     *  @property {SockAddr} sender - The sender that the datagram was received from.
     */
    /*@devdoc
     *  Reads the next datagram, up to a maximum number of bytes.
     *  Any remaining data in the datagram is lost.
     *  @param {WebRTCSocket.Datagram} datagram The destination object to read the datagram into.
     *  @param {number} maxSize The maximum number of bytes to read.
     *  @returns {number} The number of bytes read on success; <code>-1</code> if reading unsuccessful.
     */
    readDatagram(datagram, maxSize = null) {
        // C++  qint64 readDatagram(char* data, qint64 maxSize, QHostAddress* address = nullptr, quint16* port = nullptr);

        // WEBRTC TODO: Address further C++.

        if (this.#_receivedQueue.length > 0) {
            const data = this.#_receivedQueue.shift();
            const length = maxSize ? Math.min(data.message.byteLength, maxSize) : data.message.byteLength;

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
    writeDatagram(datagram, port) {
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
    get readyRead() {
        // C++  void readyRead()
        return this.#_readyRead;
    }


    // WEBRTC TODO: Replace this temporary method.
    hasWebRTCSignalingChannel(url) {
        // C++  WebRTC-specific method
        return url.length > 0 && this.#_webrtcSignalingChannel && this.#_webrtcSignalingChannelAddress === url;
    }

    // WEBRTC TODO: Replace this temporary method.
    openWebRTCSignalingChannel(url) {
        // C++  WebRTC-specific method
        if (url !== this.#_webrtcSignalingChannelAddress
            && this.#_webrtcSignalingChannel && this.#_webrtcSignalingChannel.readyState === WebRTCSignalingChannel.OPEN) {
            this.#_webrtcSignalingChannel.close();
            this.#_webrtcSignalingChannel = null;
        }
        this.#_webrtcSignalingChannelAddress = url;
        if (this.#_webrtcSignalingChannelAddress.length > 0) {
            this.#_webrtcSignalingChannel = new WebRTCSignalingChannel(this.#_webrtcSignalingChannelAddress);
        }
    }

    // WEBRTC TODO: Replace this temporary method.
    isWebRTCSignalingChannelOpen() {
        // C++  WebRTC-specific method
        return this.#_webrtcSignalingChannel && this.#_webrtcSignalingChannel.readyState === WebRTCSignalingChannel.OPEN;
    }

    // WEBRTC TODO: Replace this temporary method.
    closeWebRTCSignalingChannel() {
        // C++  WebRTC-specific method
        if (this.#_webrtcSignalingChannel) {
            this.#_webrtcSignalingChannel.close();
            this.#_webrtcSignalingChannel = null;
        }
    }

    // WEBRTC TODO: Replace this temporary method.
    hasWebRTCDataChannel(nodeType) {
        // C++  WebRTC-specific method
        return this.#_webrtcDataChannelsByNodeType.has(nodeType);
    }

    // WEBRTC TODO: Replace this temporary method.
    openWebRTCDataChannel(nodeType, callback) {
        // C++  WebRTC-specific method
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
            const id = webrtcDataChannel.id;
            this.#_receivedQueue.push({ message, id });
            this.#_readyRead.emit();
        };
    }

    // WEBRTC TODO: Replace this temporary method.
    isWebRTCDataChannelOpen(nodeType) {
        // C++  WebRTC-specific method
        const webrtcDataChannel = this.#_webrtcDataChannelsByNodeType.get(nodeType);
        return webrtcDataChannel ? webrtcDataChannel.webrtcDataChannel.readyState === WebRTCDataChannel.OPEN : false;
    }

    // WEBRTC TODO: Replace this temporary method.
    closeWebRTCdataChannels() {  // eslint-disable-line class-methods-use-this
        // C++  WebRTC-specific method
        console.error("Not implemented!");
    }

}

export default WebRTCSocket;
