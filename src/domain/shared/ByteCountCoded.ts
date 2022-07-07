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
 *  The <code>ByteCountCoded</code> class provides facilities to decode data.
 *  <p>C++: <code>template&lt;typename T&gt; class ByteCountCoded</code></p>
 *  @class ByteCountCoded
 *
 *  @property {number} data - The decoded byte count encoded data.
 */
// WEBRTC TODO: Make the class generic.
class ByteCountCoded {
    // C++ template<typename T> class ByteCountCoded

    // WEBRTC TODO: Move to NumericalConstants.ts
    readonly #BITS_IN_BYTE = 8;

    #_data = 0;

    get data(): number {
        return this.#_data;
    }

    /*@devdoc
     *  Decode the encoded data.
     *  @param {DataView} encodedBuffer - The data to decode.
     *  @param {number} encodedSize - The maximum size of the data to decode.
     *  @returns {number} The number of bytes processed.
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

        this.#_data = 0;

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
                        this.#_data += bitValue;
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

    // WEBRTC TODO: Address further C++ code.
}

export default ByteCountCoded;
