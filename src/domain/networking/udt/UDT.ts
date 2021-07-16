//
//  UDT.ts
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  Vircadia protocol packet constants.
 *  <p>C++: <code>udt</code></p>
 *
 *  @namespace UDT
 *  @property {number} MAX_PACKET_SIZE=1464 The maximum {@link BasePacket} Vircadia protocol payload size.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *
 *  @property {number} CONTROL_BIT_MASK=0x80000000 - Mask for reading / writing the control bit.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {number} RELIABILITY_BIT_MASK=0x40000000 - Mask for reading / writing the reliability bit.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {number} MESSAGE_BIT_MASK=0x20000000 - Mask for reading / writing the message bit.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {number} OBFUSCATION_LEVEL_BIT_MASK=0x18000000 - Mask for reading / writing the obfuscation level bits.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {number} SEQUENCE_NUMBER_BIT_MASK=0x7fffff - Mask for reading / writing the sequence number.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *
 *  @property {number} OBFUSCATION_LEVEL_OFFSET=27 - Number of bits the obfuscation level value is offset.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {number} PACKET_POSITION_OFFSET=30 - Number of bits the packet position value is offset.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {boolean} LITTLE_ENDIAN=true - Read / write DataView values in little-endian format.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *  @property {boolean} BIG_ENDIAN=false - Read / write DataView values in big-endian format.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 */
const UDT = new (class {
    // C++: udt

    /* eslint-disable no-magic-numbers */

    MAX_PACKET_SIZE = 1464;

    CONTROL_BIT_MASK = 0x80000000;
    RELIABILITY_BIT_MASK = 0x40000000;
    MESSAGE_BIT_MASK = 0x20000000;
    OBFUSCATION_LEVEL_BIT_MASK = 0x18000000;
    SEQUENCE_NUMBER_BIT_MASK = 0x7fffff;

    OBFUSCATION_LEVEL_OFFSET = 27;
    PACKET_POSITION_OFFSET = 30;

    LITTLE_ENDIAN = true;
    BIG_ENDIAN = false;

    /* eslint-enable no-magic-numbers */

})();

export default UDT;
