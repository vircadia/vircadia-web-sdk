//
//  SequenceNumber.ts
//
//  Created by David Rowe on 6 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

type SequenceNumberValue = number;

/*@devdoc
 *  The <code>SequenceNumber</code> class handles packet sequence numbers. These are 27-bit integer values that wrap around at
 *  binary <code>111...1</code> to continue counting starting at <code>0</code>. Magnitude comparisons between a pair of
 *  sequence numbers is conducted in the "forwards" direction around the loop.
 *  <p>C++: <code>SequenceNumber</code></p>
 *
 *  @class SequenceNumber
 *  @param {number} [value=0] - The numeric value of the sequence number.
 *
 *  @property {number} MAX=0x07FFFFFF - The maximum possible sequence number value.
 *      <p><em>Static. Read-only.</em></p>
 *  @property {number} value - The numeric value of the sequence number object.
 */
class SequenceNumber {
    // C++  class SequenceNumber

    /*@devdoc
     *  The distance from a first sequence number to a second, in the forward direction around the loop.
     *  <p><em>Static.</em></p>
     *  @function SequenceNumber.seqlen
     *  @static
     *  @param {SequenceNumber} seq1 - The first sequence number.
     *  @param {SequenceNumber} seq2 - The second sequence number.
     *  @returns {number} The distance from the first sequence number to the second.
     */
    static seqlen(seq1: SequenceNumber, seq2: SequenceNumber): number {
        // C++  int seqlen(const SequenceNumber& seq1, const SequenceNumber& seq2)
        return seq1.#_value <= seq2.#_value
            ? seq2.#_value - seq1.#_value + 1
            : seq2.#_value - seq1.#_value + SequenceNumber.MAX + 2;
    }

    /*@devdoc
     *  Creates a new <code>SequenceNumber</code> object.
     *  <p><em>Static.</em></p>
     *  @function SequenceNumber.new
     *  @static
     *  @param {number} value - The sequence number value.
     *  @returns {SequenceNumber} A new <code>SequenceNumber</code> object.
     */
    static new(value: SequenceNumberValue): SequenceNumber {
        // C++  N/A
        return new SequenceNumber(value);
    }

    static readonly MAX = 0x07FFFFFF;  // 27-bit sequence number.


    static readonly #THRESHOLD = 0x03FFFFFF; // Threshold for comparing sequence number values.

    #_value = 0;


    constructor(value = 0) {
        this.#_value = value;
    }


    get value(): number {
        // C++  SeqenceNumber type conversion.
        return this.#_value;
    }

    set value(value: number) {
        // C++  SeqenceNumber "=" operator.
        this.#_value = Math.max(0, Math.min(value, SequenceNumber.MAX));
    }


    /*@devdoc
     *  Increments the sequence number's value by <code>1</code>, wrapping around the loop if need be.
     *  @function SequenceNumber.increment
     *  @returns {SequenceNumber} The sequence number object with its value incremented.
     */
    increment(): SequenceNumber {
        // C++  SeqenceNumber "+= 1" operator.
        this.#_value = (this.#_value + 1) % (SequenceNumber.MAX + 1);
        return this;  // For chaining.
    }

    /*@devdoc
     *  Decrements a sequence number's value by <code>1</code>, wrapping around the loop if need be.
     *  @function SequenceNumber.decrement
     *  @returns {SequenceNumber} The sequence number object with its value decremented.
     */
    decrement(): SequenceNumber {
        // C++  SeqenceNumber "-= 1" operator.
        this.#_value = this.#_value === 0 ? SequenceNumber.MAX : this.#_value - 1;
        return this;  // For chaining.
    }

    /*@devdoc
     *  Creates a copy of a sequence number.
     *  @function SequenceNumber.copy
     *  @returns {SequenceNumber} A new <code>SequenceNumber</code> object with the same numeric value.
     */
    copy(): SequenceNumber {
        // C++  SeqenceNumber "=" operator.
        return new SequenceNumber(this.#_value);
    }

    /*@devdoc
     *  Tests whether the sequence number's value equals that of another's.
     *  @function SequenceNumber.isEqualTo
     *  @param {SequenceNumber} other - The other sequence number.
     *  @returns {SequenceNumber} <code>true</code> if the sequence number's value is equal to that of the other's.
     */
    isEqualTo(other: SequenceNumber): boolean {
        // C++  SeqenceNumber "==" operator.
        return this.#_value === other.value;
    }

    /*@devdoc
     *  Tests whether the sequence number's value does not equal that of another's.
     *  @function SequenceNumber.isNotEqualTo
     *  @param {SequenceNumber} other - The other sequence number.
     *  @returns {SequenceNumber} <code>true</code> if the sequence number's value is not equal to that of the other's.
     */
    isNotEqualTo(other: SequenceNumber): boolean {
        // C++  SeqenceNumber "==" operator.
        return this.#_value !== other.value;
    }

    /*@devdoc
     *  Tests whether the sequence number's value is less than that of another's, wrapping around the loop if need be.
     *  @function SequenceNumber.isLessThan
     *  @param {SequenceNumber} other - The other sequence number.
     *  @returns {SequenceNumber} <code>true</code> if the sequence number's value is less than that of the other's.
     */
    isLessThan(other: SequenceNumber): boolean {
        // C++  SeqenceNumber "<" operator.
        const a = this.#_value;
        const b = other.value;
        return Math.abs(a - b) < SequenceNumber.#THRESHOLD ? a < b : b < a;
    }

    /*@devdoc
     *  Tests whether the sequence number's value is less than or equal to that of another's, wrapping around the loop if need
     *  be.
     *  @function SequenceNumber.isLessThanOrEqual
     *  @param {SequenceNumber} other - The other sequence number.
     *  @returns {SequenceNumber} <code>true</code> if the sequence number's value is less than or equal to that of the other's.
     */
    isLessThanOrEqual(other: SequenceNumber): boolean {
        // C++  SeqenceNumber "<=" operator.
        const a = this.#_value;
        const b = other.value;
        return Math.abs(a - b) < SequenceNumber.#THRESHOLD ? a <= b : b <= a;
    }

    /*@devdoc
     *  Tests whether the sequence number's value is greater than that of another's, wrapping around the loop if need be.
     *  @function SequenceNumber.isGreaterThan
     *  @param {SequenceNumber} other - The other sequence number.
     *  @returns {SequenceNumber} <code>true</code> if the sequence number's value is greater than that of the other's.
     */
    isGreaterThan(other: SequenceNumber): boolean {
        // C++  SeqenceNumber ">" operator.
        const a = this.#_value;
        const b = other.value;
        return Math.abs(a - b) < SequenceNumber.#THRESHOLD ? a > b : b > a;
    }

    /*@devdoc
     *  Tests whether the sequence number's value is greater than or equal to that of another's, wrapping around the loop if
     *  need be.
     *  @function SequenceNumber.isGreaterThanOrEqual
     *  @param {SequenceNumber} other - The other sequence number.
     *  @returns {SequenceNumber} <code>true</code> if the sequence number's value is greater than or equal to that of the
     *      other's.
     */
    isGreaterThanOrEqual(other: SequenceNumber): boolean {
        // C++  SeqenceNumber ">=" operator.
        const a = this.#_value;
        const b = other.value;
        return Math.abs(a - b) < SequenceNumber.#THRESHOLD ? a >= b : b >= a;
    }

}

export default SequenceNumber;
export type { SequenceNumberValue };
