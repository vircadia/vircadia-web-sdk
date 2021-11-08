//
//  Quat.ts
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type quat = {
    x: number,
    y: number,
    z: number,
    w: number
};


/*@sdkdoc
 *  The <code>Quat</code> namespace provides facilities for working with quaternions.
 *  @namespace Quat
 *
 *  @property {quat} IDENTITY - <code>{ x: 0, y: 0, z: 0, w: 1 }</code> The identity rotation, i.e., no rotation.
 *      <em>Read-only.</em>
 */
const Quat = new class {

    /* eslint-disable class-methods-use-this */

    /*@sdkdoc
     *  A quaternion value.
     *  @typedef {object} quat
     *  @property {number} x - X-axis rotation value.
     *  @property {number} y - Y-axis rotation value.
     *  @property {number} z - Z-axis rotation value.
     *  @property {number} w - Scalar value.
     */


    get IDENTITY(): quat {
        return { x: 0, y: 0, z: 0, w: 1 };
    }


    /*@sdkdoc
     *  Checks whether a value is a valid <code>quat</code> value: is an object with only x, y, z, and w keys that have number
     *  values.
     *  @param {any} value - The value to check.
     *  @returns {boolean} <code>true</code> if the value is a valid <code>quat</code> value, <code>false</code> if it isn't.
     */
    isValid(value: any): boolean {
        return value !== null
            && value !== undefined
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            && Object.keys(value).length === 4
            && "x" in value && "y" in value && "z" in value && "w" in value
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            && typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number"
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            && typeof value.w === "number";
    }


    /*@sdkdoc
     *  Tests whether two quaternions are equal.
     *  @function Quat.equal
     *  @param {quat} q1 - The first quaternion.
     *  @param {quat} q2 - The second quaternion.
     *  @returns {boolean} <vode>true</code> if the two quaternions are exactly equal, <code>false</code> if they aren't.
     */
    equal(q1: quat, q2: quat): boolean {
        return q1.x === q2.x && q1.y === q2.y && q1.z === q2.z && q1.w === q2.w;
    }


    /* eslint-enable class-methods-use-this */
}();

export default Quat;
export type { quat };
