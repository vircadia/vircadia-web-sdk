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
 *  The <code>ByteCountCoded</code> class provides facilities to encode and
 *  decode up 64 bits unsigned integers in a compact(for small values) byte
 *  counted format.
 *  <p>C++: <code>template&lt;typename T&gt; class ByteCountCoded</code></p>
 *  @class ByteCountCoded
 *
 *  @property {bigint} data - The unsigned integer value to be encoded from or decoded to.
 */
// WEBRTC TODO: Make the class generic.
class ByteCountCoded {
    // C++ template<typename T> class ByteCountCoded

    // WEBRTC TODO: Move to NumericalConstants.ts
    readonly #BITS_IN_BYTE = 8;

    #_data: bigint = 0n;

    get data(): bigint {
        return this.#_data;
    }

    set data(value: bigint) {
        this.#_data = value;
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
        let bitValue = 1n;

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
                    bitValue *= 2n;
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

    /*@devdoc
     *  Encode the data.
     *  @param {DataView} encodedBuffer - The buffer to write encoded data to.
     *  @returns {number} The number of bytes written.
     */
    encode(encodedBuffer: DataView): number {
        // C++ template<typename T> inline QByteArray ByteCountCoded<T>::encode()

        /*
        * Conceptually this encoding removes the leading zero bits of the
        * unsigned integer, then adds a header that encodes the remaining size
        * plus its own size in bytes with consecutive `size-1` 1s and one 0,
        * and encodes the integer itself in reverse order of bits, so that
        * unused trailing zero bits do not affect the value.
        */

        // we support encoding up to 64bit integers
        let totalBits = 64;

        // count leading zeros
        let high32Bits = Number(BigInt.asUintN(32, this.#_data >> 32n));
        let low32Bits = Number(BigInt.asUintN(32, this.#_data));
        let leadingZeros = high32Bits == 0 ? 32 + Math.clz32(low32Bits) : Math.clz32(high32Bits);

        let valueBits = totalBits - leadingZeros;

        // The following counts the byte size of the resulting encoded value
        // with the header. The best way I can explain the division by 7
        // (BITS_IN_BYTE -1) is that if we would discount the header to find
        // the number of bytes we would just divide the bit count by 8 (and
        // round up, but more on that later) and we can view this division as a
        // count of consecutive subtractions of 8, until the value becomes < 8.
        // Now to account for the header (which uses up 1 bit to encode size of
        // 1 byte) with each subtraction of 8 we can add 1 to the total. This
        // way at the end we will arrive at a total count that includes the
        // header.  Now subtracting 8 and adding 1 is the same as subtracting 7
        // so the whole thing is just division by 7. The additional +1
        // afterwards is to account for the remainder bits, however that
        // results in an unnecessary extra byte when the number of bits is
        // exactly divisible by 7, so it would be more efficient to round up (+
        // bool(bits%7)), but that's not what the C++ code does, so we follow
        // suit. There is also the edge case of 0 bits, where we need to send a
        // byte since our header is incapable of expressing size 0, so the +1
        // handles that as well without an extra condition.
        let numberOfBytes = Math.floor(valueBits / (this.#BITS_IN_BYTE - 1)) + 1;

        // a little helper to write bits
        let bitPosition = 0;
        let appendBit = (bitValue: number) => {
            let bytePosition = bitPosition / this.#BITS_IN_BYTE;
            let original = encodedBuffer.getUint8(bytePosition);
            let bitOffset = bitPosition % this.#BITS_IN_BYTE;
            let shiftBy = this.#BITS_IN_BYTE - 1 - bitOffset; // reverse bit order
            encodedBuffer.setUint8(bytePosition, original | (bitValue << shiftBy));
            ++bitPosition;
        };

        // write size-1 header bits, that are all 1s
        for (let i = 0; i < numberOfBytes-1;  ++i) {
            appendBit(1);
        }
        // write the last header bit that is 0
        appendBit(0);

        // write the value bits
        let temp = this.#_data;
        for (let i = 0; i < valueBits;  ++i) {
            appendBit(Number(temp & 1n));
            temp = temp >> 1n;
        }

        return Math.ceil(bitPosition / this.#BITS_IN_BYTE);
    }
}

export default ByteCountCoded;
