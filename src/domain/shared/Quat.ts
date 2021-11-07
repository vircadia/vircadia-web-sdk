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

    /*@sdkdoc
     *  A quaternion value.
     *  @typedef {object} quat
     *  @property {number} x - X-axis rotation value.
     *  @property {number} y - Y-axis rotation value.
     *  @property {number} z - Z-axis rotation value.
     *  @property {number} w - Scalar value.
     */


    get IDENTITY(): quat {  // eslint-disable-line class-methods-use-this
        return { x: 0, y: 0, z: 0, w: 1 };
    }


    /*@sdkdoc
     *  Tests whether two quaternions are equal.
     *  @function Quat.equal
     *  @param {quat} q1 - The first quaternion.
     *  @param {quat} q2 - The second quaternion.
     *  @returns {boolean} <vode>true</code> if the two quaternions are exactly equal, <code>false</code> if they aren't.
     */
    equal(q1: quat, q2: quat): boolean {  // eslint-disable-line class-methods-use-this
        return q1.x === q2.x && q1.y === q2.y && q1.z === q2.z && q1.w === q2.w;
    }

}();

export default Quat;
export type { quat };
