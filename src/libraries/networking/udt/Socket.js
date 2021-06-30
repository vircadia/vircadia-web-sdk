//
//  Socket.js
//
//  Created by David Rowe on 28 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import WebRTCSocket from "../webrtc/WebRTCSocket.js";
import Packet from "../udt/Packet.js";
import assert from "../../shared/assert.js";


/*@devdoc
 *  A one-to-many socket used to communicate with a domain's domain server and assignment clients.
 *  <p>C++: <code>Socket : public QObject</code></p>
 *  @class Socket
 */
class Socket {
    // C++  Socket : public QObject

    #_webrtcSocket = null;  // Use WebRTCSocket directly without going through an intermediary NetworkSocket.

    // WEBRTC TODO: Address further C++ code.

    #_packetHandler = null;


    constructor() {
        // C++  Socket(QObject* object = 0, bool shouldChangeSocketOptions = true, NodeType_t nodeType = NodeType::Unassigned)

        this.#_webrtcSocket = new WebRTCSocket();

        // Set up slots.
        this.readPendingDatagrams = this.readPendingDatagrams.bind(this);

        // Connect signals.
        this.#_webrtcSocket.readyRead.connect(this.readPendingDatagrams);

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Sends a packet to a destination.
     *  @param {Packet} packet - The packet to send.
     *  @param {HifiSockAddr} sockAddr - The destination to send the packet to.
     *  @returns {number} The number of bytes if successfully sent, otherwise <code>-1</code>.
     */
    writePacket(packet, sockAddr) {
        // C++  qint64 writePacket(const Packet& packet, const HifiSockAddr& sockAddr)
        assert(!packet.isReliable());

        // WEBRTC TODO: Address further C++ code.

        return this.writeDatagram(packet, packet.getDataSize(), sockAddr);
    }

    /*@devdoc
     *  Sends a datagram to a destination.
     *  @param {ArrayBuffer} data - The datagram to send.
     *  @param {number} size - The maximum number of bytes to send.
     *  @param {HifiSockAddr} sockAddr - The destination to send the datagram to.
     *  @returns {number} The number of bytes if successfully sent, otherwise <code>-1</code>.
     */
    writeDatagram(data, size, sockAddr) {
        // C++  qint64 writeDatagram(const char* data, qint64 size, const HifiSockAddr& sockAddr);

        let datagram = data.getMessageData().data.buffer;
        if (datagram.byteLength > size) {
            datagram = datagram.slice(0, size);
        }

        // C++  qint64 writeDatagram(const QByteArray& datagram, const HifiSockAddr& sockAddr);
        // In-line this method because it's only called by the parent.

        // WEBRTC TODO: Address further C++ code.

        const bytesWritten = this.#_webrtcSocket.writeDatagram(datagram, sockAddr.getPort());

        // WEBRTC TODO: Address further C++ code.

        return bytesWritten;
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
    setPacketHandler(handler) {
        // C++  void setPacketHandler(PacketHandler handler)
        this.#_packetHandler = (packet) => {
            handler(packet);
        };
    }

    /*@devdoc
     *  Reads datagrams from the {@link WebRTCSocket} and forwards them to the packet handler to process.
     *  @returns {Slot}
     */
    readPendingDatagrams() {
        // C++  void readPendingDatagrams();

        // WEBRTC TODO: Address further C++ code.

        while (this.#_webrtcSocket.hasPendingDatagrams()) {  // WEBRTC TODO: Further C++ code in condition.

            // WEBRRTC TODO: Address further C++ code.

            const datagram = { buffer: null, sender: null };
            const sizeRead = this.#_webrtcSocket.readDatagram(datagram);
            if (sizeRead <= 0) {
                continue;
            }

            const dataView = new DataView(datagram.buffer);

            // WEBRTC TODO: Address further C++ code.

            const receiveTime = Date.now();

            const CONTROL_BIT_MASK = 0x80;
            const isControlPacket = dataView.getUint8(0) & CONTROL_BIT_MASK;
            if (isControlPacket) {

                // WEBRTC TODO: Address further C++ code.

                console.error("Control packets not yet implemented!");

            } else {

                const packet = Packet.fromReceivedPacket(dataView, dataView.byteLength, datagram.sender);
                const messageData = packet.getMessageData();
                messageData.receiveTime = receiveTime;

                // WEBRTC TODO: Address further C++ code.

                if (messageData.isPartOfMessage) {

                    // WEBRTC  TODO: Address further C++ code.

                    console.error("Multi-packet messages not yet implemented!");

                } else if (this.#_packetHandler) {
                    this.#_packetHandler(packet);
                }

            }
        }
    }


    // WEBRTC TODO: Replace this temporary method.
    hasWebRTCSignalingChannel(url) {
        return this.#_webrtcSocket.hasWebRTCSignalingChannel(url);
    }

    // WEBRTC TODO: Replace this temporary method.
    openWebRTCSignalingChannel(url) {
        this.#_webrtcSocket.openWebRTCSignalingChannel(url);
    }

    // WEBRTC TODO: Replace this temporary method.
    isWebRTCSignalingChannelOpen() {
        return this.#_webrtcSocket.isWebRTCSignalingChannelOpen();
    }

    // WEBRTC TODO: Replace this temporary method.
    closeWebRTCSignalingChannel() {
        this.#_webrtcSocket.closeWebRTCSignalingChannel();
    }


    // WEBRTC TODO: Replace this temporary method.
    hasWebRTCDataChannel(nodeType) {
        return this.#_webrtcSocket.hasWebRTCDataChannel(nodeType);
    }

    // WEBRTC TODO: Replace this temporary method.
    openWebRTCDataChannel(nodeType, callback) {
        this.#_webrtcSocket.openWebRTCDataChannel(nodeType, callback);
    }

    // WEBRTC TODO: Replace this temporary method.
    isWebRTCDataChannelOpen(nodeType) {
        return this.#_webrtcSocket.isWebRTCDataChannelOpen(nodeType);
    }

    // WEBRTC TODO: Replace this temporary method.
    closeWebRTCDataChannels(nodeType) {
        this.#_webrtcSocket.closeWebRTCDataChannels();
    }

}

export default Socket;
