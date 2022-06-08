//
//  EntityData.ts
//
//  Created by Julien Merzoug on 16 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityTypes } from "../../entities/EntityItem";
import ByteCountCoded from "../../shared/ByteCountCoding";
import PropertyFlags from "../../shared/PropertyFlags";
import Uuid from "../../shared/Uuid";
import UDT from "../udt/UDT";
import "../../shared/DataViewExtensions";


type EntityDataDetails = {
    id: Uuid,
    entityType: EntityTypes,
    created: BigInt,
    lastEdited: BigInt,
    updateDelta: number,
    simulatedDelta: number,
    simOwnerData: ArrayBuffer;
    // WEBRTC TODO: Address further C++ code.
};


const EntityData = new class {
    // C++ N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} an {@link PacketType(1)|EntityData} packet.
     *  @typedef {object} PacketScribe.EntityDataDetails
     */

    /*@devdoc
     *  Reads an {@link PacketType(1)|EntityData} packet.
     *  @function PacketScribe.EntityData&period;read
     *  @read {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @returns {PacketScribe.EntityDataDetails} The entity data information.
     */
    read(data: DataView): EntityDataDetails { /* eslint-disable-line class-methods-use-this */
        // C++ int EntityItem::readEntityDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //      ReadBitstreamToTreeParams& args)

        // TODO: Get the number of bytes to read? Or make it a parameter of this method?

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const id = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;

        const entityTypeCodec = new ByteCountCoded();
        dataPosition += entityTypeCodec.decode(data, data.byteLength - dataPosition, dataPosition);
        const entityType = entityTypeCodec.data;
        // TODO: Check entityType. Return if it's not a modelEntity
        // (return default values for other fields in EntityDataDetails?)
        // if (entityType !== EntityTypes.Model) {
        //     return {};
        // }

        const created = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        const lastEdited = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        const updateDeltaCodec = new ByteCountCoded();
        dataPosition += updateDeltaCodec.decode(data, data.byteLength - dataPosition, dataPosition);
        console.log("updateDelta: ", updateDeltaCodec.data); // TODO: remove
        const updateDelta = updateDeltaCodec.data;

        const simulatedDeltaCodec = new ByteCountCoded();
        dataPosition += simulatedDeltaCodec.decode(data, data.byteLength - dataPosition, dataPosition);
        const simulatedDelta = simulatedDeltaCodec.data;

        const propertyFlagsData = new PropertyFlags();
        dataPosition += propertyFlagsData.decode(data, data.byteLength - dataPosition, dataPosition);
        const propertyFlags = propertyFlagsData.flags;

        // TODO: check if has property simowner
        const byteLength = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        const simOwnerData = new Uint8Array(data.buffer, data.byteOffset + dataPosition, byteLength).buffer;

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return {
            id,
            entityType,
            created,
            lastEdited,
            updateDelta,
            simulatedDelta,
            simOwnerData
        };
    }

}();

export default EntityData;
export type { EntityDataDetails };
