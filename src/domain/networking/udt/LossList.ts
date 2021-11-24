//
//  LossList.ts
//
//  Created by David Rowe on 6 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SequenceNumber from "./SequenceNumber";
import assert from "../../shared/assert";

type Pair = { first: SequenceNumber, second: SequenceNumber };


/*@devdoc
 *  The <code>LossList</code> class manages a list {@link SequenceNumber}s of reliable packets that have been sent but that
 *  haven't had their receipt acknowledged.
 *  <p>C++: <code>LossList</code></p>
 *  @class LossList
 */
class LossList {
    // C++  class LossList

    static #makePair(first: SequenceNumber, second: SequenceNumber): Pair {
        return {
            first: first.copy(),
            second: second.copy()
        };
    }


    #_lossList: Pair[] = [];
    #_length = 0;


    /* eslint-disable newline-per-chained-call */
    /* eslint-disable @typescript-eslint/no-non-null-assertion */


    /*@devdoc
     *  Clears the LostList to empty.
     */
    clear(): void {
        //  void clear()
        this.#_length = 0;
        this.#_lossList = [];
    }

    /*@devdoc
     *  Gets the number of sequence numbers in the LostList.
     */
    getLength(): number {
        // C++  int getLength()
        return this.#_length;
    }

    /*@devdoc
     *  Gets whether the LossList is empty.
     *  @returns {boolean} <code>true</code> if the LossList is empty, <code>false</code> if it isn't.
     */
    isEmpty(): boolean {
        // C++  bool isEmpty()
        return this.#_length === 0;
    }

    /*@devdoc
     *  Appends a range of sequence numbers to the LossList.
     *  @param {SequenceNumber} start - The first sequence number in the range to append.
     *  @param {SequenceNumber} [end=start] - The final sequence number in the range to append.
     */
    append(param0: SequenceNumber, param1?: SequenceNumber): void {
        // C++  void append(SequenceNumber seq)
        // C++  void append(SequenceNumber start, SequenceNumber end)

        if (param1 === undefined) {
            const seq = param0;

            const back = this.#_lossList.length - 1;
            assert(this.#_lossList.length === 0 || this.#_lossList[back]!.second.isLessThan(seq),
                "LossList.append(SequenceNumber):",
                "SequenceNumber appended is not greater than the last SequenceNumber in the list.");

            if (this.#_length > 0 && this.#_lossList[back]!.second.copy().increment().isEqualTo(seq)) {
                this.#_lossList[back]?.second.increment();
            } else {
                this.#_lossList.push(LossList.#makePair(seq, seq));
            }
            this.#_length += 1;
        } else {
            const start = param0;
            const end = param1;

            const back = this.#_lossList.length - 1;
            assert(this.#_lossList.length === 0 || this.#_lossList[back]!.second.isLessThan(start),
                "LossList.append(SequenceNumber, SequenceNumber):",
                "SequenceNumber range appended is not greater than the last SequenceNumber in the list.");
            assert(start.isLessThanOrEqual(end),
                "LossList.append(SequenceNumber, SequenceNumber):", "Range start greater than range end.");

            if (this.#_length > 0 && this.#_lossList[back]!.second.copy().increment().isEqualTo(start)) {
                this.#_lossList[back]!.second = end;
            } else {
                this.#_lossList.push(LossList.#makePair(start, end));
            }
            this.#_length += SequenceNumber.seqlen(start, end);
        }
    }

    /*@devdoc
     *  Inserts a range of sequence numbers into the LossList.
     *  @param {SequenceNumber} start - The first sequence number in the range to insert.
     *  @param {SequenceNumber} end - The final sequence number in the range to insert.
     */
    insert(start: SequenceNumber, end: SequenceNumber): void {
        // C++  void LossList::insert(SequenceNumber start, SequenceNumber end)
        assert(start.isLessThanOrEqual(end),
            "LossList::insert(SequenceNumber, SequenceNumber):", "Range start greater than range end");

        let index = this.#_lossList.findIndex((pair) => {
            return !pair.second.isLessThan(start);
        });

        if (index === -1 || end.isLessThan(this.#_lossList[index]!.first)) {
            // No overlap, simply insert.
            this.#_length += SequenceNumber.seqlen(start, end);
            if (index === -1) {
                index = this.#_lossList.length;
            }
            this.#_lossList.splice(index, 0, LossList.#makePair(start, end));

        } else {
            // If it starts before segment, extend segment.
            const it = this.#_lossList[index]!;

            if (start.isLessThan(it.first)) {
                this.#_length += SequenceNumber.seqlen(start, it.first.copy().decrement());
                it.first = start;
            }

            // If it ends after segment, extend segment.
            if (end.isGreaterThan(it.second)) {
                this.#_length += SequenceNumber.seqlen(it.second.copy().increment(), end);
                it.second = end;
            }

            const index2 = index + 1;
            let it2 = this.#_lossList[index2];
            // For all ranges touching the current range.
            while (it2 && it.second.isGreaterThanOrEqual(it2.first.copy().decrement())) {
                if (it.second.isLessThan(it2.second)) {
                    this.#_length += SequenceNumber.seqlen(it.second.copy().increment(), it2.second);
                    it.second = it2.second;
                }

                // Remove overlapping range.
                this.#_length -= SequenceNumber.seqlen(it2.first, it2.second);
                this.#_lossList.splice(index2, 1);
                it2 = this.#_lossList[index2];
            }
        }
    }

    /*@devdoc
     *  Removes a sequence number from the LossList.
     *  @param {SequenceNumber} seq - The sequence number to remove.
     *  @returns {boolean} <code>true</code> if the sequence number was found, <code>false</code> if it wasn't.
     */
    remove(seq: SequenceNumber): boolean {
        // C++  bool LossList::remove(SequenceNumber seq)
        const index = this.#_lossList.findIndex((pair) => {
            return !pair.first.isLessThanOrEqual(seq) && seq.isLessThanOrEqual(pair.second);
        });

        if (index !== -1) {
            const it = this.#_lossList[index]!;
            if (it.first.isEqualTo(it.second)) {
                this.#_lossList.splice(index, 1);
            } else if (seq.isEqualTo(it.first)) {
                it.first.increment();
            } else if (seq.isEqualTo(it.second)) {
                it.second.decrement();
            } else {
                const temp = it.second.copy();
                it.second = seq.copy().decrement();
                this.#_lossList.splice(index + 1, 0, LossList.#makePair(seq.copy().increment(), temp));
            }
            this.#_length -= 1;

            // This sequence number was found in the loss list; return true.
            return true;
        }

        // This sequence number was not found in the loss list; return false.
        return false;
    }

    /*@devdoc
     *  Removes a range of sequence numbers from the LossList.
     *  @param {SequenceNumber} start - The first sequence number in the range to remove.
     *  @param {SequenceNumber} end - The final sequence number in the range to remove.
     */
    remove2(start: SequenceNumber, end: SequenceNumber): void {
        // C++  void LossList::remove(SequenceNumber start, SequenceNumber end)
        assert(start.isLessThanOrEqual(end),
            "LossList::remove(SequenceNumber, SequenceNumber)", "Range start greater than range end");

        // Find the first segment sharing sequence numbers
        let index = this.#_lossList.findIndex((pair) => {
            return pair.first.isLessThanOrEqual(start) && start.isLessThanOrEqual(pair.second)
                || start.isLessThanOrEqual(pair.first) && pair.first.isLessThanOrEqual(end);
        });

        // If we found one
        if (index !== -1) {
            let it = this.#_lossList[index];

            // While the end of the current segment is contained, either shorten it (first one only - sometimes) or remove it
            // altogether since it is fully contained it the range.
            while (it && end.isGreaterThanOrEqual(it.second)) {
                if (start.isLessThanOrEqual(it.first)) {
                    // Segment is contained, update new length and erase it.
                    this.#_length -= SequenceNumber.seqlen(it.first, it.second);
                    this.#_lossList.splice(index, 1);
                    it = this.#_lossList[index];
                } else {
                    // Beginning of segment not contained, modify end of segment.
                    // Will only occur sometimes on the first loop.
                    this.#_length -= SequenceNumber.seqlen(start, it.second);
                    it.second = start.copy().decrement();
                    index += 1;
                    it = this.#_lossList[index];
                }
            }

            // There might be more to remove.
            if (it && it.first.isLessThanOrEqual(end)) {
                if (start.isLessThanOrEqual(it.first)) {
                    // Truncate beginning of segment.
                    this.#_length -= SequenceNumber.seqlen(it.first, end);
                    it.first = end.copy().increment();
                } else {
                    // Cut it in half if the range we are removing is contained within one segment.
                    this.#_length -= SequenceNumber.seqlen(start, end);
                    const temp = it.second;
                    it.second = start.copy().decrement();
                    this.#_lossList.splice(index + 1, 0, LossList.#makePair(end.copy().increment(), temp));
                }
            }
        }
    }

    /*@devdoc
     *  Gets the first sequence number in the LossList.
     *  @returns {SequenceNumber} The first sequence number in the LossList.
     */
    getFirstSequenceNumber(): SequenceNumber {
        // C++  SequenceNumber getFirstSequenceNumber()
        assert(this.#_length > 0, "LossList::getFirstSequenceNumber()", "Trying to get first element of an empty list");
        return this.#_lossList[0]!.first;
    }

    /*@devdoc
     *  Pops the first sequence number off the LossList.
     *  @returns {SequenceNumber}  The first sequence number that was in the LossList.
     */
    popFirstSequenceNumber(): SequenceNumber {
        // C++  SequenceNumber LossList::popFirstSequenceNumber()
        const front = this.getFirstSequenceNumber();
        this.remove(front);
        return front;
    }


    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    /* eslint-enable newline-per-chained-call */
}

export default LossList;
