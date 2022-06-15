//
//  Vec3.ts
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { quat } from "./Quat";


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


    readonly #_EPSILON = 0.000001;


    get ZERO(): vec3 {
        return { x: 0, y: 0, z: 0 };
    }


    /*@sdkdoc
     *  Checks whether a value is a valid <code>vec3</code> value: an object with only x, y, z keys that have number values.
     *  @function Vec3.valid
     *  @param {any} value - The value to check.
     *  @returns {boolean} <code>true</code> if the value is a valid <code>vec3</code> value, <code>false</code> if it isn't.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valid(value: any): boolean {
        return value !== null
            && value !== undefined
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            && Object.keys(value).length === 3
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            && typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number";
    }

    /*@sdkdoc
     *  Calculates the length of a vector.
     *  @function Vec3.length
     *  @param {vec3} v - The vector.
     *  @returns {number} The length of the vector.
     */
    length(v: vec3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    /*@sdkdoc
     *  Makes a copy of a vector.
     *  @function Vec3.copy
     *  @param {vec3} v - The vector.
     *  @returns {vec3} A copy of the vector.
     */
    copy(v: vec3) {
        return { x: v.x, y: v.y, z: v.z };
    }

    /*@sdkdoc
     *  Multiplies a vector by a scale factor.
     *  @function Vec3.multiply
     *  @param {number} s - The scale factor.
     *  @param {vec3} v - The vector to scale.
     *  @returns {vec3} A new vector with each ordinate scaled by s.
     */
    multiply(s: number, v: vec3): vec3 {
        return { x: s * v.x, y: s * v.y, z: s * v.z };
    }

    /*@sdkdoc
     *  Sums two vectors together.
     *  @function Vec3.sum
     *  @param {vec3} v1 - The first vector.
     *  @param {vec3} v2 - The second vector.
     *  @returns {vec3} A new vector being the sum of the vectors.
     */
    sum(v1: vec3, v2: vec3): vec3 {
        return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
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

    /*@sdkdoc
     *  Calculates the distance between two points.
     *  @function Vec3.distance
     *  @param {vec3} p1 - The first point.
     *  @param {vec3} p2 - The second point.
     *  @returns {number} The distance between the two points.
     */
    distance(p1: vec3, p2: vec3): number {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2);
    }

    /*@sdkdoc
     *  Calculates the square of the distance between two points.
     *  @function Vec3.distance2
     *  @param {vec3} p1 - The first point.
     *  @param {vec3} p2 - The second point.
     *  @returns {number} The square of the distance between the two points.
     */
    distance2(p1: vec3, p2: vec3): number {
        return (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2;
    }

    /*@sdkdoc
     *  Calculates the minimum angle between two vectors.
     *  @function Vec3.angleBetween
     *  @param {vec3} v1 - The first vector.
     *  @param {vec3} v2 - The second vector.
     *  @returns {number} The minimum angle between the two vectors, in radians.
     */
    angleBetween(v1: vec3, v2: vec3): number {
        // C++  float GLMHelpers::angleBetween(const glm::vec3& v1, const glm::vec3& v2)

        const lengthFactor = Vec3.length(v1) * Vec3.length(v2);
        if (lengthFactor < this.#_EPSILON) {
            console.warn("Vec3.angleBetween(): Don't supply zero-length vectors as arguments.");
            return 0;
        }

        let cosAngle = Vec3.dot(v1, v2) / lengthFactor;
        // If v1 and v2 are colinear then floating point rounding errors might cause cosAngle to be slightly higher than 1 or
        // slightly lower than -1 which are undefined values for acos so we clamp the value to insure the value is in the
        // valid range.
        cosAngle = Math.min(Math.max(cosAngle, -1.0), 1.0);

        return Math.acos(cosAngle);
    }

    /*@sdkdoc
     *  Calculates the dot product of two vectors.
     *  @function Vec3.dot
     *  @param {vec3} v1 - The first vector.
     *  @param {vec3} v2 - The second vector.
     *  @returns {number} The dot product of the two vectors.
     */
    dot(v1: vec3, v2: vec3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    /*@sdkdoc
     *  Calculates the cross product of two vectors.
     *  @function Vec3.cross
     *  @param {vec3} v1 - The first vector.
     *  @param {vec3} v2 - The second vector.
     *  @returns {vec3} The cross product of the two vectors.
     */
    cross(v1: vec3, v2: vec3): vec3 {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    }

    /*@sdkdoc
     *  Rotates a vector.
     *  @function Vec3.multiplyQbyV
     *  @param {quat} q - The rotation to apply.
     *  @param {vec3} v - The vector to rotate.
     *  @returns {vec3} v rotated by q.
     */
    multiplyQbyV(q: quat, v: vec3): vec3 {
        const u = { x: q.x, y: q.y, z: q.z };
        const s = q.w;

        let result = this.multiply(2 * this.dot(u, v), u);
        result = this.sum(this.multiply(s * s - this.dot(u, u), v), result);
        result = this.sum(this.multiply(2 * s, this.cross(u, v)), result);

        return result;

        // https://gamedev.stackexchange.com/questions/28395/rotating-vector3-by-a-quaternion
        /*
        // Extract the vector part of the quaternion
        Vector3 u(q.x, q.y, q.z);

        // Extract the scalar part of the quaternion
        float s = q.w;

        // Do the math
        vprime = 2.0f * dot(u, v) * u
            + (s * s - dot(u, u)) * v
            + 2.0f * s * cross(u, v);
        */
    }

    /* eslint-enable class-methods-use-this */

}();

export default Vec3;
export type { vec3 };
