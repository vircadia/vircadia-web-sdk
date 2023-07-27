//
//  OctreePacketData.ts
//
//  Created by David Rowe on 17 Jul 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityPropertyFlags from "../entities/EntityPropertyFlags";
import UDT from "../networking/udt/UDT";
import AACube from "../shared/AACube";
import { color } from "../shared/Color";
import GLMHelpers from "../shared/GLMHelpers";
import { quat } from "../shared/Quat";
import Uuid from "../shared/Uuid";
import { vec3 } from "../shared/Vec3";
import { AppendState } from "./OctreeElement";


type OctreePacketContext = {
    // C++  N/A
    propertiesToWrite: EntityPropertyFlags,
    propertiesWritten: EntityPropertyFlags,
    propertyCount: number,
    appendState: AppendState
};

/*@devdoc
 *  The <code>OctreePacketData</code> namespace provides methods for writing entity properties to a packet.
 *  <p>C++: <code>OctreePacketData</code></p>
 *  @namespace OctreePacketData
 */
class OctreePacketData {
    // C++  class OctreePacketData

    /*@devdoc
     *  The context of a packet being written.
     *  @typedef {object} OctreePacketContext
     *  @property {EntityPropertyFlags} propertiesToWrite - The properties remaining to be written to the packet.
     *  @property {EntityPropertyFlags} propertiesWritten - The properties that have been written to the packet.
     *  @property {number} propertyCount - The number of properties written to the packet.
     *  @property {AppendState} appendState - The status of the append operation.
     */


    static #_textEncoder = new TextEncoder();

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    /*@devdoc
     *  Appends a {@link AACube} value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {AACube} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendAACubeValue(data: DataView, dataPosition: number, flag: number, value: AACube,
        packetContext: OctreePacketContext): number {
        // C++  bool appendPosition(const glm::vec3& value)
        const valid = typeof value.corner === "object" && typeof value.corner.x === "number"
            && typeof value.corner.y === "number" && typeof value.corner.z === "number" && typeof value.scale === "number";
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid AACube value to packet!");
            return 0;
        }

        const NUM_BYTES = 16;  // 4 floats.
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setFloat32(dataPosition, value.corner.x, UDT.LITTLE_ENDIAN);
            data.setFloat32(dataPosition + 4, value.corner.y, UDT.LITTLE_ENDIAN);
            data.setFloat32(dataPosition + 8, value.corner.z, UDT.LITTLE_ENDIAN);
            data.setFloat32(dataPosition + 12, value.scale, UDT.LITTLE_ENDIAN);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends an ArrayBuffer value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {ArrayBuffer} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendArrayBufferValue(data: DataView, dataPosition: number, flag: number, value: ArrayBuffer,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(const QByteArray& bytes)
        const valid = value instanceof ArrayBuffer;
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid ArrayBuffer value to packet!");
            return 0;
        }

        // Max packet length < max uint16 length so no need to check for overflow.
        const NUM_BYTES = 2 + value.byteLength;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint16(dataPosition, value.byteLength, UDT.LITTLE_ENDIAN);
            const startIndex = dataPosition + 2;
            const dataView = new DataView(value);
            for (let i = 0; i < value.byteLength; i += 1) {
                data.setUint8(startIndex + i, dataView.getUint8(i));
            }
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a boolean value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {boolean} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendBooleanValue(data: DataView, dataPosition: number, flag: number, value: boolean,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(bool value)
        const valid = typeof value === "boolean";
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid boolean value to packet!");
            return 0;
        }

        const NUM_BYTES = 1;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint8(dataPosition, value ? 1 : 0);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a {@link color} value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {color} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendColorValue(data: DataView, dataPosition: number, flag: number, value: color,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(const glm::u8vec3& value);
        const valid = typeof value.red === "number" && typeof value.green === "number" && typeof value.blue === "number";
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid color value to packet!");
            return 0;
        }

        const NUM_BYTES = 3;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint8(dataPosition, value.red);
            data.setUint8(dataPosition + 1, value.green);
            data.setUint8(dataPosition + 2, value.blue);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a float32 value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {number} value - The value to write.
     *  @param {boolean} littleEndian - <code>true</code> to write the value in little-endian format, <code>false</code> for
     *      big-endian.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendFloat32Value(data: DataView, dataPosition: number, flag: number, value: number, littleEndian: boolean,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(float value)
        const MAX_FLOAT32 = 3.4028235e38;
        const valid = typeof value === "number" && -MAX_FLOAT32 <= value && value <= MAX_FLOAT32;
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid float32 value to packet!");
            return 0;
        }

        const NUM_BYTES = 4;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setFloat32(dataPosition, value, littleEndian);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a {@link quat} value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {quat} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendQuatValue(data: DataView, dataPosition: number, flag: number, value: quat,
        packetContext: OctreePacketContext): number {
        // C++  bool appendPosition(const glm::vec3& value)
        const valid = typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number"
            && typeof value.w === "number";
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid quat value to packet!");
            return 0;
        }

        const NUM_BYTES = 8;  // Packed data.
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            GLMHelpers.packOrientationQuatToBytes(data, dataPosition, value);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a string value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {string} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendStringValue(data: DataView, dataPosition: number, flag: number, value: string,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(const QString& string)
        const valid = typeof value === "string";
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid string value to packet!");
            return 0;
        }

        const utf8 = OctreePacketData.#_textEncoder.encode(value);
        // Max packet length < max uint16 length so no need to check for overflow.
        const NUM_BYTES = 2 + utf8.byteLength;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint16(dataPosition, utf8.byteLength, UDT.LITTLE_ENDIAN);
            const startIndex = dataPosition + 2;
            for (let i = 0; i < utf8.length; i += 1) {
                data.setUint8(startIndex + i, utf8.at(i) ?? 0);
            }
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a uint16 value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {number} value - The value to write.
     *  @param {boolean} littleEndian - <code>true</code> to write the value in little-endian format, <code>false</code> for
     *      big-endian.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendUint16Value(data: DataView, dataPosition: number, flag: number, value: number, littleEndian: boolean,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(uint16_t value)
        const valid = typeof value === "number" && 0 <= value && value <= 0xffff;
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid uint16 value to packet!");
            return 0;
        }

        const NUM_BYTES = 2;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint16(dataPosition, value, littleEndian);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a uint32 value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {number} value - The value to write.
     *  @param {boolean} littleEndian - <code>true</code> to write the value in little-endian format, <code>false</code> for
     *      big-endian.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendUint32Value(data: DataView, dataPosition: number, flag: number, value: number, littleEndian: boolean,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(uint32_t value)
        const valid = typeof value === "number" && 0 <= value && value <= 0xffffffff;
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid uint32 value to packet!");
            return 0;
        }

        const NUM_BYTES = 4;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint32(dataPosition, value, littleEndian);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a uint64 value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {bigint} value - The value to write.
     *  @param {boolean} littleEndian - <code>true</code> to write the value in little-endian format, <code>false</code> for
     *      big-endian.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendUint64Value(data: DataView, dataPosition: number, flag: number, value: bigint, littleEndian: boolean,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(quint64 value)
        const valid = typeof value === "bigint" && 0 <= value && value <= 0xffffffffffffffffn;
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid uint64 value to packet!");
            return 0;
        }

        const NUM_BYTES = 8;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setBigUint64(dataPosition, value, littleEndian);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a {@link Uuid} array to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the array at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {Uuid[]} value - The array to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendUuidArray(data: DataView, dataPosition: number, flag: number, value: Uuid[],
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(const QVector<QUuid>& value)
        const valid = Array.isArray(value) && value.length <= 0xffff && value.every((element) => {
            return element instanceof Uuid;
        });
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid UUID array to packet!");
            return 0;
        }

        const NUM_BYTES = 2 + value.length * 16;
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setUint16(dataPosition, value.length, UDT.LITTLE_ENDIAN);
            let index = dataPosition + 2;
            value.forEach((uuid) => {
                data.setBigUint128(index, uuid.value(), UDT.BIG_ENDIAN);
                index += 16;
            });
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a {@link Uuid} value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {Uuid} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendUuidValue(data: DataView, dataPosition: number, flag: number, value: Uuid,
        packetContext: OctreePacketContext): number {
        // C++  bool appendValue(const QUuid& uuid)
        const valid = value instanceof Uuid;
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid UUID value to packet!");
            return 0;
        }

        if (value.isNull()) {
            const NUM_BYTES = 2;
            if (dataPosition + NUM_BYTES <= data.byteLength) {
                data.setUint16(dataPosition, 0, UDT.LITTLE_ENDIAN);
                packetContext.propertiesToWrite.setHasProperty(flag, false);
                packetContext.propertiesWritten.setHasProperty(flag, true);
                packetContext.propertyCount += 1;
                return NUM_BYTES;
            }
        } else {
            const NUM_LENGTH_BYTES = 2;
            const NUM_VALUE_BYTES = 16;
            if (dataPosition + NUM_LENGTH_BYTES + NUM_VALUE_BYTES <= data.byteLength) {
                data.setUint16(dataPosition, NUM_VALUE_BYTES, UDT.LITTLE_ENDIAN);
                data.setBigUint128(dataPosition + NUM_LENGTH_BYTES, value.value(), UDT.BIG_ENDIAN);
                packetContext.propertiesToWrite.setHasProperty(flag, false);
                packetContext.propertiesWritten.setHasProperty(flag, true);
                packetContext.propertyCount += 1;
                return NUM_LENGTH_BYTES + NUM_VALUE_BYTES;
            }
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /*@devdoc
     *  Appends a {@link vec3} value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {vec3} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendVec3Value(data: DataView, dataPosition: number, flag: number, value: vec3,
        packetContext: OctreePacketContext): number {
        // C++  bool appendPosition(const glm::vec3& value)
        const valid = typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number";
        if (!valid) {
            console.error("[EntityServer] Cannot write invalid vec3 value to packet!");
            return 0;
        }

        const NUM_BYTES = 12;  // 3 floats.
        if (dataPosition + NUM_BYTES <= data.byteLength) {
            data.setFloat32(dataPosition, value.x, UDT.LITTLE_ENDIAN);
            data.setFloat32(dataPosition + 4, value.y, UDT.LITTLE_ENDIAN);
            data.setFloat32(dataPosition + 8, value.z, UDT.LITTLE_ENDIAN);
            packetContext.propertiesToWrite.setHasProperty(flag, false);
            packetContext.propertiesWritten.setHasProperty(flag, true);
            packetContext.propertyCount += 1;
            return NUM_BYTES;
        }
        packetContext.appendState = AppendState.PARTIAL;
        return 0;
    }

    /* eslint-enable @typescript-eslint/no-magic-numbers */
}

export default OctreePacketData;
export type { OctreePacketContext };
