//
//  DataViewExtensions.js
//
//  Created by David Rowe on 16 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  Some methods are added to the prototype of JavaScript's
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView|DataView} object, for
 *  handling reading and writing large BigInt values. These methods are added only if they aren't already present in the
 *  browser's DataView implementation.
 *  <p>C++: N/A</p>
 *  @namespace DataView
 */

// WEBRTC TODO: May need to implement Uint64 methods for some browsers (e.g., Safari) if Babel doesn't handle this.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#64-bit_integer_values

/* eslint-disable no-magic-numbers, no-invalid-this  */

const MAX_U128_VALUE = 2n ** 128n - 1n;
const SHIFT_64_BITS = 64n;
const MASK_64_BITS = 0xffffffffffffffffn;

/*@devdoc
 *  Writes an unsigned 128-bit (16-byte) integer value to the DataView.
 *  @function DataView.setBigUint128
 *  @param {number} byteOffset - The offset from the start of the DataView.
 *  @param {BigInt} value - The value to write. The maximum value is <code>2n ** 128n - 1n</code>. If larger than this value,
 *      a value of <code>0n</code> is written.
 *  @param {boolean} littleEndian=false - <code>true</code> to write the data in little-endian format, <code>false</codE> to
 *      write in big-endian format.
 */
function setBigUint128(byteOffset, value, littleEndian = false) {
    const sanitizedValue = value > MAX_U128_VALUE ? 0n : value;
    if (littleEndian) {
        this.setBigUint64(byteOffset + 8, sanitizedValue >> SHIFT_64_BITS, littleEndian);
        this.setBigUint64(byteOffset, sanitizedValue & MASK_64_BITS, littleEndian);
    } else {
        this.setBigUint64(byteOffset, sanitizedValue >> SHIFT_64_BITS, littleEndian);
        this.setBigUint64(byteOffset + 8, sanitizedValue & MASK_64_BITS, littleEndian);
    }
}

/*@devdoc
 *  Reads an unsigned 128-bit (16-byte) integer value from the DataView.
 *  @function DataView.getBigUint128
 *  @param {number} byteOffset - The offset from the start of the DataView.
 *  @param {boolean} littleEndian=false - <code>true</code> to read the data in little-endian format, <code>false</codE> to read
 *      read in big-endian format.
 *  @returns {BigInt} The value read.
 */
function getBigUint128(byteOffset, littleEndian = false) {
    let result = null;
    if (littleEndian) {
        result = (this.getBigUint64(byteOffset + 8, littleEndian) << SHIFT_64_BITS)
            + this.getBigUint64(byteOffset, littleEndian);
    } else {
        result = (this.getBigUint64(byteOffset, littleEndian) << SHIFT_64_BITS)
            + this.getBigUint64(byteOffset + 8, littleEndian);
    }
    return result;
}

/* eslint-enable no-magic-numbers, no-invalid-this  */

/* eslint-disable no-extend-native */

if (!DataView.prototype.setBigUint128) {
    DataView.prototype.setBigUint128 = setBigUint128;
}
if (!DataView.prototype.getBigUint128) {
    DataView.prototype.getBigUint128 = getBigUint128;
}

/* eslint-enable no-extend-native */
