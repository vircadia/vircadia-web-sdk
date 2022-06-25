//
//  BitVectorHelpers.ts
//
//  Created by David Rowe on 24 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "./assert";

/*@devdoc
 *  The <code>BitVectorHelpers</code> namespace provides helpers for working with writing / reading bit vectors.
 *  <p>C++: <code>BitVectorHelpers.h</code></p>
 *
 *  @namespace BitVectorHelpers
 */
const BitVectorHelpers = new class {
    // C++  GLMHelpers.h, .cpp

    /*@devdoc
     *  Calculates the number of bytes needed to store a number of bits.
     *  @function BitVectorHelpers.calcBitVectorSize
     *  @param {number} numBits - The number of bits.
     *  @returns {number} The number of bytes needed to store the bits.
     */
    calcBitVectorSize(numBits: number): number {  // eslint-disable-line class-methods-use-this
        // C++  int calcBitVectorSize(int numBits)
        return (numBits - 1 >> 3) + 1;  // eslint-disable-line @typescript-eslint/no-magic-numbers
    }

    /*@devdoc
     *  Writes bits to a packet per the evaluation of a function applied to each element of an array.
     *  @function BitVectorHelpers.writeBitVector
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {Array<any>} input - The input data.
     *  @param {BitVectorHelpers~Evaluate} f - The function to apply to each array element.
     *  @returns {number} The number of bytes written.
     */
    /*@devdoc
     *  A function that tests a value to determine whether to write a <code>1</code> bit or a <code>0<code> bit.
     *  @callback BitVectorHelpers~Evaluate
     *  @param {any} value - The value to evaluate.
     *  @returns {boolean} <code>true</code> to write a <code>1</code>, <code>false<code> to write a <code>0</code>.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writeBitVector(data: DataView, dataPosition: number, input: Array<any>, f: (value: any) => boolean): number {
        // C++  int writeBitVector(uint8_t* destinationBuffer, int numBits, const F& func)
        const totalBytes = this.calcBitVectorSize(input.length);
        let cursor = dataPosition;
        let byte = 0;
        let bit = 0;
        const BITS_IN_BYTE = 8;

        for (let i = 0, length = input.length; i < length; i++) {
            if (f(input[i])) {
                byte |= 1 << bit;
            }
            bit += 1;
            if (bit === BITS_IN_BYTE) {
                data.setUint8(cursor, byte);
                cursor += 1;
                byte = 0;
                bit = 0;
            }
        }
        // Write the last byte, if necessary.
        if (bit !== 0) {
            data.setUint8(cursor, byte);
            cursor += 1;
        }

        assert(cursor - dataPosition === totalBytes);
        return totalBytes;
    }


}();

export default BitVectorHelpers;
