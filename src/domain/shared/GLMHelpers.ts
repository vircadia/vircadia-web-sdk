//
//  GLMHelpers.ts
//
//  Created by David Rowe on 7 Dec 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { quat } from "./Quat";
import UDT from "../networking/udt/UDT";


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


}();

export default GLMHelpers;
