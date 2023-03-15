//
//  RingBuffer.ts
//
//  (ringbuf.js) Copyright 2022 Paul Adenot <paul@paul.cx>.
//  TypeScript conversion by Giga <giga@digisomni.com>.
//
//  Distributed under the Mozilla Public License, v. 2.0.
//  See http://mozilla.org/MPL/2.0/.
//

type TypedArrayConstructor<T> =
    (new (buffer: ArrayBufferLike, byteOffset: number, length: number) => T)
    & { BYTES_PER_ELEMENT: number };
const byteLength = 8;

/**
 * The base RingBuffer class.
 *
 * A Single Producer - Single Consumer thread-safe wait-free ring buffer.
 *
 * The producer and the consumer can be on separate threads, but cannot change roles,
 * except with external synchronization.
 */
export class RingBuffer<T extends NodeJS.TypedArray> {
    /**
     * Allocate the SharedArrayBuffer for a RingBuffer, based on the type and capacity required.
     * @param {number} capacity The number of elements the ring buffer will be able to hold.
     * @param {TypedArray} type A typed array constructor, the type that this ring buffer will hold.
     * @return {SharedArrayBuffer} A SharedArrayBuffer of the right size.
     * @static
     */
    static getStorageForCapacity(capacity: number, type: NodeJS.TypedArray): SharedArrayBuffer {
        if (!type.BYTES_PER_ELEMENT) {
            throw new TypeError("Pass in an ArrayBuffer subclass");
        }
        const bytes = byteLength + (capacity + 1) * type.BYTES_PER_ELEMENT;
        return new SharedArrayBuffer(bytes);
    }

    /**
     * Copy `size` elements from `input`, starting at offset `offset_input`, to
     * `output`, starting at offset `offset_output`.
     * @param {TypedArray} input The array to copy from.
     * @param {Number} inputOffset The index at which to start the copy.
     * @param {TypedArray} output The array to copy to.
     * @param {Number} outputOffset The index at which to start copying the elements to.
     * @param {Number} size The number of elements to copy.
     * @private
     */
    private static copy(
        input: NodeJS.TypedArray,
        inputOffset: number,
        output: NodeJS.TypedArray,
        outputOffset: number,
        size: number
    ): void {
        for (let i = 0; i < size; i++) {
            const inputValue = input[inputOffset + i];
            if (inputValue) {
                output[outputOffset + i] = inputValue;
            }
        }
    }

    /**
     * The type of ArrayBuffer that this ring buffer will hold.
     */
    private _type;
    /**
     * The size of the storage for elements not accounting the space for the index, counting the empty slot.
     */
    private _capacity;
    buf;
    writePointer;
    readPointer;
    storage;

    /**
     * @constructor
     * @param {SharedArrayBuffer} sab A SharedArrayBuffer obtained by calling {@link RingBuffer.getStorageFromCapacity}.
     * @param {TypedArray} Type A typed array constructor, the type that this ring buffer will hold.
     */
    constructor(sab: SharedArrayBuffer, Type: TypedArrayConstructor<T>) {
        if (Type.BYTES_PER_ELEMENT === undefined) {
            throw new TypeError("Pass a concrete typed array class as second argument");
        }

        // Maximum usable size is 1<<32 - type.BYTES_PER_ELEMENT bytes in the ring
        // buffer for this version, easily changeable.
        // -4 for the write ptr (uint32_t offsets).
        // -4 for the read ptr (uint32_t offsets).
        // Capacity counts the empty slot to distinguish between full and empty.
        this._type = Type;
        this._capacity = (sab.byteLength - byteLength) / Type.BYTES_PER_ELEMENT;
        this.buf = sab;
        const writeByteOffset = 0;
        this.writePointer = new Uint32Array(this.buf, writeByteOffset, 1);
        const readByteOffset = 4;
        this.readPointer = new Uint32Array(this.buf, readByteOffset, 1);
        const storageByteOffset = 8;
        this.storage = new Type(this.buf, storageByteOffset, this._capacity);
    }

    /**
     * @return The type of the underlying ArrayBuffer for this RingBuffer. This
     * allows implementing crude type checking.
     */
    type(): string {
        return this._type.name;
    }

    /**
     * Push elements to the ring buffer.
     * @param {TypedArray} elements A typed array of the same type as passed in the ctor, to be written to the queue.
     * @param {Number} length If passed, the maximum number of elements to push.
     * If not passed, all elements in the input array are pushed.
     * @param {Number} offset If passed, a starting index in elements from which
     * the elements are read. If not passed, elements are read from index 0.
     * @return The number of elements written to the queue.
     */
    push(elements: NodeJS.TypedArray, length?: number, offset = 0): number {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);

        if ((wr + 1) % this._capacity === rd) {
            // Full.
            return 0;
        }

        const len = length !== undefined ? length : elements.length;

        const toWrite = Math.min(this.availableWriteRaw(rd, wr), len);
        const firstPart = Math.min(this._capacity - wr, toWrite);
        const secondPart = toWrite - firstPart;

        RingBuffer.copy(elements, offset, this.storage, wr, firstPart);
        RingBuffer.copy(elements, offset + firstPart, this.storage, 0, secondPart);

        // Publish the enqueued data to the other side.
        Atomics.store(
            this.writePointer,
            0,
            (wr + toWrite) % this._capacity
        );

        return toWrite;
    }

    /**
     * Write bytes to the ring buffer using callbacks. This create wrapper
     * objects and can GC, so it's best to no use this variant from a real-time
     * thread such as an AudioWorklerProcessor `process` method.
     * The callback is passed two typed arrays of the same type, to be filled.
     * This allows skipping copies if the API that produces the data writes is
     * passed arrays to write to, such as `AudioData.copyTo`.
     * @param {number} amount The maximum number of elements to write to the ring
     * buffer. If amount is more than the number of slots available for writing,
     * then the number of slots available for writing will be made available: no
     * overwriting of elements can happen.
     * @param {Function} callback A callback with two parameters, that are two typed
     * array of the correct type, in which the data need to be copied. If the
     * callback doesn't return anything, it is assumed all the elements
     * have been written to. Otherwise, it is assumed that the returned number is
     * the number of elements that have been written to, and those elements have
     * been written started at the beginning of the requested buffer space.
     *
     * @return The number of elements written to the queue.
     */
    writeCallback(
        amount: number,
        callback: (firstArray: NodeJS.TypedArray, secondArray: NodeJS.TypedArray) => number | undefined
    ): number {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);

        if ((wr + 1) % this._capacity === rd) {
            // Full.
            return 0;
        }

        const toWrite = Math.min(this.availableWriteRaw(rd, wr), amount);
        const firstPart = Math.min(this._capacity - wr, toWrite);
        const secondPart = toWrite - firstPart;

        // This part will cause GC: don't use in the real time thread.
        const firstPartBuffer = new this._type(
            this.storage.buffer,
            byteLength + wr * this.storage.BYTES_PER_ELEMENT,
            firstPart
        );
        const secondPartBuffer = new this._type(
            this.storage.buffer,
            byteLength + 0,
            secondPart
        );

        const written = callback(firstPartBuffer, secondPartBuffer) || toWrite;

        // Publish the enqueued data to the other side.
        Atomics.store(this.writePointer, 0, (wr + written) % this._capacity);

        return written;
    }

    /**
     * Write bytes to the ring buffer using a callback.
     *
     * This allows skipping copies if the API that produces the data writes is
     * passed arrays to write to, such as `AudioData.copyTo`.
     *
     * @param {number} amount The maximum number of elements to write to the ring
     * buffer. If amount is more than the number of slots available for writing,
     * then the number of slots available for writing will be made available: no
     * overwriting of elements can happen.
     * @param {Function} callback A callback with five parameters:
     *
     * (1) The internal storage of the ring buffer as a typed array.
     * (2) An offset to start writing from.
     * (3) A number of elements to write at this offset.
     * (4) Another offset to start writing from.
     * (5) A number of elements to write at this second offset.
     *
     * If the callback doesn't return anything, it is assumed all the elements
     * have been written to. Otherwise, it is assumed that the returned number is
     * the number of elements that have been written to, and those elements have
     * been written started at the beginning of the requested buffer space.
     * @return The number of elements written to the queue.
     */
    writeCallbackWithOffset(
        amount: number,
        callback: (
            storage: NodeJS.TypedArray,
            firstOffset: number,
            firstElements: number,
            secondOffset: number,
            secondElements: number
        ) => number | undefined | void
    ): number {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);

        if ((wr + 1) % this._capacity === rd) {
            // Full.
            return 0;
        }

        const toWrite = Math.min(this.availableWriteRaw(rd, wr), amount);
        const firstPart = Math.min(this._capacity - wr, toWrite);
        const secondPart = toWrite - firstPart;

        const written = callback(this.storage, wr, firstPart, 0, secondPart) || toWrite;

        // Publish the enqueued data to the other side.
        Atomics.store(this.writePointer, 0, (wr + written) % this._capacity);

        return written;
    }

    /**
     * Read up to `elements.length` elements from the ring buffer. `elements` is a typed
     * array of the same type as passed in the ctor.
     * Returns the number of elements read from the queue, they are placed at the
     * beginning of the array passed as parameter.
     * @param {TypedArray} elements An array in which the elements read from the
     * queue will be written, starting at the beginning of the array.
     * @param {Number} length If passed, the maximum number of elements to pop. If
     * not passed, up to elements.length are popped.
     * @param {Number} offset If passed, an index in elements in which the data is
     * written to. `elements.length - offset` must be greater or equal to
     * `length`.
     * @return The number of elements read from the queue.
     */
    pop(elements: NodeJS.TypedArray, length: number, offset = 0): number {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);

        if (wr === rd) {
            return 0;
        }

        const len = length !== undefined ? length : elements.length;
        const toRead = Math.min(this.availableReadRaw(rd, wr), len);

        const firstPart = Math.min(this._capacity - rd, toRead);
        const secondPart = toRead - firstPart;

        RingBuffer.copy(this.storage, rd, elements, offset, firstPart);
        RingBuffer.copy(this.storage, 0, elements, offset + firstPart, secondPart);

        Atomics.store(this.readPointer, 0, (rd + toRead) % this._capacity);

        return toRead;
    }

    /**
     * @return `true` if the ring buffer is empty, `false` otherwise. This can be late
     * on the reader side: it can return true even if something has just been
     * pushed.
     */
    empty(): boolean {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);

        return wr === rd;
    }

    /**
     * @return `true` if the ring buffer is full, `false` otherwise. This can be late
     * on the write side: it can return true when something has just been popped.
     */
    full(): boolean {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);

        return (wr + 1) % this._capacity === rd;
    }

    /**
     * @return The usable capacity for the ring buffer: the number of elements
     * that can be stored.
     */
    capacity(): number {
        return this._capacity - 1;
    }

    /**
     * @return The number of elements available for reading. This can be late, and
     * report less elements that is actually in the queue, when something has just
     * been enqueued.
     */
    availableRead(): number {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);
        return this.availableReadRaw(rd, wr);
    }

    /**
     * Compatibility alias for availableRead().
     *
     * @return The number of elements available for reading. This can be late, and
     * report less elements that is actually in the queue, when something has just
     * been enqueued.
     *
     * @deprecated
     */
    // eslint-disable-next-line camelcase
    available_read(): number {
        return this.availableRead();
    }

    /**
     * @return The number of elements available for writing. This can be late, and
     * report less elements that is actually available for writing, when something
     * has just been dequeued.
     */
    availableWrite(): number {
        const rd = Atomics.load(this.readPointer, 0);
        const wr = Atomics.load(this.writePointer, 0);
        return this.availableWriteRaw(rd, wr);
    }

    /**
     * Compatibility alias for availableWrite.
     *
     * @return The number of elements available for writing. This can be late, and
     * report less elements that is actually available for writing, when something
     * has just been dequeued.
     *
     * @deprecated
     */
    // eslint-disable-next-line camelcase
    available_write(): number {
        return this.availableWrite();
    }

    /**
     * @return Number of elements available for reading, given a read and write
     * pointer.
     * @private
     */
    private availableReadRaw(rd: number, wr: number): number {
        return (wr + this._capacity - rd) % this._capacity;
    }

    /**
     * @return Number of elements available from writing, given a read and write
     * pointer.
     * @private
     */
    private availableWriteRaw(rd: number, wr: number): number {
        return this.capacity() - this.availableReadRaw(rd, wr);
    }
}
