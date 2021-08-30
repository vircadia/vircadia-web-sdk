//
//  BasePacket.ts
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "./UDT";
import MessageData from "../MessageData";
import SockAddr from "../SockAddr";
import assert from "../../shared/assert";


/*@devdoc
 *  The <code>BasePacket</code> class implements the base data and information on a Vircadia protocol packet.
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
    static maxPayloadSize(): number {
        // C++  int maxPayloadSize()
        return UDT.MAX_PACKET_SIZE;
    }

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    static #NUM_BYTES_HEADER = 4;  // Control bits and sequence number.

    protected _messageData: MessageData;


    constructor(param0: number | DataView | BasePacket,
        param1: undefined | number | undefined = undefined,
        param2: undefined | SockAddr | undefined = undefined) {

        if (typeof param0 === "number") {
            // C++  BasePacket(qint64 size)
            let size = param0;

            const maxPayload = BasePacket.maxPayloadSize();
            if (size === -1) {
                size = maxPayload;
            }
            assert(size >= 0 && size <= maxPayload, "Invalid packet size!", size);

            this._messageData = new MessageData();
            this._messageData.buffer = new Uint8Array(size);
            this._messageData.dataPosition = 0;
            this._messageData.packetSize = size;

        } else if (param0 instanceof DataView && typeof param1 === "number" && param2 instanceof SockAddr) {
            // C++  BasePacket(char[]* data, qint64 size, const SockAddr& senderSockAddr)
            const data = param0;
            const size = param1;
            const senderSockAddr = param2;

            this._messageData = new MessageData();
            this._messageData.buffer = new Uint8Array(data.buffer);
            this._messageData.dataPosition = 0;
            this._messageData.packetSize = size;
            this._messageData.senderSockAddr = senderSockAddr;
            if (data.byteLength !== size) {
                console.error("Invalid size parameter in BasePacket constructor!", size);
            }

        } else if (param0 instanceof BasePacket) {
            // C++  BasePacket(BasePacket&& other)
            const other = param0;

            this._messageData = new MessageData(other.getMessageData());
            this._messageData.dataPosition = 0;

        } else {
            // Invalid call.
            this._messageData = new MessageData();
            console.error("Invalid parameters in BasePacket constructor!", typeof param0, typeof param1, typeof param2);
        }

    }


    /*@devdoc
     *  Gets a reference to the {@link MessageData} object used to accumulate and share private packet- and message-related data
     *  between the {@link BasePacket}, {@link Packet}, and {@link NLPacket} classes and the "friend" {@link ReceivedMessage}
     *  class plus the packet writing and reading classes provided in {@link Packets}.
     *  <p><strong>Warning:</strong> Do not use except in these friend classes.</p>
     *  @returns {MessageData} Private packet- and message-related data.
     */
    getMessageData(): MessageData {
        // C++  N/A
        return this._messageData;
    }

    /*@devdoc
     *  Gets the size of the packet including the header.
     *  @returns {number} The size of the packet including the header, in bytes.
     */
    getDataSize(): number {
        // C++  qint64 getDataSize()
        return this._messageData.packetSize;
    }

    /*@devdoc
     *  Sets the time that the packet was received.
     *  @param {number} time - The time stamp at which the packet was received.
     */
    setReceiveTime(time: number): void {
        // C++  void setReceiveTime(p_high_resolution_clock::time_point receiveTime)
        this._messageData.receiveTime = time;
    }

    /*@devdoc
     *  Gets the time that the packet was received.
     *  @returns {number} The time stamp at which the packet was received.
     */
    getReceiveTime(): number {
        // C++  time_point getReceiveTime()
        return this._messageData.receiveTime;
    }


    protected adjustPayloadStartAndCapacity(headerSize: number): void {
        // C++ void adjustPayloadStartAndCapacity(qint64 headerSize, bool shouldDecreasePayloadSize = false)

        // We don't use C++'s _payloadStart or _payloadCapacity members. Instead, we just need to reserve space for the header,
        // taking into account the base packet's header.
        this._messageData.dataPosition = BasePacket.#NUM_BYTES_HEADER + headerSize;
    }
}

export default BasePacket;
