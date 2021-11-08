//
//  Vec3.ts
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


type vec3 = {
    x: number,
    y: number,
    z: number
};


/*@sdkdoc
 *  The <code>Vec3</code> namespace provides facilities for working with 3-dimensional vectors.
 *  @namespace Vec3
 *
 *  @property {vec3} ZERO - <code>{ x: 0, y: 0, z: 0 }</code> Vector with all axis values set to <code>0</code>.
 *      <em>Read-only.</em>
 */
const Vec3 = new class {

    /* eslint-disable class-methods-use-this */

    /*@sdkdoc
     *  A 3-dimensional vector value.
     *  @typedef {object} vec3
     *  @property {number} x - X-axis value.
     *  @property {number} y - Y-axis value.
     *  @property {number} z - Z-axis value.
     */


    get ZERO(): vec3 {
        return { x: 0, y: 0, z: 0 };
    }


    /*@sdkdoc
     *  Checks whether a value is a valid <code>vec3</code> value: is an object with only x, y, z keys that have number values.
     *  @param {any} value - The value to check.
     *  @returns {boolean} <code>true</code> if the value is a valid <code>vec3</code> value, <code>false</code> if it isn't.
     */
    isValid(value: any): boolean {
        return value !== null
            && value !== undefined
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            && Object.keys(value).length === 3
            && "x" in value && "y" in value && "z" in value
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            && typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number";
    }


    /*@sdkdoc
     *  Tests whether two vectors are equal.
     *  @function Vec3.equal
     *  @param {vec3} v1 - The first vector.
     *  @param {vec3} v2 - The second vector.
     *  @returns {boolean} <vode>true</code> if the two vectors are exactly equal, <code>false</code> if they aren't.
     */
    equal(v1: vec3, v2: vec3): boolean {
        return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
    }


    /* eslint-enable class-methods-use-this */

}();

export default Vec3;
export type { vec3 };
