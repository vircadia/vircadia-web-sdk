//
//  Uuid.ts
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// FIXME: There may be a better way to implement Uuid in TypeScript.
// eslint-disable-next-line
// @ts-nocheck


/*@devdoc
 *  The <code>Uuid</code> class provides a UUID (Universally Unique IDentifier) used to uniquely identify an item such as an
 *  entity or avatar. Internally, a {@link Uuid} value is a <code>bigint</code> value.
 *  <p>Note: In the user scripting API, UUIDs are represented as formatted strings.</p>
 *  <p>C++: UUID.h, <code>QUuid</code></p>
 *
 *  @class Uuid
 *  @variation 1
 *  @param {bigint} [value=0] - The UUID value. If not specified, a UUID with value of <code>Uuid.NULL</code> is created.
 *
 *  @property {number} NUM_BYTES_RFC4122_UUID=16 - The number of bytes in a UUID when represented in RFC4122 format.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 *  @property {Uuid} NULL=0 - The null UUID, <code>{00000000-0000-0000-0000-000000000000}</code>.
 *      <em>Read-only.</em>
 *      <p><em>Static</em></p>
 *      @static
 */
class Uuid extends BigInt {
    // C++  Uuid.h

    // WEBRTC TODO: It may be cleaner to wrap a BigInt value rather than extend BigInt.

    static NUM_BYTES_RFC4122_UUID = 16;  // eslint-disable-line @typescript-eslint/no-magic-numbers
    static NULL = BigInt(0);

    constructor(value: bigint = 0) {
        // C++  QUuid()

        // Work around BigInt not working with the "new" operator.
        const obj = <BigInt>Object(BigInt(value));
        Object.setPrototypeOf(obj, new.target.prototype);
        return obj;  // eslint-disable-line no-constructor-return
    }

    /*@devdoc
     *  UUIDs (Universally Unique IDentifiers) are used to uniquely identify items such as entities and avatars. They are
     *  represented as {@link Uuid(1)|Uuid} objects encapsulating BigInt values in the SDK, and 16-byte (128-bit) numbers in the
     *  protocol packets.
     *  <p>Note: In the user scripting API, UUIDs are represented as formatted hexadecimal strings.</p>
     *  @typedef {bigint} Uuid
     */
    /*@devdoc
     *  Gets the UUID's underlying <code>bigint</code> primitive value.
     *  @returns {bigint} The underlying <code>bigint</code> primitive value
     */
    value(): bigint {
        return this.valueOf().valueOf();
    }

    /*@devdoc
     *  Gets the UUID value formatted as a hexadecimal string with <code>-</code> separators.
     *  @function Uuid(1).stringify
     *  @returns {string} The UUID value eformatted as <code>nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn</code>.
     */
    stringify(): string {
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        const hexadecimal = this.value().toString(16);
        return hexadecimal.slice(0, 8) + "-" + hexadecimal.slice(8, 12) + "-" + hexadecimal.slice(12, 16) + "-"
            + hexadecimal.slice(16, 20) + "-" + hexadecimal.slice(20);
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

}

export default Uuid;
