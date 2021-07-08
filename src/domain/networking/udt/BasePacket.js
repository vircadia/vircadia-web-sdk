//
//  BasePacket.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "./UDT.js";
import MessageData from "../MessageData.js";
import SockAddr from "../SockAddr.js";
import assert from "../../shared/assert.js";


/*@devdoc
 *  The base data and information on a Vircadia protocol packet.
 *  <p>See also: {@link Packet} and {@link NLPacket}.
 *  <p>C++: <code>BasePacket: public ExtendedIODevice : public QIODevice</code>
 *  @class BasePacket
 *  @param {number|DataView|BasePacket} size|data|packet - The size of the packet to create, in bytes. If <code>-1</code>, a
 *      packet of the maximum size is created (though not all of it need be sent).
 *      <p>The raw byte data for a new packet.</p>
 *      <p>Another packet to reuse the packet data from. In this case, the packet's internal {@link MessageData} is reused by
 *      reference; it is not copied.</p>
 *  @param {unused|number|unused} unused|size|unused - Unused.
 *      <p>The size of the DataView in bytes.</p>
 *      <p>Unused.</p>
 *  @param {unused|SockAddr|unused} unused|senderSockAddr|unused - Unused.
 *      <p>The sender's IP address and port.</p>
 *      <p>Unused.</p>
 */
class BasePacket {
    // C++  BasePacket: public ExtendedIODevice : public QIODevice

    /*@devdoc
     *  Gets the maximum size of a BasePacket's Vircadia protocol payload.
     *  @function BasePacket.maxPayloadSize
     *  @returns {number} The maximum Vircadia protocol payload size, in bytes.
     */
    static maxPayloadSize() {
        // C++  int maxPayloadSize()
        return UDT.MAX_PACKET_SIZE;
    }


    #_messageData = null;  // MessageData

    constructor(param0, param1, param2) {
        if (typeof param0 === "number") {
            // C++  BasePacket(qint64 size)
            let size = param0;

            const maxPayload = BasePacket.maxPayloadSize();
            if (size === -1) {
                size = maxPayload;
            }
            assert(size >= 0 && size <= maxPayload, "Invalid packet size!");

            this.#_messageData = new MessageData();
            const buffer = new ArrayBuffer(size);
            this.#_messageData.data = new DataView(buffer);
            this.#_messageData.dataPosition = 0;
            this.#_messageData.packetSize = size;
            this.#_messageData.senderSockAddr = new SockAddr();
            this.#_messageData.receiveTime = null;

        } else if (param0 instanceof DataView) {
            // C++  BasePacket(char[]* data, qint64 size, const SockAddr& senderSockAddr)
            const data = param0;
            const size = param1;
            const senderSockAddr = param2;

            this.#_messageData = new MessageData();
            this.#_messageData.data = data;
            this.#_messageData.dataPosition = 0;
            this.#_messageData.packetSize = size;
            this.#_messageData.senderSockAddr = senderSockAddr;
            this.#_messageData.receiveTime = null;
            if (data.byteLength !== size) {
                console.error("Invalid size parameter in BasePacket constructor!");
            }

        } else if (param0 instanceof BasePacket) {
            // C++  BasePacket(BasePacket&& other)
            const other = param0;

            this.#_messageData = other.getMessageData();
            this.#_messageData.dataPosition = 0;

        } else {
            console.error("Unexpected data in BasePacket constructor!", typeof param0, param0);
        }

    }

    /*@devdoc
     *  Gets a reference to the {@link MessageData} object used to accumulate and share private packet- and message-related data
     *  among {@link BasePacket}, {@link Packet}, {@link NLPacket}, and {@link ReceivedMessage} class instances plus the packet
     *  writing and reading classes provided in {@link Packets}.
     *  <p><strong>Warning:</strong> Do not use except in these derived and friend classes.</p>
     *  @returns {MessageData} Private packet- and message-related data.
     */
    getMessageData() {
        // C++  N/A
        return this.#_messageData;
    }

    /*@devdoc
     *  Gets the size of the packet including the header.
     *  @returns {number} The size of the packet including the header, in bytes.
     */
    getDataSize() {
        // C++  qint64 getDataSize()
        return this.#_messageData.packetSize;
    }

    /*@devdoc
     *  Sets the time that the packet was received.
     *  @param {Date} time - The time that the packet was received.
     */
    setReceiveTime(time) {
        // C++  void setReceiveTime(p_high_resolution_clock::time_point receiveTime)
        this.#_messageData.receiveTime = time;
    }

    /*@devdoc
     *  Gets the time that the packet was received.
     *  @returns {Date} The time that the packet was received.
     */
    getReceiveTime() {
        // C++  time_point getReceiveTime()
        return this.#_messageData.receiveTime;
    }

}


export default BasePacket;
