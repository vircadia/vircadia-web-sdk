//
//  Uuid.ts
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// FIXME: There may be a better way to implement Uuid in TypeScript.
// eslint-disable-next-line
// @ts-nocheck


/*@sdkdoc
 *  The <code>Uuid</code> class provides a UUID (Universally Unique IDentifier) used to uniquely identify an item such as an
 *  entity or avatar. Internally, a {@link Uuid} value is a <code>bigint</code> value.
 *  <p>Note: In the user scripting API, UUIDs are represented as formatted strings.</p>
 *  <p>C++: UUID.h, <code>QUuid</code></p>
 *
 *  @class Uuid
 *  @variation 1
 *  @param {bigint|string} [value=0] - The UUID value. If not specified, a UUID with value of <code>Uuid.NULL</code> is created.
 *
 *  @property {number} NUM_BYTES_RFC4122_UUID=16 - The number of bytes in a UUID when represented in RFC4122 format.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {Uuid} NULL=0 - The null UUID, <code>00000000-0000-0000-0000-000000000000</code>.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {Uuid} AVATAR_SELF_ID=1 - The null UUID, <code>00000000-0000-0000-0000-000000000001</code>.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 */
class Uuid extends BigInt {
    // C++  Uuid.h

    // WEBRTC TODO: It may be cleaner to wrap a BigInt value rather than extend BigInt.

    static readonly NUM_BYTES_RFC4122_UUID = 16;
    static readonly NULL = BigInt(0);
    static readonly AVATAR_SELF_ID = BigInt(1);


    /*@sdkdoc
     *  Creates a new UUID.
     *  <p><em>Static</em></p>
     *  @function Uuid(1).createUuid
     *  @static
     *  @returns {Uuid} A new UUID.
     */
    static createUuid(): Uuid {
        const uuid = crypto.randomUUID() as string;  // eslint-disable-line @typescript-eslint/no-unsafe-call
        const chars = uuid.replaceAll("-", "");
        let value = 0n;
        for (let i = 0, length = chars.length; i < length; i += 2) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            value = value * 256n + BigInt(parseInt(chars.slice(i, i + 2), 16));
        }
        return new Uuid(value);
    }


    constructor(value: bigint | string = Uuid.NULL) {
        // C++  QUuid()

        let bigintValue = value;
        if (typeof bigintValue === "string") {
            bigintValue = "0x" + bigintValue.replaceAll("-", "");
        }

        // Work around BigInt not working with the "new" operator.
        const obj = <BigInt>Object(BigInt(bigintValue));
        Object.setPrototypeOf(obj, new.target.prototype);
        return obj;  // eslint-disable-line no-constructor-return
    }


    /*@sdkdoc
     *  UUIDs (Universally Unique IDentifiers) are used to uniquely identify items such as entities and avatars. They are
     *  represented as {@link Uuid(1)|Uuid} objects encapsulating BigInt values in the SDK, and 16-byte (128-bit) numbers in the
     *  protocol packets.
     *  <p>Note: In the user scripting API, UUIDs are represented as formatted hexadecimal strings.</p>
     *  @typedef {bigint} Uuid
     */
    /*@sdkdoc
     *  Gets the UUID's underlying <code>bigint</code> primitive value.
     *  @function Uuid(1).value
     *  @returns {bigint} The underlying <code>bigint</code> primitive value
     */
    value(): bigint {
        return this.valueOf().valueOf();
    }

    /*@sdkdoc
     *  Gets whether the UUID value is null.
     *  @function Uuid(1).isNull
     *  @returns {boolean} <code>true</code> if the UUID values is <code>Uuid.NULL</code>, <code>false</code> if it isn't.
     */
    isNull(): boolean {
        return this.value() === Uuid.NULL;
    }

    /*@sdkdoc
     *  Gets the UUID value formatted as a hexadecimal string with <code>-</code> separators but without curly braces.
     *  @function Uuid(1).stringify
     *  @returns {string} The UUID value formatted as <code>nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn</code>.
     */
    stringify(): string {
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        const hexadecimal = this.value()
            .toString(16)
            .padStart(32, "0");
        return hexadecimal.slice(0, 8) + "-" + hexadecimal.slice(8, 12) + "-" + hexadecimal.slice(12, 16) + "-"
            + hexadecimal.slice(16, 20) + "-" + hexadecimal.slice(20);
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default Uuid;
