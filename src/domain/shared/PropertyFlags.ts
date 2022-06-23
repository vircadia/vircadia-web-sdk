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


// TODO: doc
class PropertyFlags {
    // TODO: doc

    // WEBRTC TODO: Move to NumericalConstants.ts
    static readonly BITS_IN_BYTE = 8;

    #_flags = new Uint8Array(0); // TODO: set size to 0 and resize in methods
    #_maxFlag = Number.MIN_SAFE_INTEGER;
    #_minFlag = Number.MAX_SAFE_INTEGER;
    #_trailingFlipped = false;

    // TODO: doc
    get flags(): Uint8Array {
        return this.#_flags;
    }

    // TODO: doc
    getHasProperty(flag: number): boolean {
        // TODO: doc

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const bytePos = Math.floor(flag / 8);

        if (bytePos > this.#_maxFlag) {
            return this.#_trailingFlipped; // usually false
        }

        const bitPos = flag - bytePos * 8;
        const mask = 1 << bitPos;
        const tmp = this.#_flags[bytePos] ?? 0;

        return (tmp & mask) > 0;

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    // TODO: doc
    setHasProperty(flag: number, value: boolean): void {
        // TODO: doc

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const bytePos = Math.floor(flag / 8);

        if (bytePos < this.#_minFlag) {
            if (value) {
                this.#_minFlag = bytePos;
            }
        }

        if (bytePos > this.#_maxFlag) {
            if (value) {
                this.#_maxFlag = bytePos;
                const newFlags = new Uint8Array(this.#_flags.length + bytePos + 1);
                newFlags.set(this.#_flags);
                this.#_flags = newFlags;
            } else {
                // bail early, we're setting a flag outside of our current _maxFlag to false, which is already the default
                return;
            }
        }

        // flag represents the position of the bit to be set.
        // Because we store the bit representation of flag in an array of byte
        // we want the bit position within the byte to be updated.
        // That's why we subtract bytePos * 8 bits from flag.
        const bitPosInByte = flag - bytePos * 8;
        const byteMask = 1 << bitPosInByte;
        let byteValue = this.#_flags[bytePos] ?? 0;

        if (value) {
            byteValue |= byteMask;
        } else {
            byteValue &= ~byteMask;
        }

        this.#_flags.set([byteValue], bytePos);

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    // TODO: doc
    clear(): void {
        // TODO: doc
        this.#_flags = new Uint8Array(0);
        this.#_maxFlag = Number.MIN_SAFE_INTEGER;
        this.#_minFlag = Number.MAX_SAFE_INTEGER;
        this.#_trailingFlipped = false;

        // WEBRTC TODO: Address further C++ code.
    }

    // TODO: doc
    decode(data: DataView, size: number, dataPosition: number): number {
        // TODO: doc

        this.clear();

        let bytesConsumed = 0;
        const bitCount = PropertyFlags.BITS_IN_BYTE * size;

        let encodedByteCount = 1; // there is at least 1 byte (after the leadBits)
        let leadBits = 1; // there is always at least 1 lead bit
        let inLeadBits = true;
        let bitAt = 0;
        let expectedBitCount = 0;
        let lastValueBit = 0;

        for (let byte = dataPosition; byte < size; byte++) {
            const originalByte = data.getUint8(byte);
            bytesConsumed += 1;
            let maskBit = 128; // LEFT MOST BIT set
            for (let bit = 0; bit < PropertyFlags.BITS_IN_BYTE; bit++) {
                const bitIsSet: boolean = (originalByte & maskBit) !== 0;

                // Processing of the lead bits
                if (inLeadBits) {
                    if (bitIsSet) {
                        encodedByteCount += 1;
                        leadBits += 1;
                    } else {
                        inLeadBits = false; // once we hit our first 0, we know we're out of the lead bits
                        expectedBitCount = encodedByteCount * PropertyFlags.BITS_IN_BYTE - leadBits;
                        lastValueBit = expectedBitCount + bitAt;

                        // check to see if the remainder of our buffer is sufficient
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
}

export default PropertyFlags;
