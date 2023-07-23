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
import { color } from "../shared/Color";
import Uuid from "../shared/Uuid";
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
     *  Appends a {@link Uuid} value to a packet and updates the packet context.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The position to write the value at.
     *  @param {number} flag - The property flag for the value being written.
     *  @param {Uuid} value - The value to write.
     *  @param {OctreePacketContext} packetContext - The context of the packet being written.
     *  @returns {number} The number of bytes written. <code>0</code> if the value wouldn't fit.
     */
    static appendUUIDValue(data: DataView, dataPosition: number, flag: number, value: Uuid,
        packetContext: OctreePacketContext): number {
        // C++  bool OctreePacketData::appendValue(const QUuid& uuid)
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

}

export default OctreePacketData;
export type { OctreePacketContext };
