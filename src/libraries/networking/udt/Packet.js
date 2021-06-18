//
//  Packet.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import BasePacket from "./BasePacket.js";
import UDT from "./UDT.js";
import assert from "../../shared/assert.js";


/*@devdoc
 *  A basic Vircadia protocol packet.
 *  <p>See also: {@link BasePacket} and {@link NLPacket}.
 *  <p>C++ <code>Packet : public BasePacket</code></p>
 *  @class Packet
 *  @extends BasePacket
 *  @param {number|DataView|Packet} size|data|packet - The size of the packet to create, in bytes.  If <code>-1</code>, a packet
 *      of the maximum size is created (though not all of it need be sent).
 *      <p>The raw byte data for a new packet.</p>
 *      <p>Another packet to reuse the packet data from. In this case, the packet's internal {@link MessageData} is reused by
 *      reference; it is not copied.</p>
 *  @param {boolean|number|unused} isReliable|size|unused - <code>true</code> if the packet is to be sent reliably,
 *      <code>false</code> if it isn't. <strong>Default Value:</strong> <code>false</code>
 *      <p>The size of the data in bytes.</p>
 *      <p>Unused.</p>
 *  @param {boolean|HifiSockAddr|unused} isPartOfMessage|senderSockAddr|unused - <code>true</code> if the packet is part of a
 *      message, <code>false</code> if it isn't. <strong>Default Value:</strong> <code>false</code>
 *      <p>The sender's IP address and port.</p>
 *      <p>Unused.</p>
 *
 *  @property {Packet.PacketPosition} PacketPosition - Packet position values.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {Packet.ObfuscationLevel} ObfuscationLevel - Obfuscation level values.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 */
class Packet extends BasePacket {
    // C++  Packet : public BasePacket

    /* eslint-disable no-magic-numbers */

    /*@devdoc
     *  The position of the packet in a multi-packet message. Two-bit values suitable for use in bitwise packet operations.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>ONLY</td><td>0</td><td><code>00</code> - The only packet in the message.</td></tr>
     *          <tr><td>FIRST</td><td>2</td><td><code>10</code> - The first packet in the message.</td></tr>
     *          <tr><td>Middle</td><td>3</td><td><code>11</code> - A middle packet in the message.</td></tr>
     *          <tr><td>LAST</td><td>1</td><td><code>01</code> - The last packet in the message.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} Packet.PacketPosition
     */
    static PacketPosition = {
        // C++  enum PacketPosition : MessageNumberAndBitField
        ONLY: 0x0,   // 00
        FIRST: 0x2,  // 10
        MIDDLE: 0x3, // 11
        LAST: 0x1    // 01
    };

    /*@devdoc
     *  The obfuscation level used in the packet. Two-bit values suitable for use in bitwise packet operations.
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>NoObfuscation</td><td>0</td><td><code>00</code> - No obfuscation.</td></tr>
     *          <tr><td>ObfuscationL1</td><td>1</td><td><code>01</code> - Obfuscation level 1.</td></tr>
     *          <tr><td>ObfuscationL2</td><td>2</td><td><code>10</code> - Obfuscation level 2.</td></tr>
     *          <tr><td>ObfuscationL3</td><td>3</td><td><code>11</code> - Obfuscation level 3.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} Packet.ObfuscationLevel
     */
    static ObfuscationLevel = {
        // C++  enum ObfuscationLevel : SequenceNumberAndBitField
        NoObfuscation: 0x0, // 00
        ObfuscationL1: 0x1, // 01
        ObfuscationL2: 0x2, // 10
        ObfuscationL3: 0x3  // 11
    };

    /* eslint-enable no-magic-numbers */

    /*@devdoc
     *  Creates a new Packet &mdash; an alternative to using <code>new Packet(...)</code>.
     *  <p><em>Static</em></p>
     *  @function Packet.fromReceivedPacket
     *  @param {DataView} data - The raw byte data of a new packet.
     *  @param {number} size - The size of that data in bytes.
     *  @param {HifiSockAddr} senderSockAddr - The sender's IP address and port.
     *  @returns {Packet} A Packet created from the received data.
     *  @static
     */
    static fromReceivedPacket(data, size, senderSockAddr) {
        // C++  Packet fromReceivedPacket(char[]* data, qint64 size, const HifiSockAddr& senderSockAddr);
        return new Packet(data, size, senderSockAddr);
    }

    /*@devdoc
     *  Calculates the header size of a Packet.
     *  <p><em>Static</em></p>
     *  @function Packet.totalHeaderSize
     *  @param {boolean} [isPartOfMessage=false] - <code>true</code> if the packet is part of a message, <code>false</code> if
     *      it isn't.
     *  @returns {number} The calculated total header size, in bytes.
     *  @static
     */
    static totalHeaderSize(isPartOfMessage = false) {
        // C++  int totalHeaderSize(bool isPartOfMessage = false)
        // The BasePacket header size is 0 so no need to calculate that. Thus we can just directly include the localHeaderSize()
        // calculation.
        const SEQUENCE_NUMBER_AND_BITS_BYTES = 4;
        const MESSAGE_NUMBER_AND_PART_BYTES = 8;
        return SEQUENCE_NUMBER_AND_BITS_BYTES + (isPartOfMessage ? MESSAGE_NUMBER_AND_PART_BYTES : 0);
    }


    #_messageData = null;  // MessageData

    constructor(param0, param1, param2) {
        if (typeof param0 === "number") {
            // C++  Packet(qint64 size, bool isReliable = false, bool isPartOfMessage = false)
            const size = param0;
            const isReliable = param1 ? param1 : false;
            const isPartOfMessage = param2 ? param2 : false;

            super((size === -1) ? -1 : (Packet.totalHeaderSize(isPartOfMessage) + size));
            this.#_messageData = super.getMessageData();  // Get own reference to shared collection of private fields.
            this.#_messageData.isReliable = isReliable;
            this.#_messageData.isPartOfMessage = isPartOfMessage;
            // adjustPayloadStartAndCapacity();  N/A
            this.#writeHeader();

        } else if (param0 instanceof DataView) {
            // C++  Packet(std::unique_ptr<char[]> data, qint64 size, const HifiSockAddr& senderSockAddr)
            const data = param0;
            const size = param1;
            const senderSockAddr = param2;

            super(data, size, senderSockAddr);
            this.#_messageData = super.getMessageData();  // Get own reference to shared collection of private fields.
            this.#readHeader();
            // adjustPayloadStartAndCapacity();  N/A
            if (this.#_messageData.obfuscationLevel !== Packet.ObfuscationLevel.NoObfuscation) {
                console.error("ERROR: Undoing obfuscation not implemented!");

                // WEBRTC TODO: Address further C++ code.

            }

        } else if (param0 instanceof Packet) {
            // C++  Packet(Packet&& other)
            const packet = param0;

            super(packet);
            this.#copyMembers(packet);
            this.#_messageData.dataPosition = Packet.totalHeaderSize(this.#_messageData.isPartOfMessage);

        } else {
            super();
            console.error("Unexpected data in Packet constructor!", typeof param0);
        }
    }


    // Copies the MessageData from another Packet.
    #copyMembers(other, shallow = true) {
        // C++  copyMembers(const Packet& other)
        if (shallow) {
            this.#_messageData = other.getMessageData();
        } else {
            console.error("Not implemented!");
        }
    }

    // Reads the packet header information from the data.
    #readHeader() {
        // C++  void readHeader()
        const messageData = this.#_messageData;
        const seqNumBitField = messageData.data.getUint32(messageData.dataPosition, UDT.LITTLE_ENDIAN);
        assert((seqNumBitField & UDT.CONTROL_BIT_MASK) === 0, "Packet.readHeader()", "This should be a data packet");
        messageData.isReliable = (seqNumBitField & UDT.RELIABILITY_BIT_MASK) > 0;
        messageData.isPartOfMessage = (seqNumBitField & UDT.MESSAGE_BIT_MASK) > 0;
        messageData.obfuscationLevel
            = (seqNumBitField & UDT.OBFUSCATION_LEVEL_BIT_MASK) >> UDT.OBFUSCATION_LEVEL_OFFSET;
        messageData.sequenceNumber = (seqNumBitField & UDT.SEQUENCE_NUMBER_BIT_MASK);
        messageData.dataPosition += 4;

        if (messageData.isPartOfMessage) {
            console.error("ERROR: Multi-packet messages not yet implemented!");

            // WEBRTC TODO: Address further C++ code.

            messageData.dataPosition += 8;
        } else {
            messageData.messageNumber = 0;
            messageData.packetPosition = Packet.PacketPosition.ONLY;
            messageData.messagePartNumber = 0;
        }
    }

    // Writes the packet header information to the data.
    #writeHeader() {
        // C++  void writeHeader()
        const messageData = this.#_messageData;

        let seqNumBitField = messageData.sequenceNumber;
        if (messageData.isReliable) {
            seqNumBitField |= UDT.RELIABILITY_BIT_MASK;
        }
        if (messageData.isPartOfMessage) {
            seqNumBitField |= UDT.MESSAGE_BIT_MASK;
        }
        if (messageData.obfuscationLevel !== Packet.NoObfuscation) {
            seqNumBitField |= (messageData.obfuscationLevel << UDT.OBFUSCATION_LEVEL_OFFSET);
        }
        messageData.data.setUint32(messageData.dataPosition, seqNumBitField, UDT.LITTLE_ENDIAN);
        messageData.dataPosition += 4;

        if (messageData.isPartOfMessage) {
            let messageNumberAndBitField = messageData.messageNumber;
            messageNumberAndBitField |= messageData.packetPosition << UDT.PACKET_POSITION_OFFSET;
            messageData.data.setUint32(messageData.dataPosition, messageNumberAndBitField, UDT.LITTLE_ENDIAN);
            messageData.dataPosition += 4;

            messageData.data.setUint32(messageData.dataPosition, messageData.messagePartNumber, UDT.LITTLE_ENDIAN);
            messageData.dataPosition += 4;
        }
    }

}

export default Packet;
