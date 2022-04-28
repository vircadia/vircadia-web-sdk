//
//  NLPacket.ts
//
//  Created by David Rowe on 8 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HMACAuth from "./HMACAuth";
import Packet from "./udt/Packet";
import PacketType, { PacketTypeValue } from "./udt/PacketHeaders";
import UDT from "./udt/UDT";
import { LocalID } from "../networking/NetworkPeer";
import Node from "../networking/Node";
import assert from "../shared/assert";


/*@devdoc
 *  The <code>NLPacket</code> class implements a "node list" Vircadia protocol packet. Contains payload data, unlike a basic
 *  {@link Packet}.
 *  <p>See also: {@link BasePacket}, {@link Packet}, and {@link ControlPacket}.
 *  <p>C++ <code>NLPacket : public Packet</code></p>
 *  @class NLPacket
 *  @extends Packet
 *  @param {PacketType|Packet} type|packet - The type of NLPacket to create.
 *      <p>A base Packet to create the NLPacket from.</p>
 *      <p>Note: The {@link MessageData} from the base packet is reused in-place, not copied.</p>
 *  @param {number|unused} size - The size of the packet in bytes. If <code>-1</code>, a packet of the maximum size is created
 *      (though not all of it need be sent). <strong>Default Value:</strong> <code>-1</code>
 *      <p>Unused.</p>
 *  @param {boolean|unused} isReliable - <code>true</code> if the packet is to be sent reliably, <code>false</code> if it isn't.
 *      <strong>Default Value:</strong> <code>false</code
 *      <p>Unused.</p>
 *  @param {boolean|unused} isPartOfMessage - <code>true</code> if the packet is part of a message, <code>false</code> if it
 *      isn't. <strong>Default Value:</strong> <code>false</code>
 *      <p>Unused.</p>
 *  @param {PacketVersion|unused} version - The version of the NLPacket to create. <strong>Default Value:</strong>
 *      <code>0</code>
 *      <p>Unused.</p>
 */
class NLPacket extends Packet {
    // C++  NLPacket : public Packet

    /*@devdoc
     *  Creates a new NLPacket &mdash; an alternative to using <code>new NLPacket(...)</code>.
     *  <p><em>Static</em></p>
     *  @static
     *  @param {PacketType} type - The type of packet to create.
     *  @param {number} [size=-1] - The size of the packet to create, in bytes. If <code>-1</code> the packet isn't created at a
     *      fixed size.
     *  @param {boolean} [isReliable=false] - <code>true</code> if the packet is to be sent reliably, <code>false</code> if it
     *      isn't.
     *  @param {boolean} [isPartOfMessage=false] - <code>true</code> if the packet is part of a multi-packet message,
     *      <code>false</code> if it isn't.
     *  @param {PacketVersion} [version=0] - The version of the packet type.
     *  @returns {NLPacket} A new NLPacket.
     */
    static create(type: PacketTypeValue, size = -1, isReliable = false, isPartOfMessage = false, version = 0): NLPacket {
        // C++  NLPacket* create(PacketType type, qint64 size = -1, bool isReliable = false, bool isPartOfMessage = false,
        //                       PacketVersion version = 0);
        return new NLPacket(type, size, isReliable, isPartOfMessage, version);
    }

    /*@devdoc
     *  Creates a new NLPacket from a base {@link Packet}.
     *  <p>Note: The {@link MessageData} from the original packet is reused in-place, not copied.</p>
     *  <p><em>Static</em></p>
     *  @static
     *  @param {Packet} packet - The base packet to create the NLPacket from.
     */
    static fromBase(packet: Packet): NLPacket {
        // C++  NLPacket* fromBase(Packet* packet)
        return new NLPacket(packet);
    }

    /*@devdoc
     *  Gets the packet type direct from a packet's data.
     *  @returns {PacketTypeValue} The packet type.
     */
    static typeInHeader(packet: Packet): PacketTypeValue {
        // C++  PacketType typeInHeader(const Packet& packet)
        const headerOffset = Packet.totalHeaderSize(packet.isPartOfMessage());
        return packet.getMessageData().data.getUint8(headerOffset);
    }

    /*@devdoc
     *  Gets the packet type version direct from a packet's data.
     *  @returns {number} The packet type version.
     */
    static versionInHeader(packet: Packet): number {
        // C++  PacketVersion versionInHeader(const udt::Packet& packet)
        const headerOffset = Packet.totalHeaderSize(packet.isPartOfMessage());
        return packet.getMessageData().data.getUint8(headerOffset + 1);  // Skip the packet type.
    }

    /*@devdoc
     *  Gets the packet source ID direct from a packet's data.
     *  @returns {number} The packet source ID.
     */
    static sourceIDInHeader(packet: Packet): number {
        // C++ LocalID sourceIDInHeader(const udt::Packet& packet)
        const headerOffset = Packet.totalHeaderSize(packet.isPartOfMessage());
        return packet.getMessageData().data.getUint16(headerOffset + 2, UDT.LITTLE_ENDIAN);  // Skip the packet type & version.
    }

    /*@devdoc
     *  Calculates the header size of an NLPacket.
     *  <p><em>Static</em></p>
     *  @function NLPacket.totalNLHeaderSize
     *  @param {PacketType} type - The type of packet.
     *  @param {boolean} isPartOfMessage=false - <code>true</code> if the packet is part of a message, <code>false</code> if
     *      it isn't.
     *  @returns {number} The total header size, in bytes.
     *  @static
     */
    static totalNLHeaderSize(type: PacketTypeValue, isPartOfMessage: boolean): number {
        // C++  int totalHeaderSize(PacketType type, bool isPartOfMessage)
        // Cannot use the same name as the Packet member, in TypeScript, because the function signatures are different.
        return Packet.totalHeaderSize(isPartOfMessage) + NLPacket.#localHeaderSize(type);
    }


    static readonly #NUM_BYTES_PACKET_TYPE = 1;
    static readonly #NUM_BYTES_PACKET_VERSION = 1;
    static readonly #NUM_BYTES_LOCALID = 2;
    static readonly #NUM_BYTES_MD5_HASH = 16;

    static #localHeaderSize(type: PacketTypeValue): number {
        // C++  int localHeaderSize(PacketType type)
        const nonSourced = PacketType.getNonSourcedPackets().has(type);
        const nonVerified = PacketType.getNonVerifiedPackets().has(type);
        const optionalSize = (nonSourced ? 0 : NLPacket.#NUM_BYTES_LOCALID)
            + (nonSourced || nonVerified ? 0 : NLPacket.#NUM_BYTES_MD5_HASH);
        return 2 + optionalSize;  // C++: sizeof(PacketType) + sizeof(PacketVersion) + optionalSize
    }

    static #hashForPacketAndHMAC(packet: Packet, hash: HMACAuth): Uint8Array {
        // C++  QByteArray hashForPacketAndHMAC(const udt::Packet& packet, HMACAuth& hash)
        const offset = Packet.totalHeaderSize(packet.isPartOfMessage()) + NLPacket.#NUM_BYTES_PACKET_TYPE
            + NLPacket.#NUM_BYTES_PACKET_VERSION + NLPacket.#NUM_BYTES_LOCALID + NLPacket.#NUM_BYTES_MD5_HASH;
        const hashResult = new Uint8Array(NLPacket.#NUM_BYTES_MD5_HASH);
        hash.calculateHash(hashResult, packet.getMessageData().buffer, offset, packet.getDataSize() - offset);
        return hashResult;
    }


    constructor(
        param0: number | Packet,
        param1: number | undefined = undefined,
        param2: boolean | undefined = undefined,
        param3: boolean | undefined = undefined,
        param4: number | undefined = undefined) {

        if (typeof param0 === "number") {
            // C++  NLPacket(PacketType type, qint64 size = -1, bool isReliable = false, bool isPartOfMessage = false,
            //               PacketVersion version = 0)
            const type = param0;
            const size = param1 ? param1 : -1;
            const isReliable = param2 ? param2 : false;
            const isPartOfMessage = param3 ? param3 : false;
            const version = param4 ? param4 : 0;

            super(size === -1 ? -1 : NLPacket.#localHeaderSize(type) + size, isReliable, isPartOfMessage);
            this._messageData.type = type;
            this._messageData.version = version === 0 ? PacketType.versionForPacketType(type) : version;
            this.adjustPayloadStartAndCapacity(NLPacket.#localHeaderSize(type));
            this.#writeTypeAndVersion();

        } else if (param0 instanceof Packet) {
            // C++  NLPacket(Packet&& packet)
            const packet = param0;

            super(packet);
            const headerStart = this._messageData.dataPosition;
            this.#readType();
            this.#readVersion();
            this.#readSourceID();
            this._messageData.dataPosition = headerStart;  // Reset to start of header for #localHeaderSize().
            this.adjustPayloadStartAndCapacity(NLPacket.#localHeaderSize(this._messageData.type));

        } else {
            console.error("Invalid parameters in Packet constructor!", typeof param0, typeof param1, typeof param2,
                typeof param3, typeof param4);
            super(0, false, false);
        }
    }


    /*@devdoc
     *  Gets the type of the packet.
     *  @returns {PacketType} The type of the packet.
     */
    getType(): PacketTypeValue {
        // C++  PacketType getType()
        return this._messageData.type;
    }

    /*@devdoc
     *  Gets the version of the packet.
     *  @returns {PacketVersion} The version of the packet.
     */
    getVersion(): number {
        // C++  PacketVersion getVersion()
        return this._messageData.version;
    }

    /*@devdoc
     *  Gets the ID of the node that is the source of the packet.
     *  @returns {number} The source ID of the packet.
     */
    getSourceID(): number {
        // C++  LocalID getSourceID()
        return this._messageData.sourceID;
    }

    /*@devdoc
     *  Writes a source ID directly into the packet without using or advancing the current write position.
     *  @param {LocalID} sourceID - The source ID.
     */
    writeSourceID(sourceID: LocalID): void {
        // C++  void writeSourceID(LocalID sourceID)
        assert(!PacketType.getNonSourcedPackets().has(this._messageData.type));
        const offset = Packet.totalHeaderSize(this.isPartOfMessage()) + 2;
        this._messageData.data.setUint16(offset, sourceID, UDT.LITTLE_ENDIAN);
        this._messageData.sourceID = sourceID;
    }

    /*@devdoc
     *  Calculates the message authentication hash and writes it into the packet header.
     *  @param {HMACAuth} hmacAuth - The message authentication object to use for calculating the hash.
     */
    writeVerificationHash(hmacAuth: HMACAuth): void {
        // C++  void writeVerificationHash(HMACAuth & hmacAuth)
        assert(!PacketType.getNonSourcedPackets().has(this._messageData.type)
            && !PacketType.getNonVerifiedPackets().has(this._messageData.type));

        const offset = Packet.totalHeaderSize(this.isPartOfMessage()) + NLPacket.#NUM_BYTES_PACKET_TYPE
            + NLPacket.#NUM_BYTES_PACKET_VERSION + NLPacket.#NUM_BYTES_LOCALID;

        const verificationHash = NLPacket.#hashForPacketAndHMAC(this, hmacAuth);
        this._messageData.buffer.set(verificationHash, offset);
    }


    #readType(): void {
        // C++  void readType()
        const messageData = this._messageData;
        this._messageData.type = messageData.data.getUint8(messageData.dataPosition);
        messageData.dataPosition += 1;
    }

    #readVersion(): void {
        // C++  void readVersion()
        const messageData = this._messageData;
        messageData.version = messageData.data.getUint8(messageData.dataPosition);
        messageData.dataPosition += 1;
    }

    #readSourceID(): void {
        // C++  void readSourceID()
        const messageData = this._messageData;
        if (PacketType.getNonSourcedPackets().has(messageData.type)) {
            messageData.sourceID = Node.NULL_LOCAL_ID;
        } else {
            messageData.sourceID = messageData.data.getUint16(messageData.dataPosition, UDT.LITTLE_ENDIAN);
            messageData.dataPosition += 2;
        }
    }

    #writeTypeAndVersion(): void {
        // C++  void writeTypeAndVersion()
        const messageData = this._messageData;
        const headerOffset = Packet.totalHeaderSize(messageData.isPartOfMessage);
        messageData.data.setUint8(headerOffset, messageData.type);
        messageData.data.setUint8(headerOffset + 1, messageData.version);
    }

}

export default NLPacket;
