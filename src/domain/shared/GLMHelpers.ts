//
//  GLMHelpers.ts
//
//  Created by David Rowe on 7 Dec 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import assert from "./assert";
import { quat } from "./Quat";


enum ClipLimit {
    SMALL_LIMIT = 10,
    LARGE_LIMIT = 1000
}


/*@devdoc
 *  The <code>GLMHelpers</code> namespace provides helpers for working with OpenGL Mathematics (GLM) items.
 *  <p>C++: <code>GLMHelpers.h</code></p>
 *  @namespace GLMHelpers
 */
const GLMHelpers = new class {
    // C++  GLMHelpers.h, .cpp

    /*@devdoc
     *  Writes a quaternion value to a packet, packing it into 6 bytes.
     *  @function GLMHelpers.packOrientationQuatToSixBytes
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {quat} quatInput - The quaternion value to write.
     *  @returns {number} The number bytes written (i.e., <code>6</code>).
     */
    // eslint-disable-next-line class-methods-use-this
    packOrientationQuatToSixBytes(data: DataView, dataPosition: number, quatInput: quat): number {
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

        return 6;

        /* eslint-enable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-non-null-assertion */
    }

    /*@devdoc
     *  Reads a quaternion value from a packet, unpacking it from 6 bytes.
     *  @function GLMHelpers.unpackOrientationQuatFromSixBytes
     *  @param {DataView} data - The packet data to read.
     *  @param {number} dataPosition - The data position to read the value from.
     *  @param {quat} quatOutput - The quaternion to update with the value read.
     *  @returns {number} The number bytes read (i.e., <code>6</code>).
     */
    // eslint-disable-next-line class-methods-use-this
    unpackOrientationQuatFromSixBytes(data: DataView, dataPosition: number, quatOutput: quat): number {
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

        quatOutput.x = output[0]!;
        quatOutput.y = output[1]!;
        quatOutput.z = output[2]!;
        quatOutput.w = output[3]!;

        return 6;

        /* eslint-enable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-non-null-assertion */
    }

    /*@devdoc
     *  Writes a degree value to a packet, packing it into 2 bytes.
     *  @function GLMHelpers.packFloatAngleToTwoByte
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {number} degrees - The degree value to write.
     *  @returns {number} The number bytes written (i.e., <code>2</code>).
     */
    // eslint-disable-next-line class-methods-use-this
    packFloatAngleToTwoByte(data: DataView, dataPosition: number, degrees: number): number {
        // C++  int packFloatAngleToTwoByte(unsigned char* buffer, float degrees)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        // eslint-disable-next-line camelcase
        const maxUint16_t = (1 << 16) - 1;
        // eslint-disable-next-line camelcase
        const ANGLE_CONVERSION_RATIO = maxUint16_t / 360;
        const twoByteAngle = Math.floor((degrees + 180) * ANGLE_CONVERSION_RATIO);

        data.setUint16(dataPosition, twoByteAngle, UDT.LITTLE_ENDIAN);

        return 2;

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Writes a clipping distance value to a packet, packing it into 2 bytes.
     *  @function SharedUtils.packClipValueToTwoByte
     *  @param {DataView} data - The packet data to write.
     *  @param {number} dataPosition - The data position to write the value at.
     *  @param {number} clipValue - The clipping distance value to write.
     *  @returns {number} The number bytes written (i.e., <code>2</code>).
     */
    // eslint-disable-next-line class-methods-use-this
    packClipValueToTwoByte(data: DataView, dataPosition: number, clipValue: number): number {
        // C++ int packClipValueToTwoByte(unsigned char* buffer, float clipValue) {

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        // eslint-disable-next-line camelcase
        const maxInt16_t = (1 << 15) - 1;
        // eslint-disable-next-line camelcase
        assert(clipValue < maxInt16_t, "ERROR: Clip values must be less than max signed 16 bit integers");

        // eslint-disable-next-line @typescript-eslint/init-declarations
        let holder: number;

        if (clipValue < ClipLimit.SMALL_LIMIT) {
        // eslint-disable-next-line camelcase
            const SMALL_RATIO_CONVERSION_RATIO = maxInt16_t / ClipLimit.SMALL_LIMIT;
            holder = Math.floor(clipValue * SMALL_RATIO_CONVERSION_RATIO);
        } else {
            holder = -1 * Math.floor(clipValue);
        }

        data.setInt16(dataPosition, holder, UDT.LITTLE_ENDIAN);

        return 2;

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    }

    /*@devdoc
     *  Checks whether two numbers have very similar values.
     *  @function.closeEnough
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
