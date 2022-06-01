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

import "../../shared/DataViewExtensions";
import Uuid from "../../shared/Uuid";
import UDT from "../udt/UDT";
import { EntityTypes } from "../../entities/EntityItem";
import ByteCountCoded from "../../shared/ByteCountCoding";


type EntityDataDetails = {
    id: Uuid,
    entityType: EntityTypes,
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

        const codec = new ByteCountCoded();
        dataPosition += codec.decode(data, data.byteLength);
        const entityType = codec.data;
        // TODO: Check entityType. Return if it's not a modelEntity (return default values for other fields in EntityDataDetails?)

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return {
            id,
            entityType
        };
    }

}();

export default EntityData;
export type { EntityDataDetails };
