//
//  ByteCountCoded.ts
//
//  Created by Julien Merzoug on 01 June 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>ByteCountCoded</code> class provides facilities to encode and decode byte count coded integer data.
 *  Up to 64-bit integer values are supported.
 *  <p>C++: <code>template&lt;typename T&gt; class ByteCountCoded</code></p>
 *  @class ByteCountCoded
 *
 *  @property {bigint} data - The integer value to encode or the decoded integer value.
 */
// WEBRTC TODO: Make the class generic.
class ByteCountCoded {
    // C++ template<typename T> class ByteCountCoded

    // WEBRTC TODO: Move to NumericalConstants.ts
    readonly #BITS_IN_BYTE = 8;

    #_data = 0n;  // BigInt required for 64-bit values.

    get data(): bigint {
        return this.#_data;
    }

    set data(data: bigint) {
        this.#_data = data;
    }

    /*@devdoc
     *  Decodes the encoded data.
     *  @param {DataView} encodedBuffer - The data to decode.
     *  @param {number} encodedSize - The maximum size of the data to decode.
     *  @returns {number} The number of bytes processed. The decoded value is provided in the <code>data</code> property.
     */
    decode(encodedBuffer: DataView, encodedSize: number): number {
        // C++ template<typename T> inline size_t ByteCountCoded<T>::decode(const char* encodedBuffer, int encodedSize)

        /* Process each bit of each  byte until the stop condition is reached.
        * Starts from the leftmost bit.
        * Advance through the lead bits (contiguous 1s starting from the left) until the first non lead bit is found (first 0
        * encountered).
        * Compute the position of the last bit.
        * Continue iterating through the next bits and add the current bitValue to data when a bit is set.
        * Double the current bitValue during each iteration, bitValue starting at 1.
        * Stop when the lead bits AND the last bit have been processed (at the position denoted by lastValueBit).
        *
        * The number of lead bits represents the number of bytes to decode.
        *
        * Examples:
        * a. 0001 0000 -> The decoded value is 4.
        * Explanation: The first bit always counts as a lead bit. It is then followed by two 0s and a 1. Upon reaching that 1
        * the bitValue is 4. The next bits are all 0 so data's final value is 4.
        *
        * b. 0011 0000 -> The decoded value is 6.
        */

        this.#_data = 0n;

        let bytesConsumed = 0;
        const bitCount = this.#BITS_IN_BYTE * encodedSize;

        // There is at least 1 byte (after the leadBits).
        let encodedByteCount = 1;
        // There is always at least 1 lead bit.
        let leadBits = 1;
        let inLeadBits = true;
        let bitAt = 0;
        let expectedBitCount = 0;
        let lastValueBit = 0;
        let bitValue = 1;

        for (let byte = 0; byte < encodedSize; byte++) {
            const originalByte = encodedBuffer.getUint8(byte);
            bytesConsumed += 1;
            // Left Most Bit set.
            let maskBit = 128;
            for (let bit = 0; bit < this.#BITS_IN_BYTE; bit++) {
                const bitIsSet: boolean = (originalByte & maskBit) !== 0;

                // Processing of the lead bits.
                if (inLeadBits) {
                    if (bitIsSet) {
                        encodedByteCount += 1;
                        leadBits += 1;
                    } else {
                        // Once we hit our first 0, we know we're out of the lead bits.
                        inLeadBits = false;
                        expectedBitCount = encodedByteCount * this.#BITS_IN_BYTE - leadBits;
                        lastValueBit = expectedBitCount + bitAt;

                        // Check to see if the remainder of our buffer is sufficient.
                        if (expectedBitCount > bitCount - leadBits) {
                            break;
                        }
                    }
                } else {
                    if (bitAt > lastValueBit) {
                        break;
                    }

                    if (bitIsSet) {
                        this.#_data += BigInt(bitValue);
                    }
                    bitValue *= 2;
                }
                bitAt += 1;
                maskBit = maskBit >> 1;
            }
            if (!inLeadBits && bitAt > lastValueBit) {
                break;
            }
        }

        return bytesConsumed;
    }

    /**
     *  Encodes the numeric value set in the <code>data</code> property into the buffer.
     *  @param data - The buffer to write the encoded value into.
     *  @returns The number of bytes written.
     */
    encode(data: DataView): number {
        // C++  template<typename T> inline QByteArray ByteCountCoded<T>::encode() const

        const totalBits = 64;  // Up to 64-bit integers.
        let valueBits = totalBits;
        let firstValueFound = false;
        let temp = this.#_data;
        const lastBitMask = 1n << BigInt(totalBits - 1);

        // determine the number of bits that the value takes
        for (let bitAt = 0; bitAt < totalBits; bitAt++) {
            const bitValue = (temp & lastBitMask) === lastBitMask;
            if (!firstValueFound) {
                if (!bitValue) {
                    valueBits -= 1;
                } else {
                    firstValueFound = true;
                }
            }
            temp = temp << 1n;
        }

        // Calculate the number of total bytes, including our header.
        // BITS_IN_BYTE-1 because we need to code the number of bytes in the header
        // + 1 because we always take at least 1 byte, even if number of bits is less than a bytes worth
        const BITS_IN_BYTE = 8;
        const numberOfBytes = Math.trunc(valueBits / (BITS_IN_BYTE - 1)) + 1;

        // Fill data with initial 0s.
        for (let i = 0; i < numberOfBytes; i++) {
            data.setUint8(i, 0);
        }

        // Next, pack the number of header bits in, the first N-1 to be set to 1, the last to be set to 0.
        for (let i = 0; i < numberOfBytes; i++) {
            const outputIndex = i;
            const bitValue = i < numberOfBytes - 1 ? 1 : 0;
            const original = data.getUint8(outputIndex / BITS_IN_BYTE);
            const shiftBy = BITS_IN_BYTE - (outputIndex % BITS_IN_BYTE + 1);
            const thisBit = bitValue << shiftBy;
            data.setUint8(i / BITS_IN_BYTE, original | thisBit);
        }

        // finally pack the actual bits from the bit array.
        temp = this.#_data;
        for (let i = numberOfBytes; i < numberOfBytes + valueBits; i++) {
            const outputIndex = i;
            const bitValue = temp & 1n;
            const original = data.getUint8(outputIndex / BITS_IN_BYTE);
            const shiftBy = Math.trunc(BITS_IN_BYTE - (outputIndex % BITS_IN_BYTE + 1));
            const thisBit = bitValue << BigInt(shiftBy);
            data.setUint8(i / BITS_IN_BYTE, original | Number(thisBit));
            temp = temp >> 1n;
        }

        return numberOfBytes;
    }

    // WEBRTC TODO: Address further C++ code.

}

export default ByteCountCoded;
