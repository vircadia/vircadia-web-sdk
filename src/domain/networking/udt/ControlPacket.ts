//
//  ControlPacket.ts
//
//  Created by David Rowe on 5 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import BasePacket from "./BasePacket";
import SequenceNumber from "./SequenceNumber";
import UDT from "./UDT";
import SockAddr from "../../networking/SockAddr";
import assert from "../../shared/assert";
import Log from "../../shared/Log";

enum ControlPacketType {
    ACK,
    Handshake,
    HandshakeACK,
    HandshakeRequest
}


/*@devdoc
 *  The <code>ControlPacket</code> class implements a control packet in the Vircadia protocol. Control packets are used to
 *  confirm connections and acknowledge receipt of reliably-sent packets.
 *  <p>See also: {@link NLPacket} and {@link Packet}.
 *  <p>C++ <code>ControlPacket : public BasePacket</code></p>
 *
 *  @class ControlPacket
 *  @extends BasePacket
 *  @param {ControlPacketType|DataView|ControlPacket} - The type of ControlPacket to create.
 *      <p>The raw byte data for a new packet.</p>
 *      <p>Another ControlPacket to reuse the data from.</p>
 *  @param {number|number|undefined} - The size of the packet to create, in bytes. If <code>-1</code>, a packet of the maximum
 *      size is created (though not all of it is sent). <strong>Default Value:</strong> <code>-1</code>
 *      <p>The size of the DataView in bytes.</p>
 *      <p>Unused.</p>
 *  @param {undefined|SockAddr|undefined} - Unused.
 *      <p>The sender's IP address and port.</p>
 *      <p>Unused.</p>
 *
 *  @property {ControlPacketType} ACK - <code>0</code> - Acknowledges the receipt of a data packet. Includes the
 *      {@link @SequenceNumber} of the packet being acknowledged.
 *  @property {ControlPacketType} Handshake - <code>1</code> - Offers a handshake. Includes a {@link @SequenceNumber}.
 *  @property {ControlPacketType} HandshakeACK - <code>2</code> - Acknowledges the receipt of a Handshake packet. Includes the
 *      {@link @SequenceNumber} of the Handshake packet being acknowledged.
 *  @property {ControlPacketType} HandshakeRequest - <code>3</code> - Requests a handshake. Does not include a sequence number.
 */
class ControlPacket extends BasePacket {
    // C++  ControlPacket : public BasePacket

    /*@devdoc
     *  A {@link ControlPacket} may be one of the following types:
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>ACK</td><td>0</td><td>Acknowledges the receipt of a data packet. Includes the {@link @SequenceNumber} of
     *              the packet being acknowledged.</td></tr>
     *          <tr><td>Handshake</td><td>1</td><td>Offers a handshake. Includes a {@link @SequenceNumber}.</td></tr>
     *          <tr><td>HandshakeACK</td><td>3</td><td>Acknowledges the receipt of a Handshake packet. Includes the
     *              {@link @SequenceNumber} of the Handshake packet being acknowledged.</td></tr>
     *          <tr><td>HandshakeRequest</td><td>1</td><td>Requests a handshake. Does not include a sequence number.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} ControlPacketType
     */


    static readonly ACK = ControlPacketType.ACK;
    static readonly Handshake = ControlPacketType.Handshake;
    static readonly HandshakeACK = ControlPacketType.HandshakeACK;
    static readonly HandshakeRequest = ControlPacketType.HandshakeRequest;


    static #localHeaderSize(): number {
        // C++  int ControlPacket:: localHeaderSize()
        return ControlPacket.#ControlBitAndTypeBytes;
    }


    /*@devdoc
     *  Creates a new ControlPacket &mdash; an alternative to using <code>new ControlPacket(...)</code>.
     *  <p><em>Static</em></p>
     *  @function ControlPacket.create
     *  @static
     *  @param {ControlPacketType} type - The type of ControlPacket to create.
     *  @param {number} size=-1 - The size of the packet to create, in bytes. If <code>-1</code>, a packet of the maximum size
     *      is created (though not all of it is sent).
     *  @returns {ControlPacket} A ControlPacket.
     */
    static create(type: ControlPacketType, size = -1): ControlPacket {
        // C++  ControlPacket* create(Type type, qint64 size = -1);
        return new ControlPacket(type, size);
    }

    /*@devdoc
     *  Creates a new ControlPacket from received data &mdash; an alternative to using <code>new ControlPacket(...)</code>.
     *  <p><em>Static</em></p>
     *  @function ControlPacket.fromReceivedPacket
     *  @static
     *  @param {DataView} data - The raw byte data of a new packet.
     *  @param {SockAddr} senderSockAddr - The sender's IP address and port.
     *  @returns {Packet} A ControlPacket created from the received data.
     */
    static fromReceivedPacket(data: DataView, size: number, senderSockAddr: SockAddr): ControlPacket {
        // Fail with null data.
        assert(data.byteLength > 0);

        // Fail with invalid size.
        assert(size >= 0);

        // Allocate memory.
        const packet = new ControlPacket(data, size, senderSockAddr);

        return packet;
    }

    /*@devdoc
     *  Gets the maximum size of a ControlPacket's Vircadia protocol payload.
     *  <p><em>Static</em></p>
     *  @static
     *  @function BasePacket.maxPayloadSize
     *  @returns {number} The maximum ControlPacket payload size, in bytes.
     */
    static override maxPayloadSize(): number {
        // C++  int maxPayloadSize()
        return BasePacket.maxPayloadSize() - ControlPacket.#localHeaderSize();
    }


    static readonly #ControlBitAndTypeBytes = 4;  // Bytes.
    static readonly #TYPE_OFFSET = 16;  // Bits.


    #_type = ControlPacketType.ACK;


    constructor(
        param0: ControlPacketType | DataView | ControlPacket,
        param1: number | number | undefined = undefined,
        param2: undefined | SockAddr | undefined = undefined) {

        if (typeof param0 === "number" && (typeof param1 === "number" || param1 === undefined)) {
            // C++  ControlPacket(Type type, qint64 size = -1)
            const type = param0;
            const size = param1 ? param1 : -1;

            super(size === -1 ? -1 : ControlPacket.#localHeaderSize() + size);

            this.#_type = type;
            // this.adjustPayloadStartAndCapacity(ControlPacket.#localHeaderSize());  N/A
            this.#writeType();

        } else if (param0 instanceof DataView && typeof param1 === "number" && param2 instanceof SockAddr) {
            // C++  ControlPacket(std::unique_ptr<char[]> data, qint64 size, const SockAddr& senderSockAddr)
            const data = param0;
            const size = param1;
            const senderSockAddr = param2;

            super(data, size, senderSockAddr);

            // #_payloadSize and #_payloadCapacity aren't used.
            // assert(this.#_payloadSize === this.#_payloadCapacity);

            // this.adjustPayloadStartAndCapacity(ControlPacket.#localHeaderSize(), this.#_payloadSize > 0);  N/A
            this.#readType();

        } else if (param0 instanceof ControlPacket) {
            // C++  ControlPacket(const ControlPacket other)
            const other = param0;

            super(other);

            this.#_type = other.getType();
        } else {
            Log.error(`Invalid parameters in ControlPacket constructor! ${typeof param0} ${typeof param1} ${typeof param2}`);
            super(0);
        }
    }

    /*@devdoc
     *  Gets the type of a control packet.
     *  @returns {ControlPacketType} The type of the control packet.
     */
    getType(): ControlPacketType {
        // C++  Type getType()
        return this.#_type;
    }

    /*@devdoc
     *  Sets the type of a control packet.
     *  @Param {ControlPacketType} type - The type of the control packet.
     */
    setType(type: ControlPacketType): void {
        // C++  void setType(udt::ControlPacket::Type type)
        this.#_type = type;
        this.#writeType();
    }

    /*@devdoc
     *  Reads the {@link SequenceNumber} from a control packet.
     *  @returns {SequenceNumber} The sequence number in the control packet.
     */
    readSequenceNumber(): SequenceNumber {
        // C++  N/A
        const value = this._messageData.data.getUint32(this._messageData.dataPosition, UDT.LITTLE_ENDIAN);
        this._messageData.dataPosition += 4;
        return new SequenceNumber(value);
    }

    /*@devdoc
     *  Writes a {@link SequenceNumber} to a control packet.
     *  @param {SequenceNumber} sequenceNumber: The sequence number to write in the control packet.
     */
    writeSequenceNumber(sequenceNumber: SequenceNumber): void {
        // C++  N/A
        this._messageData.data.setUint32(this._messageData.dataPosition, sequenceNumber.value, UDT.LITTLE_ENDIAN);
        this._messageData.dataPosition += 4;
    }


    #writeType(): void {
        // C++  void ControlPacket::writeType()
        const bitAndType = UDT.CONTROL_BIT_MASK | this.#_type << ControlPacket.#TYPE_OFFSET;
        this._messageData.data.setUint32(this._messageData.dataPosition, bitAndType, UDT.LITTLE_ENDIAN);
        this._messageData.dataPosition += 4;
    }

    #readType(): void {
        // C++  void ControlPacket::readType() {
        const bitAndType = this._messageData.data.getUint32(this._messageData.dataPosition, UDT.LITTLE_ENDIAN);
        this._messageData.dataPosition += 4;

        assert((bitAndType & UDT.CONTROL_BIT_MASK) !== 0, "ControlPacket.readType()", "This should be a control packet.");

        const packetType = (bitAndType & ~UDT.CONTROL_BIT_MASK) >> ControlPacket.#TYPE_OFFSET;
        assert(packetType <= ControlPacketType.HandshakeRequest, "ControlPacket.readType()",
            "Received a control packet with invalid type.");

        this.#_type = packetType;
    }

}

export default ControlPacket;
export type { ControlPacketType };
