//
//  PacketList.ts
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "./NLPacket";
import Packet from "./udt/Packet";
import { PacketTypeValue } from "./udt/PacketHeaders";
import UDT from "./udt/UDT";
import assert from "../shared/assert";
import Uuid from "../shared/Uuid";


/*@devdoc
 *  The <code>NLPacketList</code> class implements a "node list" Vircadia protocol multi-packet message which may be sent
 *  reliably and in packet order. A "current packet" is written to until it is full, upon which it is added to the list and
 *  writing of another started.
 *  <p>C++ <code>NLPacketList : public PacketList : public ExtendedIODevice : public QIODevice</code></p>
 *
 *  @class NLPacketList
 *  @param {PacketType} packetType - The type of packet list to create.
 *  @param {ArrayBuffer | null} [extendedHeader=null] - An optional extended header to include as part of each packet in the
 *      list.
 *  @param {boolean} [isReliable=false] - <code>true</code> if the packet list is to be sent reliably, <code>false</code> if
 *      it isn't.
 *  @param {boolean} [isOrdered=false] - <code>true</code> if the packet list is to be sent in order, <code>false</code> if
 *      it isn't.
 */
class NLPacketList {
    // C++  class NLPacketList : public PacketList : public ExtendedIODevice : public QIODevice

    /*@devdoc
     *  Creates a new NLPacketList &mdash; an alternative to using <code>new NLPacketList(...)</code>.
     *  <p><em>Static</em></p>
     *  @function NLPacketList.create
     *  @static
     *  @param {PacketType} packetType - The type of packet list to create.
     *  @param {ArrayBuffer | null} [extendedHeader=null] - An extended header to included as part of the packet.
     *  @param {boolean} [isReliable=false] - <code>true</code> if the packet list is to be sent reliably, <code>false</code> if
     *      it isn't.
     *  @param {boolean} [isOrdered=false] - <code>true</code> if the packet list is to be sent in order, <code>false</code> if
     *      it isn't.
     *  @returns {NLPacketList} A new NLPacketList.
     */
    static create(packetType: PacketTypeValue, extendedHeader: ArrayBuffer | null = null, isReliable = false,
        isOrdered = false): NLPacketList {
        // C++  static NLPacketList* create(PacketType packetType, QByteArray extendedHeader = QByteArray(),
        //          bool isReliable = false, bool isOrdered = false);
        return new NLPacketList(packetType, extendedHeader, isReliable, isOrdered);
    }

    static readonly #PACKET_LIST_WRITE_ERROR = -1;


    #_packetType;
    #_extendedHeader;
    #_isOrdered;
    #_isReliable;

    #_currentPacket: NLPacket | null = null;
    #_packets: Array<NLPacket> = [];

    #_segmentStartIndex = -1;

    // Helpers for writing primitive values.
    readonly #UINT32_LENGTH = 4;
    #_uint32Buffer = new ArrayBuffer(this.#UINT32_LENGTH);
    #_uint32Array = new Uint8Array(this.#_uint32Buffer);
    #_uint32Data = new DataView(this.#_uint32Buffer);

    readonly #BOOLEAN_LENGTH = 1;
    #_booleanBuffer = new ArrayBuffer(this.#BOOLEAN_LENGTH);
    #_booleanArray = new Uint8Array(this.#_booleanBuffer);
    #_booleanData = new DataView(this.#_booleanBuffer);

    readonly #UUID_LENGTH = 16;
    #_uuidBuffer = new ArrayBuffer(this.#UUID_LENGTH);
    #_uuidArray = new Uint8Array(this.#_uuidBuffer);
    #_uuidData = new DataView(this.#_uuidBuffer);


    constructor(packetType: PacketTypeValue, extendedHeader: ArrayBuffer | null, isReliable: boolean, isOrdered: boolean) {
        // C++  PacketList(PacketType packetType, QByteArray extendedHeader = QByteArray(), bool isReliable = false,
        //          bool isOrdered = false)
        this.#_packetType = packetType;
        this.#_extendedHeader = extendedHeader;
        this.#_isReliable = isReliable;
        this.#_isOrdered = isOrdered;

        assert(!(!isReliable && isOrdered), "PacketList: Unreliable ordered PacketLists are not supported.");

        if (this.#_extendedHeader !== null) {
            console.error("PacketList extended header not implemented.");
        }
    }

    /*@devdoc
     *  Writes data to the current packet.
     *  @param {Uint8Array} data - The data to be written.
     */
    write(data: Uint8Array): number {
        //  C++ qint64 QIODevice::write(const QByteArray &data)
        //      Return value isn't used.
        return this.#writeData(data, data.byteLength);
    }

    /*@devdoc
     *  Writes a "primitive" value to the current packet.
     *  @param {number|boolean|Uuid} value - The value to write.
     *  @param {number|undefined|undefined} bytes=4 - The number of bytes to write the number value into.
     *  @param {boolean|undefined|undefined} littleEndian=true - Whether to write the number in little- or big-endian format.
     *  @returns {number} The number of bytes written.
     */
    writePrimitive(value: number | boolean | Uuid, bytes?: number, littleEndian?: boolean): number {
        // C++  qint64 ExtendedIODevice::writePrimitive(const T& data)
        const DEFAULT_NUM_BYTES = 4;
        const isLittleEndian = littleEndian === undefined || littleEndian;
        switch (typeof value) {
            case "number":
                if (value > 0) {
                    this.#_uint32Data.setUint32(0, value, isLittleEndian);
                } else {
                    this.#_uint32Data.setInt32(0, value, isLittleEndian);
                }
                if (!bytes || bytes === DEFAULT_NUM_BYTES) {
                    return this.#writeData(this.#_uint32Array, this.#UINT32_LENGTH);
                }
                if (isLittleEndian) {
                    return this.#writeData(this.#_uint32Array.slice(0, bytes), bytes);
                }
                return this.#writeData(this.#_uint32Array.slice(-bytes), bytes);
            case "boolean":
                this.#_booleanData.setUint8(0, value ? 1 : 0);
                return this.#writeData(this.#_booleanArray, this.#BOOLEAN_LENGTH);
            case "object":
                if (value instanceof Uuid) {
                    this.#_uuidData.setBigUint128(0, value.value(), UDT.BIG_ENDIAN);
                    return this.#writeData(this.#_uuidArray, this.#UUID_LENGTH);
                }
                console.error("NLPacketList.writePrimitive() - Unhandled type:", typeof value);
                return 0;
            default:
                console.error("NLPacketList.writePrimitive() - Unhandled type:", typeof value);
                return 0;
        }
    }

    /*@devdoc
     *  Writes a string to the current packet.
     *  @param {string|null} string - The string to write.
     *  @param {boolean} [littleEndian=true] - Whether to write the number of bytes in the string in little- or big-endian
     *      format.
     *  @returns {number} The number of bytes written.
     */
    writeString(string: string | null, littleEndian?: boolean): number {
        // C++  qint64 PacketList::writeString(const QString& string)
        const UINT32_BYTES = 4;
        if (string === null) {
            this.writePrimitive(-1, UINT32_BYTES);  // ffffffff
            return UINT32_BYTES;
        }
        this.writePrimitive(2 * string.length, UINT32_BYTES, littleEndian === undefined || littleEndian);
        for (let i = 0; i < string.length; i++) {
            this.writePrimitive(string.charCodeAt(i), 2, UDT.BIG_ENDIAN);
        }
        return UINT32_BYTES + 2 * string.length;
    }

    /*@devdoc
     *  Closes writing to the current packet and adds it to the list.
     *  @param {boolean} shouldSendEmpty - <code>true</code> if an empty packet should be sent, <code>false</code> if one
     *      shouldn't.
     */
    closeCurrentPacket(shouldSendEmpty = false): void {
        // C++  void PacketList::closeCurrentPacket(bool shouldSendEmpty = false)
        if (shouldSendEmpty && !this.#_currentPacket && this.#_packets.length === 0) {
            this.#_currentPacket = this.#createPacketWithExtendedHeader();
        }

        if (this.#_currentPacket) {
            this.#_packets.push(this.#_currentPacket);
            this.#_currentPacket = null;
        }
    }

    /*@devdoc
     *  Prepares the packets in the list so that they are ready to be sent.
     *  @param {number} messageNumber - The number of the message that the packets in the list together form.
     */
    preparePackets(messageNumber: number): void {
        // C++  void PacketList::preparePackets(MessageNumber messageNumber)
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        assert(this.#_packets.length > 0);
        if (this.#_packets.length === 1) {
            this.#_packets[0]!.writeMessageNumber(messageNumber, Packet.PacketPosition.ONLY, 0);
        } else {
            let index = 0;
            this.#_packets[0]!.writeMessageNumber(messageNumber, Packet.PacketPosition.FIRST, index);
            index += 1;
            while (index < this.#_packets.length - 1) {
                this.#_packets[index]!.writeMessageNumber(messageNumber, Packet.PacketPosition.MIDDLE, index);
                index += 1;
            }
            this.#_packets[index]!.writeMessageNumber(messageNumber, Packet.PacketPosition.LAST, index);
        }
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

    /*@devdoc
     *  Gets all the packets in the list.
     *  @returns {NLPacket[]} All the packets in the list.
     */
    getPackets(): Array<NLPacket> {
        // C++  N/A - This method is provided in place of friend classes directly accessing this.#_packets.
        return this.#_packets;
    }

    /*@devdoc
     *  Clears the packet list to empty.
     */
    resetPackets(): void {
        // C++  N/A - This method is provided in place of friend classes directly accessing this.#_packets.
        this.#_packets = [];
    }

    /*@devdoc
     *  Gets the number of packets currently in the list.
     *  @returns {number} The number of packets currently in the list.
     */
    getNumPackets(): number {
        // C++  size_t getNumPackets()
        return this.#_packets.length + (this.#_currentPacket ? 1 : 0);
    }


    /*@devdoc
     *  Gets the total number of bytes in the packets in the list.
     *  @returns {number} The total number of bytes in the packets in the list.
     */
    getDataSize(): number {
        // C++  size_t getDataSize()
        let totalBytes = 0;
        for (const packet of this.#_packets) {
            totalBytes += packet.getDataSize();
        }
        if (this.#_currentPacket) {
            totalBytes += this.#_currentPacket.getDataSize();
        }
        return totalBytes;
    }

    /*@devdoc
     *  Gets the type of packets in the list.
     *  @returns {PacketTypeValue} The type of packets in the list.
     */
    getType(): PacketTypeValue {
        // C++  PacketType getType()
        return this.#_packetType;
    }

    /*@devdoc
     *  Gets whether the packet list is reliable.
     *  @returns {boolean} <code>true</code> if the packet list is reliable, <code>false</code> if it isn't.
     */
    isReliable(): boolean {
        // C++  boolean isReliable()
        return this.#_isReliable;
    }

    /*@devdoc
     *  Gets whether the packet list is ordered.
     *  @returns {boolean} <code>true</code> if the packet list is ordered, <code>false</code> if it isn't.
     */
    isOrdered(): boolean {
        // C++  boolean isOrdered()
        return this.#_isOrdered;
    }

    /*@devdoc
     *  Takes and removes the next packet from the front of the list.
     *  @returns {NLPacket} The next packet from the list.
     */
    takeFront(): NLPacket {
        // C++  NLPacket takeFront()
        assert(this.#_packets.length > 0, "Packet list unexpectedly empty!");
        return this.#_packets.shift() as NLPacket;
    }


    #createPacket(): NLPacket {
        // C++  Packet* PacketList::createPacket()
        // If this packet list is supposed to be ordered then we consider this to be part of a message.
        const isPartOfMessage = this.#_isOrdered;
        return new NLPacket(this.getType(), -1, this.#_isReliable, isPartOfMessage);
    }

    #createPacketWithExtendedHeader(): NLPacket {
        // C++  NLPacket* createPacketWithExtendedHeader()
        // use the static create method to create a new packet
        const packet = this.#createPacket();

        const messageData = packet.getMessageData();

        // Fill in packet type so that the packet can be used as an NLPacket in LimitedNodeList.sendPacketList().
        messageData.type = this.#_packetType;

        if (this.#_extendedHeader && this.#_extendedHeader.byteLength > 0) {
            // Add the extended header to the front of the packet.
            if (this.#_extendedHeader.byteLength < packet.getDataSize() - messageData.dataPosition) {
                messageData.buffer.set(new Uint8Array(this.#_extendedHeader), messageData.dataPosition);
                messageData.dataPosition += this.#_extendedHeader.byteLength;
            } else {
                console.log("[networking] Could not write extendedHeader in NLPacketList.createPacketWithExtendedHeader",
                    "- make sure the extendedHeader is not larger than the payload capacity.");
            }
        }

        return packet;
    }

    // Writes data to the current packet.
    #writeData(data: Uint8Array, maxSize: number): number {
        // C++  qint64 PacketList::writeData(const char* data, qint64 maxSize)
        let dataOffset = 0;
        let sizeRemaining = maxSize;

        while (sizeRemaining > 0) {
            if (!this.#_currentPacket) {
                // We don't have a current packet - time to set one up.
                this.#_currentPacket = this.#createPacketWithExtendedHeader();
            }

            // Check if this block of data can fit into the currentPacket.
            if (sizeRemaining <= this.#_currentPacket.bytesAvailableForWrite()) {
                // It fits - just write it to the current packet.
                const messageData = this.#_currentPacket.getMessageData();
                messageData.buffer.set(data.slice(dataOffset, dataOffset + sizeRemaining), messageData.dataPosition);
                messageData.dataPosition += sizeRemaining;
                messageData.packetSize = messageData.dataPosition;
                sizeRemaining = 0;

            } else {
                // It does not fit - this may need to be in the next packet.

                // eslint-disable-next-line no-lonely-if
                if (!this.#_isOrdered) {
                    const newPacket = this.#createPacketWithExtendedHeader();
                    const newMessageData = newPacket.getMessageData();

                    if (this.#_segmentStartIndex >= 0) {
                        // We're in the process of writing a segment for an unordered PacketList.
                        // We need to try and pull the first part of the segment out to our new packet.
                        const messageData = this.#_currentPacket.getMessageData();

                        // Check now to see if this is an unsupported write.
                        const segmentSize = messageData.dataPosition - this.#_segmentStartIndex;

                        if (segmentSize + sizeRemaining > messageData.buffer.byteLength - messageData.dataPosition) {
                            // This is an unsupported case - the segment is bigger than the size of an individual packet
                            // but the PacketList is not going to be sent ordered.
                            console.error("[networking] Error in PacketList.writeData()",
                                "Attempted to write a segment to an unordered packet that is larger than the payload size.");

                            // We won't be writing this new data to the packet.
                            // Go back before the current segment and return -1 to indicate error.
                            messageData.dataPosition = this.#_segmentStartIndex;
                            messageData.packetSize = messageData.dataPosition;

                            return NLPacketList.#PACKET_LIST_WRITE_ERROR;
                        }

                        // Copy from currentPacket where the segment started to the beginning of the newPacket.
                        newMessageData.buffer.set(messageData.buffer.slice(this.#_segmentStartIndex,
                            this.#_segmentStartIndex + segmentSize), newMessageData.dataPosition);
                        newMessageData.dataPosition += segmentSize;
                        newMessageData.packetSize = newMessageData.dataPosition;

                        // The current segment now starts at the beginning of the new packet.
                        this.#_segmentStartIndex = this.#_extendedHeader ? this.#_extendedHeader.byteLength : 0;
                    }

                    if (sizeRemaining > newMessageData.buffer.byteLength - newMessageData.dataPosition) {
                        // This is an unsupported case - attempting to write a block of data larger than the capacity of a new
                        // packet in an unordered PacketList.
                        console.error("[networking] Error in PacketList.writeData()",
                            "Attempted to write data to an unordered packet that is larger than the payload size.");

                        return NLPacketList.#PACKET_LIST_WRITE_ERROR;
                    }

                    // Move the current packet to our list of packets.
                    this.#_packets.push(this.#_currentPacket);

                    // Write the data to the newPacket.
                    newMessageData.buffer.set(data, newMessageData.dataPosition);
                    newMessageData.dataPosition += data.byteLength;
                    newMessageData.packetSize = newMessageData.dataPosition;

                    // Set our current packet to the new packet.
                    this.#_currentPacket = newPacket;

                    // We've written all of the data, so set sizeRemaining to 0.
                    sizeRemaining = 0;

                } else {
                    // We're an ordered PacketList - let's fit what we can into the current packet and then put the leftover
                    // into a new packet.
                    const numBytesToEnd = this.#_currentPacket.bytesAvailableForWrite();
                    const currentMessageData = this.#_currentPacket.getMessageData();
                    currentMessageData.buffer.set(data.slice(dataOffset, dataOffset + numBytesToEnd),
                        currentMessageData.dataPosition);
                    currentMessageData.dataPosition += numBytesToEnd;
                    currentMessageData.packetSize = currentMessageData.dataPosition;

                    // Remove number of bytes written from sizeRemaining.
                    sizeRemaining -= numBytesToEnd;

                    // Move the data pointer forward.
                    dataOffset += numBytesToEnd;

                    // Move the current packet to our list of packets.
                    this.#_packets.push(this.#_currentPacket);
                    this.#_currentPacket = null;
                }
            }
        }

        return maxSize;
    }

}

export default NLPacketList;
