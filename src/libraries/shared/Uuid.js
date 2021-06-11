//
//  Uuid.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  UUIDs (Universally Unique IDentifiers) are used to uniquely identify entities, avatars, and the like. They are represented
 *  internally in the SDK as BigInt values.
 *  <p>Note: In the user scripting API, UUIDs are represented as formatted strings.</p>
 *  @typedef {BigInt} UUID
 */

/*@devdoc
 *  The <code>Uuid</code> API provides facilities for working with UUIDs.
 *  <p>Note: In the user scripting API, UUIDs are represented as formatted strings.</p>
 *  <p>C++: UUID.h, <code>QUuid/code></p>
 *
 *  @class Uuid
 *  @param {BigInt} value=0 - The UUID value. If not specified, a UUID with value of <code>Uuid.NULL</code> is created.
 *
 *  @property {number} NUM_BYTES_RFC4122_UUID=16 - The number of bytes in a UUID when represented in RFC4122 format.
 *  @property {UUID} NULL=0 - The null UUID, <code>{00000000-0000-0000-0000-000000000000}</code>.
 */
class Uuid extends BigInt {

    static NUM_BYTES_RFC4122_UUID = 16;  // eslint-disable-line no-magic-numbers
    static NULL = BigInt(0);

    constructor(value = 0) {
        // C++  QUuid()
        // Work around BigInt not working with the "new" operator.
        const obj = Object(BigInt(value));
        Object.setPrototypeOf(obj, new.target.prototype);
        return obj;  // eslint-disable-line no-constructor-return
    }

}

export default Uuid;
