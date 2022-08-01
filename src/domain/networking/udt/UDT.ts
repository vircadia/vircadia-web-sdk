//
//  UDT.ts
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>UDT</code> namespace provides Vircadia protocol packet constants.
 *  <p>C++: <code>udt</code></p>
 *
 *  @namespace UDT
 *  @property {number} UDP_IPV4_HEADER_SIZE=28 The number of bytes in a UDP/IPV4 packet header.
 *      <em>Read-only.</em>
 *  @property {number} MAX_PACKET_SIZE=1464 The maximum {@link BasePacket} Vircadia protocol payload size.
 *      <em>Read-only.</em>
 *  @property {boolean} LITTLE_ENDIAN=true - Read / write DataView values in little-endian format.
 *      <em>Read-only.</em>
 *  @property {boolean} BIG_ENDIAN=false - Read / write DataView values in big-endian format.
 *      <em>Read-only.</em>
 *
 *  @property {number} MESSAGE_NUMBER_SIZE=30 - Number of bits in the message number.
 *      <em>Read-only.</em>
 *
 *  @property {number} OBFUSCATION_LEVEL_OFFSET=27 - Number of bits the obfuscation level value is offset.
 *      <em>Read-only.</em>
 *  @property {number} PACKET_POSITION_OFFSET=30 - Number of bits the packet position value is offset.
 *      <em>Read-only.</em>

  *  @property {number} CONTROL_BIT_MASK=0x80000000 - Mask for reading / writing the control bit.
 *      <em>Read-only.</em>
 *  @property {number} RELIABILITY_BIT_MASK=0x40000000 - Mask for reading / writing the reliability bit.
 *      <em>Read-only.</em>
 *  @property {number} MESSAGE_BIT_MASK=0x20000000 - Mask for reading / writing the message bit.
 *      <em>Read-only.</em>
 *  @property {number} OBFUSCATION_LEVEL_BIT_MASK=0x18000000 - Mask for reading / writing the obfuscation level bits.
 *      <em>Read-only.</em>
 *  @property {number} SEQUENCE_NUMBER_BIT_MASK=0x7fffff - Mask for reading / writing the sequence number.
 *      <em>Read-only.</em>
 *  @property {number} BIT_FIELD_MASK=0xf8000000 - Mask for reading / writing the packet bit fields.
 *      <em>Read-only.</em>
 *  @property {number} MESSAGE_NUMBER_MASK=0x3fffffff - Mask for reading / writing the message number.
 *      <em>Read-only.</em>
 *
 *  @property {boolean} UDT_CONNECTION_DEBUG=false - Internal setting for debugging UDT communications.
 *      <em>Read-only.</em>
 */
const UDT = new class {
    // C++: udt - Constants.h


    readonly UDP_IPV4_HEADER_SIZE = 28;
    readonly MAX_PACKET_SIZE = 1464;

    readonly LITTLE_ENDIAN = true;
    readonly BIG_ENDIAN = false;


    // Header constants

    // Bit sizes (in order)
    readonly MESSAGE_NUMBER_SIZE = 30;

    // Offsets
    readonly OBFUSCATION_LEVEL_OFFSET = 27;
    readonly PACKET_POSITION_OFFSET = 30;

    // Masks
    readonly CONTROL_BIT_MASK = 0x80000000;
    readonly RELIABILITY_BIT_MASK = 0x40000000;
    readonly MESSAGE_BIT_MASK = 0x20000000;
    readonly OBFUSCATION_LEVEL_BIT_MASK = 0x18000000;
    readonly SEQUENCE_NUMBER_BIT_MASK = 0x7ffffff;
    readonly BIT_FIELD_MASK = 0xF8000000;
    readonly MESSAGE_NUMBER_MASK = 0x3fffffff;


    // Internal debug
    readonly UDT_CONNECTION_DEBUG = false;

}();

export default UDT;
