//
//  PropertyFlags.ts
//
//  Created by Julien Merzoug on 06 June 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>PropertyFlags</code> class provides facilities to decode, set and get property flags.
 *  <p>C++: <code>template&lt;typename Enum&gt; class PropertyFlags </code></p>
 *  @class PropertyFlags
 */
// WEBRTC TODO: Make the class generic.
class PropertyFlags {
    // C++ template<typename Enum>class PropertyFlags

    // WEBRTC TODO: Move to NumericalConstants.ts
    readonly #BITS_IN_BYTE = 8;

    #_flags = new Uint8Array(0);
    #_maxFlag = Number.MIN_SAFE_INTEGER;
    #_minFlag = Number.MAX_SAFE_INTEGER;
    #_trailingFlipped = false;

    /*@devdoc
     *  Gets whether the property flag is present in the flags sent by the server.
     *  @param {number} flag - The bit position of the flag.
     *  @returns {boolean} <code>true</code> if the property flag is present, <code>false</code> if it isn't.
     */
    getHasProperty(flag: number): boolean {
        // C++ bool getHasProperty(Enum flag)

        const bytePos = Math.floor(flag / this.#BITS_IN_BYTE);

        if (flag > this.#_maxFlag) {
            // Usually false.
            return this.#_trailingFlipped;
        }

        const bitPos = flag - bytePos * this.#BITS_IN_BYTE;
        const mask = 1 << bitPos;
        const tmp = this.#_flags[bytePos] ?? 0;

        return (tmp & mask) > 0;
    }

    /*@devdoc
     *  Sets the property flag.
     *  @param {number} flag - The bit position of the flag.
     *  @param {boolean} value - The value to set the flag to.
     */
    setHasProperty(flag: number, value: boolean): void {
        // C++ void setHasProperty(Enum flag, bool value = true)

        const bytePos = Math.floor(flag / this.#BITS_IN_BYTE);

        if (flag < this.#_minFlag) {
            if (value) {
                this.#_minFlag = flag;
            }
        }

        if (flag > this.#_maxFlag) {
            if (value) {
                this.#_maxFlag = flag;
                const newFlags = new Uint8Array(this.#_flags.length + bytePos + 1);
                newFlags.set(this.#_flags);
                this.#_flags = newFlags;
            } else {
                // Bail early, we're setting a flag outside of our current _maxFlag to false, which is already the default.
                return;
            }
        }

        // flag represents the position of the bit to set.
        // We subtract bytePos * 8 bits from flag because we store the bit representation of flags as an array of bytes, and we
        // want to update a single bit within a byte.
        const bitPosInByte = flag - bytePos * this.#BITS_IN_BYTE;
        const byteMask = 1 << bitPosInByte;
        let byteValue = this.#_flags[bytePos] ?? 0;

        if (value) {
            byteValue |= byteMask;
        } else {
            byteValue &= ~byteMask;
        }

        this.#_flags.set([byteValue], bytePos);
    }

    /*@devdoc
     *  Decode the encoded property flags.
     *  @param {DataView} data - The data to decode.
     *  @param {number} size - The maximum size of the data to decode.
     *  @returns {number} The number of bytes processed.
     */
    decode(data: DataView, size: number): number {
        // C++ size_t decode(const uint8_t* data, size_t length)

        /* Process each bit of each  byte until the stop condition is reached.
        * Starts from the leftmost bit.
        * Advance through the lead bits (contiguous 1s starting from the left) until the first non lead bit is found (first 0
        * encountered).
        * Compute the position of the last bit.
        * Continue iterating through the next bits and set the flag property corresponding to the current value of the variable
        * flag when a bit is set.
        * Stop when the lead bits AND the last bit have been processed (at the position denoted by lastValueBit).
        *
        * The number of lead bits represents the number of bytes to decode.
        */
        this.#clear();

        let bytesConsumed = 0;
        const bitCount = this.#BITS_IN_BYTE * size;
        // There is at least 1 byte (after the leadBits).
        let encodedByteCount = 1;
        // There is always at least 1 lead bit.
        let leadBits = 1;
        let inLeadBits = true;
        let bitAt = 0;
        let expectedBitCount = 0;
        let lastValueBit = 0;

        for (let byte = 0; byte < size; byte++) {
            const originalByte = data.getUint8(byte);
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
                        const flag = bitAt - leadBits;
                        this.setHasProperty(flag, true);
                    }
                }
                bitAt += 1;
                maskBit = maskBit >> 1;
            }
            if (!inLeadBits && bitAt > lastValueBit) {
                break;
            }
        }

        // WEBRTC TODO: Address further C++ code.

        return bytesConsumed;
    }

    /*@devdoc
     *  Encode the property flags.
     *  @param {DataView} data - The data to encode to.
     *  @returns {number} The number of bytes written.
     */
    encode(data: DataView): number {
        // C++ template<typename Enum> inline QByteArray PropertyFlags<Enum>::encode()

        if (this.#_maxFlag < this.#_minFlag)
        {
            data.setUint8(0, 0);
            return 1;
        }

        // same as ByteCountCoded.encode except #_maxFlag is off by one, which I guess is fine cause of otherwise sometimes redundant +1
        const lengthInBytes = Math.floor(this.#_maxFlag / (this.#BITS_IN_BYTE - 1)) + 1;

        // a little helper to write bits
        let bitPosition = 0;
        let appendBit = (bitValue: number) => {
            let bytePosition = bitPosition / this.#BITS_IN_BYTE;
            let original = data.getUint8(bytePosition);
            let bitOffset = bitPosition % this.#BITS_IN_BYTE;
            let shiftBy = this.#BITS_IN_BYTE - 1 - bitOffset; // reverse bit order
            let mask = bitValue << shiftBy;
            if (bitValue) {
                data.setUint8(bytePosition, original | mask);
            } else {
                data.setUint8(bytePosition, original & ~mask);
            }
            ++bitPosition;
        };

        // write size-1 header bits, that are all 1s
        for (let i = 0; i < lengthInBytes-1;  ++i) {
            appendBit(1);
        }
        // write the last header bit that is 0
        appendBit(0);

        for (let i = 0; i < this.#_maxFlag + 1;  ++i) {
            let bytePosition = Math.floor(i / this.#BITS_IN_BYTE);
            let bitOffset = i % this.#BITS_IN_BYTE;
            appendBit(((this.#_flags[bytePosition] ?? 0) >> bitOffset) & 1);
        }

        return lengthInBytes;
    }

    #clear(): void {
        // C++ void clear()
        this.#_flags = new Uint8Array(0);
        this.#_maxFlag = Number.MIN_SAFE_INTEGER;
        this.#_minFlag = Number.MAX_SAFE_INTEGER;
        this.#_trailingFlipped = false;

        // WEBRTC TODO: Address further C++ code.
    }
}

export default PropertyFlags;
