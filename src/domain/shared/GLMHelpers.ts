//
//  GLMHelpers.ts
//
//  Created by David Rowe on 7 Dec 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import assert from "./assert";
import { quat } from "./Quat";
import { vec3 } from "./Vec3";


/*@devdoc
 *  The <code>GLMHelpers</code> namespace provides helpers for working with OpenGL Mathematics (GLM) items.
 *  <p>C++: <code>GLMHelpers.h</code></p>
 *
 *  @namespace GLMHelpers
 *
 *  @property {vec3} IDENTITY_FORWARD=0,0,-1 - Unit vector pointing in the camera forward direction.
 */
const GLMHelpers = new class {
    // C++  GLMHelpers.h, .cpp

    readonly IDENTITY_FORWARD: vec3 = { x: 0.0, y: 0.0, z: -1.0 };

    readonly #_SMALL_LIMIT = 10.0;
    readonly #_LARGE_LIMIT = 1000.0;
    readonly #_UINT16_MAX = 65535.0;
    readonly #_INT16_MAX = 32767.0;
    readonly #_INT16_MIN = -32768.0;


    /*@devdoc
     *  Reads a quaternion value from a packet, unpacking it from 8 bytes.
     *  @function GLMHelpers.unpackOrientationQuatFromBytes
     *  @param {DataView} data - The packet data to read.
     *  @param {number} dataPosition - The data position to read the value from.
     *  @returns {quat} The quaternion value.
     */
    // eslint-disable-next-line class-methods-use-this
    unpackOrientationQuatFromBytes(data: DataView, dataPosition: number): quat {
        // C++  int unpackOrientationQuatFromBytes(const unsigned char* buffer, glm::quat& quatOutput)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        return {
            x: data.getUint16(dataPosition, UDT.LITTLE_ENDIAN) / this.#_UINT16_MAX * 2 - 1,
            y: data.getUint16(dataPosition + 2, UDT.LITTLE_ENDIAN) / this.#_UINT16_MAX * 2 - 1,
            z: data.getUint16(dataPosition + 4, UDT.LITTLE_ENDIAN) / this.#_UINT16_MAX * 2 - 1,
            w: data.getUint16(dataPosition + 6, UDT.LITTLE_ENDIAN) / this.#_UINT16_MAX * 2 - 1
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Writes a quaternion value to a packet, packing it into 6 bytes.
     *  @function GLMHelpers.packOrientationQuatToSixBytes
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {quat} quatInput - The quaternion value to write.
     */
    // eslint-disable-next-line class-methods-use-this
    packOrientationQuatToSixBytes(data: DataView, dataPosition: number, quatInput: quat): void {
        // C++  int packOrientationQuatToSixBytes(unsigned char* buffer, const glm::quat& quatInput)

        /* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-non-null-assertion */

        let fields = [quatInput.x, quatInput.y, quatInput.z, quatInput.w];

        // Find largest field.
        let largestField = 0;
        for (let i = 1; i < 4; i++) {
            if (Math.abs(fields[i]!) > Math.abs(fields[largestField]!)) {
                largestField = i;
            }
        }

        // Ensure that the sign of the dropped component is always negative.
        if (fields[largestField]! > 0) {
            fields = [-quatInput.x, -quatInput.y, -quatInput.z, -quatInput.w];
        }

        const MAGNITUDE = 1.0 / Math.sqrt(2.0);
        const DOUBLE_MAGNITUDE = 2.0 * MAGNITUDE;
        const NUM_BITS_PER_COMPONENT = 15;
        const RANGE = (1 << NUM_BITS_PER_COMPONENT) - 1;

        // Quantize the smallest three components into integers.
        const components = [0, 0, 0];
        for (let i = 0, j = 0; i < 4; i++) {
            if (i !== largestField) {
                // Transform component into 0..1 range.
                const value = (fields[i]! + MAGNITUDE) / DOUBLE_MAGNITUDE;

                // Quantize 0..1 into 0..range.
                components[j] = Math.floor(value * RANGE);
                j += 1;
            }
        }

        // Encode the largestComponent into the high bits of the first two components.
        components[0] = 0x7fff & components[0]! | (0x01 & largestField) << 15;
        components[1] = 0x7fff & components[1]! | (0x02 & largestField) << 14;

        data.setUint16(dataPosition, components[0], UDT.BIG_ENDIAN);
        data.setUint16(dataPosition + 2, components[1], UDT.BIG_ENDIAN);
        data.setUint16(dataPosition + 4, components[2]!, UDT.BIG_ENDIAN);

        /* eslint-enable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-non-null-assertion */
    }

    /*@devdoc
     *  Reads a quaternion value from a packet, unpacking it from 6 bytes.
     *  @function GLMHelpers.unpackOrientationQuatFromSixBytes
     *  @param {DataView} data - The packet data to read.
     *  @param {number} dataPosition - The data position to read the value from.
     *  @returns {quat} The quaternion value.
     */
    // eslint-disable-next-line class-methods-use-this
    unpackOrientationQuatFromSixBytes(data: DataView, dataPosition: number): quat {
        // C++  int unpackOrientationQuatFromSixBytes(const unsigned char* buffer, glm::quat& quatOutput)

        /* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-non-null-assertion */

        const components = [
            data.getUint16(dataPosition, UDT.BIG_ENDIAN),
            data.getUint16(dataPosition + 2, UDT.BIG_ENDIAN),
            data.getUint16(dataPosition + 4, UDT.BIG_ENDIAN)
        ];

        // Largest component is encoded into the highest bits of the first 2 components.
        const largestComponent = (0x8000 & components[1]!) >> 14 | (0x8000 & components[0]!) >> 15;
        components[0] &= 0x7fff;
        components[1] &= 0x7fff;

        const NUM_BITS_PER_COMPONENT = 15;
        const RANGE = (1 << NUM_BITS_PER_COMPONENT) - 1;
        const MAGNITUDE = 1.0 / Math.sqrt(2.0);
        const DOUBLE_MAGNITUDE = 2.0 * MAGNITUDE;
        const floatComponents = [];
        for (let i = 0; i < 3; i++) {
            floatComponents[i] = components[i]! / RANGE * DOUBLE_MAGNITUDE - MAGNITUDE;
        }

        // Missing component is always negative.
        const missingComponent
            = -Math.sqrt(1.0 - floatComponents[0]! ** 2 - floatComponents[1]! ** 2 - floatComponents[2]! ** 2);

        const output = [];
        for (let i = 0, j = 0; i < 4; i++) {
            if (i !== largestComponent) {
                output[i] = floatComponents[j];
                j += 1;
            } else {
                output[i] = missingComponent;
            }
        }

        return {
            x: output[0]!,
            y: output[1]!,
            z: output[2]!,
            w: output[3]!
        };

        /* eslint-enable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-non-null-assertion */
    }

    /*@devdoc
     *  Writes a degree value to a packet, packing it into 2 bytes.
     *  @function GLMHelpers.packFloatAngleToTwoByte
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {number} degrees - The degree value to write.
     */
    // eslint-disable-next-line class-methods-use-this
    packFloatAngleToTwoByte(data: DataView, dataPosition: number, degrees: number): void {
        // C++  int packFloatAngleToTwoByte(unsigned char* buffer, float degrees)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const ANGLE_CONVERSION_RATIO = this.#_UINT16_MAX / 360;
        const twoByteAngle = Math.floor((degrees + 180) * ANGLE_CONVERSION_RATIO);

        data.setUint16(dataPosition, twoByteAngle, UDT.LITTLE_ENDIAN);

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Writes a clipping distance value to a packet, packing it into 2 bytes.
     *  @function GLMHelpers.packClipValueToTwoByte
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {number} clipValue - The clipping distance value to write.
     */
    // eslint-disable-next-line class-methods-use-this
    packClipValueToTwoByte(data: DataView, dataPosition: number, clipValue: number): void {
        // C++ int packClipValueToTwoByte(unsigned char* buffer, float clipValue) {

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        assert(clipValue < this.#_INT16_MAX, "ERROR: Clip values must be less than max signed 16 bit integers");

        // eslint-disable-next-line @typescript-eslint/init-declarations
        let holder: number;

        if (clipValue < this.#_SMALL_LIMIT) {
            const SMALL_RATIO_CONVERSION_RATIO = this.#_INT16_MAX / this.#_SMALL_LIMIT;
            holder = Math.floor(clipValue * SMALL_RATIO_CONVERSION_RATIO);
        } else {
            holder = -1 * Math.floor(clipValue);
        }

        data.setInt16(dataPosition, holder, UDT.LITTLE_ENDIAN);

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Writes a ratio number to a packet, packing it into 2 bytes.
     *  Ratios need to be accurate when less than 10, but not very accurate above 10, and they are never greater than 1000 to 1.
     *  This allows us to encode one in 16 bits.
     *  @function GLMHelpers.packFloatRatioToTwoByte
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {number} ratio - The ratio value to write.
     */
    packFloatRatioToTwoByte(data: DataView, dataPosition: number, ratio: number): void {
        //  C++ int packFloatRatioToTwoByte(unsigned char* buffer, float ratio)
        let ratioHolder = 0;
        if (ratio < this.#_SMALL_LIMIT) {
            const SMALL_RATIO_CONVERSION_RATIO = this.#_INT16_MAX / this.#_SMALL_LIMIT;
            ratioHolder = Math.floor(ratio * SMALL_RATIO_CONVERSION_RATIO);
        } else {
            const LARGE_RATIO_CONVERSION_RATIO = this.#_INT16_MIN / this.#_LARGE_LIMIT;
            ratioHolder = Math.floor((Math.min(ratio, this.#_LARGE_LIMIT) - this.#_SMALL_LIMIT) * LARGE_RATIO_CONVERSION_RATIO);
        }
        data.setInt16(dataPosition, ratioHolder, UDT.LITTLE_ENDIAN);
    }

    /*@devdoc
     *  Reads a ratio number from a packet, where it is packed into 2 bytes.
     *  Ratios need to be accurate when less than 10, but not very accurate above 10, and they are never greater than 1000 to 1.
     *  This allows us to encode one in 16 bits.
     *  @function GLMHelpers.unpackFloatRatioFromTwoByte
     *  @param {DataView} data - The packet data to read.
     *  @param {number} dataPosition - The data position to read the value from.
     *  @returns {number} The ratio number value read.
     */
    // eslint-disable-next-line class-methods-use-this
    unpackFloatRatioFromTwoByte(data: DataView, dataPosition: number): number {
        // C++  int unpackFloatRatioFromTwoByte(const unsigned char* buffer, float& ratio) {
        const ratioHolder = data.getInt16(dataPosition, UDT.LITTLE_ENDIAN);
        let ratio = 0;
        if (ratioHolder > 0) {
            ratio = ratioHolder / this.#_INT16_MAX * this.#_SMALL_LIMIT;
        } else {
            ratio = ratioHolder / this.#_INT16_MIN * this.#_LARGE_LIMIT + this.#_SMALL_LIMIT;
        }
        return ratio;
    }

    /*@devdoc
     *  Writes a fixed-point number to a packet, packing it into 2 bytes.
     *  A radix value of 1 makes a 15.1 bit number, radix 8 makes an 8.8 bit number, etc.
     *  @function GLMHelpers.packFloatScalarToSignedTwoByteFixed
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {number} scalar - The numeric value to write.
     *  @param {number} radix - The number of binary digits after the binary point.
     */
    packFloatScalarToSignedTwoByteFixed(data: DataView, dataPosition: number, scalar: number, radix: number): void {
        // C++  int packFloatScalarToSignedTwoByteFixed(unsigned char* buffer, float scalar, int radix)
        const twoByteFixed = Math.min(Math.max(scalar * (1 << radix), this.#_INT16_MIN), this.#_INT16_MAX);
        data.setInt16(dataPosition, twoByteFixed, UDT.LITTLE_ENDIAN);
    }

    /*@devdoc
     *  Reads a fixed-point number from a packet, where it is packed into 2 bytes.
     *  A radix value of 1 makes a 15.1 bit number, radix 8 makes an 8.8 bit number, etc.
     *  @function GLMHelpers.unpackFloatScalarFromSignedTwoByteFixed
     *  @param {DataView} data - The packet data to read.
     *  @param {number} dataPosition - The data position to read the value from.
     *  @param {number} radix - The number of binary digits after the binary point.
     *  @returns {number} The fixed-point number value read.
     */
    // eslint-disable-next-line class-methods-use-this
    unpackFloatScalarFromSignedTwoByteFixed(data: DataView, dataPosition: number, radix: number): number {
        // C++  int unpackFloatScalarFromSignedTwoByteFixed(const int16_t* byteFixedPointer, float* destinationPointer,
        //          int radix)
        const twoByteFixed = data.getInt16(dataPosition, UDT.LITTLE_ENDIAN);
        return twoByteFixed / (1 << radix);
    }

    /*@devdoc
     *  Writes a fixed-point vector to a packet, packing it into 6 bytes.
     *  A radix value of 1 makes a 15.1 bit number, radix 8 makes an 8.8 bit number, etc.
     *  @function GLMHelpers.packFloatVec3ToSignedTwoByteFixed
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {vec3} vector - The vector value to write.
     *  @param {number} radix - The number of binary digits after the binary point.
     */
    // A convenience for sending vec3's as fixed-point floats
    packFloatVec3ToSignedTwoByteFixed(data: DataView, dataPosition: number, vector: vec3, radix: number): void {
        // C++  int packFloatVec3ToSignedTwoByteFixed(unsigned char* destBuffer, const glm::vec3& srcVector, int radix)
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        this.packFloatScalarToSignedTwoByteFixed(data, dataPosition, vector.x, radix);
        this.packFloatScalarToSignedTwoByteFixed(data, dataPosition + 2, vector.y, radix);
        this.packFloatScalarToSignedTwoByteFixed(data, dataPosition + 4, vector.z, radix);
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Reads a fixed-point vector from a packet, where it is packed into 6 bytes.
     *  A radix value of 1 makes a 15.1 bit number, radix 8 makes an 8.8 bit number, etc.
     *  @function GLMHelpers.unpackFloatVec3FromSignedTwoByteFixed
     *  @param {DataView} data - The packet data to read.
     *  @param {number} dataPosition - The data position to read the value from.
     *  @param {number} radix - The number of binary digits after each ordinate value's binary point.
     *  @returns {vec3} The vector value read.
     */
    unpackFloatVec3FromSignedTwoByteFixed(data: DataView, dataPosition: number, radix: number): vec3 {
        // C++  int unpackFloatVec3FromSignedTwoByteFixed(const unsigned char* sourceBuffer, glm::vec3& destination, int radix)
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        const x = this.unpackFloatScalarFromSignedTwoByteFixed(data, dataPosition, radix);
        const y = this.unpackFloatScalarFromSignedTwoByteFixed(data, dataPosition + 2, radix);
        const z = this.unpackFloatScalarFromSignedTwoByteFixed(data, dataPosition + 4, radix);
        /* eslint-enable @typescript-eslint/no-magic-numbers */
        return { x, y, z };
    }

    /*@devdoc
     *  Checks whether two numbers have very similar values.
     *  @function GLMHelpers.closeEnough
     *  @param {number} a - The first number.
     *  @param {number} b - The second number.
     *  @param {number} relativeError - The acceptable maximum relative error, range <code>0.0 &ndash; 1.0</code>.
     *  @returns {boolean} <code>true</code> if the absolute difference divided by the absolute average is less than the
     *      relative error.
     */
    // eslint-disable-next-line class-methods-use-this
    closeEnough(a: number, b: number, relativeError: number): boolean {
        // C++  bool closeEnough(float a, float b, float relativeError)

        // WEBRTC TODO: Move into GLMHelpers class.

        assert(relativeError >= 0.0);
        // NOTE: we add EPSILON to the denominator so we can avoid checking for division by zero.
        // This method works fine when: Math.abs(a + b) >> EPSILON
        const EPSILON = 0.000001;
        return Math.abs(a - b) / (Math.abs(a + b) / 2.0 + EPSILON) <= relativeError;
    }

}();

export default GLMHelpers;
