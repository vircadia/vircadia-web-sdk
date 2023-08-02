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
 *  @property {number} length - The number of flags.
 */
// WEBRTC TODO: Make the class generic.
class PropertyFlags {
    // C++ template<typename Enum>class PropertyFlags

    #_flags: boolean[] = [];
    #_maxFlag = Number.MIN_SAFE_INTEGER;
    #_minFlag = Number.MAX_SAFE_INTEGER;
    #_trailingFlipped = false;
    #_encodedLength = 0;

    constructor(otherPropertyFlags?: PropertyFlags) {
        if (otherPropertyFlags) {
            for (let i = 0, length = otherPropertyFlags.length(); i < length; i += 1) {
                this.setHasProperty(i, otherPropertyFlags.getHasProperty(i));
            }
        }
    }


    /*@devdoc
     *  Copies the flags from another instance.
     *  @param {PropertyFlags} other - The other instance to copy the flags from.
     */
    copy(other: PropertyFlags): void {
        // C++  operator = (const PropertyFlags& other)
        this.#clear();
        for (let i = 0, length = other.length(); i < length; i++) {
            this.setHasProperty(i, other.getHasProperty(i));
        }
    }

    /*@devdoc
     *  Gets whether the property flags are empty.
     *  @returns {boolean} <code>true</code> if no property flags are set, <code>false</code> if one or more are set.
     */
    isEmpty(): boolean {
        // C++  bool isEmpty()
        return this.#_trailingFlipped === false && this.#_encodedLength === 0;
    }

    /*@devdoc
     *  Gets the number of flags.
     *  @returns {number} The number of flags.
     */
    length(): number {
        // C++  int QByteArray::length() const
        return this.#_flags.length;
    }

    /*@devdoc
     *  Gets the number of bytes used in the encoding, after calling {@link encode} or {@link decode}.
     *  @returns {number} The number of bytes used in the encoding, or <code>0</code> if {@link encode} or {@link decode}
     *      haven't been called.
     */
    getEncodedLength(): number {
        // C++  int getEncodedLength() const
        return this.#_encodedLength;
    }

    /*@devdoc
     *  Gets whether the property flag is present in the flags sent by the server.
     *  @param {number} flag - The bit position of the flag.
     *  @returns {boolean} <code>true</code> if the property flag is present, <code>false</code> if it isn't.
     */
    getHasProperty(flag: number): boolean {
        // C++  bool getHasProperty(Enum flag)

        if (flag > this.#_maxFlag) {
            // Usually false.
            return this.#_trailingFlipped;
        }

        return this.#_flags[flag] ?? false;
    }

    /*@devdoc
     *  Sets the property flag.
     *  @param {number} flag - The bit position of the flag.
     *  @param {boolean} value - The value to set the flag to.
     */
    setHasProperty(flag: number, value: boolean): void {
        // C++  void setHasProperty(Enum flag, bool value = true)

        if (flag < this.#_minFlag) {
            if (value) {
                this.#_minFlag = flag;
            }
        }
        if (flag > this.#_maxFlag) {
            if (value) {
                this.#_maxFlag = flag;
                this.#resize(this.#_maxFlag + 1);
            } else {
                // We're setting a flag outside of our current _maxFlag to false, which is already the default.
                return;
            }
        }
        this.#_flags[flag] = value;

        if (flag === this.#_maxFlag && !value) {
            this.#shrinkIfNeeded();
        }
    }

    /*@devdoc
     *  "Or"s the property flags with another instance.
     *  @param {PropertyFlags} other - The other instance to "or" the flags with.
     */
    or(other: PropertyFlags): void {
        // C++  PropertyFlags<Enum>& PropertyFlags<Enum>::operator|=(const PropertyFlags& other)
        for (let i = 0, length = other.length(); i < length; i++) {
            this.setHasProperty(i, this.getHasProperty(i) || other.getHasProperty(i));
        }
    }

    /*@devdoc
     *  Decodes property flags from input data.
     *  @param {DataView} data - The data to decode.
     *  @param {number} size - The maximum size of the data to decode.
     *  @returns {number} The number of bytes processed.
     */
    decode(data: DataView, size: number): number {
        // C++  size_t PropertyFlags<Enum>::decode(const uint8_t* data, size_t size)

        this.#clear();

        let bytesConsumed = 0;
        const BITS_IN_BYTE = 8;
        const bitCount = BITS_IN_BYTE * size;

        let encodedByteCount = 1;  // There is at least 1 byte (after the leadBits).
        let leadBits = 1;  // There is always at least 1 lead bit.
        let inLeadBits = true;
        let bitAt = 0;
        let expectedBitCount = 0;  // Unknown at this stage.
        let lastValueBit = 0;
        for (let byte = 0; byte < size; byte++) {
            const originalByte = data.getUint8(byte);
            bytesConsumed += 1;
            let maskBit = 0x80;  // Left-most bit set.
            for (let bit = 0; bit < BITS_IN_BYTE; bit++) {
                const bitIsSet = originalByte & maskBit;
                // Processing of the lead bits.
                if (inLeadBits) {
                    if (bitIsSet) {
                        encodedByteCount += 1;
                        leadBits += 1;
                    } else {
                        inLeadBits = false;  // Once we hit our first 0, we know we're out of the lead bits.
                        expectedBitCount = encodedByteCount * BITS_IN_BYTE - leadBits;
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
                        this.setHasProperty(bitAt - leadBits, true);
                    }
                }
                bitAt += 1;
                maskBit >>= 1;
            }
            if (!inLeadBits && bitAt > lastValueBit) {
                break;
            }
        }
        this.#_encodedLength = bytesConsumed;
        return bytesConsumed;
    }

    /*@devdoc
     *  Encodes the property flags into a buffer.
     *  @param {DataView} output - The section of buffer to write to.
     *  @returns {number} The number of bytes processed.
     */
    encode(output: DataView): number {
        // C++  QByteArray PropertyFlags<Enum>::encode()

        if (this.#_maxFlag < this.#_minFlag) {
            output.setUint8(0, 0);
            return 1;  // No flags... nothing to encode.
        }

        const BITS_PER_BYTE = 8;
        const lengthInBytes = Math.floor(this.#_maxFlag / (BITS_PER_BYTE - 1) + 1);

        for (let i = 0; i < lengthInBytes; i++) {
            output.setUint8(i, 0);
        }

        // Pack the number of header bits in, the first N-1 to be set to 1, the last to be set to 0.
        for (let i = 0; i < lengthInBytes; i++) {
            const outputIndex = i;
            const bitValue = i < lengthInBytes - 1 ? 1 : 0;
            const original = output.getUint8(outputIndex / BITS_PER_BYTE);
            const shiftBy = BITS_PER_BYTE - (outputIndex % BITS_PER_BYTE + 1);
            const thisBit = bitValue << shiftBy;
            output.setUint8(i / BITS_PER_BYTE, original | thisBit);
        }

        // Pack the actual bits from the bit array.
        for (let i = lengthInBytes; i < lengthInBytes + this.#_maxFlag + 1; i++) {
            const flagIndex = i - lengthInBytes;
            const outputIndex = i;
            const bitValue = this.#_flags[flagIndex] ? 1 : 0;
            const original = output.getUint8(outputIndex / BITS_PER_BYTE);
            const shiftBy = BITS_PER_BYTE - (outputIndex % BITS_PER_BYTE + 1);
            const thisBit = bitValue << shiftBy;
            output.setUint8(i / BITS_PER_BYTE, original | thisBit);
        }

        this.#_encodedLength = lengthInBytes;
        return lengthInBytes;
    }

    /*@devdoc
     *  Outputs debug information about the property flags to the console.
     *  @param {string} [prefix] - A string to prefix the debug output with.
     */
    debugDumpBits(prefix?: string): void {
        // C++  void PropertyFlags<Enum>::debugDumpBits()
        // console.debug("#_minFlag =", this.#_minFlag);
        // console.debug("#_maxFlag =", this.#_maxFlag);
        // console.debug("#_trailingFlipped =", this.#_trailingFlipped);
        // console.debug("#_encodedLength =", this.#_encodedLength);
        // console.debug("#_flags.length =", this.#_flags.length);
        let bits = "";
        for (let i = 0; i < this.#_flags.length; i++) {
            bits += this.#_flags[i] ? "1" : "0";
        }
        console.debug(`${prefix ? prefix + " " : ""}bits:`, bits);
    }

    #clear(): void {
        // C++  void clear()
        this.#_flags = [];
        this.#_maxFlag = Number.MIN_SAFE_INTEGER;
        this.#_minFlag = Number.MAX_SAFE_INTEGER;
        this.#_trailingFlipped = false;
        this.#_encodedLength = 0;
    }

    #resize(size: number): void {
        // C++  void QBitArray::resize(qsizetype size)
        if (size < this.#_flags.length) {
            for (let i = this.#_flags.length; i > size; i--) {
                this.#_flags.pop();
            }
        } else if (size > this.#_flags.length) {
            for (let i = this.#_flags.length; i < size; i++) {
                this.#_flags[i] = false;
            }
        }
        const BITS_PER_BYTE = 8;
        this.#_encodedLength = Math.ceil(this.#_flags.length / BITS_PER_BYTE);
    }

    #shrinkIfNeeded(): void {
        // C++  template<typename Enum> inline void PropertyFlags<Enum>::shrinkIfNeeded()
        const maxFlagWas = this.#_maxFlag;
        while (this.#_maxFlag >= 0) {
            if (this.#_flags[this.#_maxFlag]) {
                break;
            }
            this.#_maxFlag -= 1;
        }
        if (maxFlagWas !== this.#_maxFlag) {
            this.#resize(this.#_maxFlag + 1);
        }
    }
}

export default PropertyFlags;
