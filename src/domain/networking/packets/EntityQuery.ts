//
//  EntityQuery.ts
//
//  Created by Julien Merzoug on 27 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { OctreeQueryFlags } from "../../octree/OctreeQuery";
import assert from "../../shared/assert";
import { ConicalViewFrustum } from "../../shared/Camera";
import GLMHelpers from "../../shared/GLMHelpers";
import PacketTypeValue from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type EntityQueryDetails = {
    connectionID: number,
    conicalViews: Array<ConicalViewFrustum>,
    maxQueryPPS: number,
    octreeElementSizeScale: number,
    boundaryLevelAdjust: number,
    jsonParameters: Record<string, unknown>,
    queryFlags: OctreeQueryFlags,
};


const EntityQuery = new class {
    // C++ N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|EntityQuery} packet.
     *  @typedef {object} PacketScribe.EntityQueryDetails
     *  @property {number} connectionID - The octree query connection ID.
     *  @property {Array<ConicalViewFrustum>} conicalViews - An array of conical view frustums.
     *  @property {number} maxQueryPPS - The maximum number of query packets per second.
     *  @property {number} octreeElementSizeScale - The size scale of the octree elements.
     *  @property {number} boundaryLevelAdjust - The boundary level adjust factor.
     *  @property {Record<string, unknown>} jsonParameters - JSON query parameters. (Not used client-side.)
     *  @property {OctreeQueryFlags} queryFlags - The query flags.
     */

    /*@devdoc
     *  Writes an {@link PacketType(1)|EntityQuery} packet, ready for sending.
     *  @function PacketScribe.EntityQuery&period;write
     *  @param {PacketScribe.EntityQueryDetails} info - The information needed for writing the packet.
     *  @return {NLPacket} The packet, ready for sending.
     */
    write(info: EntityQueryDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++ int OctreeQuery::getBroadcastData(unsigned char* destinationBuffer)
        //     int ConicalViewFrustum::serialize(unsigned char* destinationBuffer) const

        assert(Object.keys(info.jsonParameters).length === 0, "ERROR: JSON parameters not empty!");

        const packet = NLPacket.create(PacketTypeValue.EntityQuery);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint16(dataPosition, info.connectionID, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        data.setUint8(dataPosition, info.conicalViews.length);
        dataPosition += 1;

        for (const conicalView of info.conicalViews) {
            data.setFloat32(dataPosition, conicalView.position.x, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, conicalView.position.y, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, conicalView.position.z, UDT.LITTLE_ENDIAN);
            dataPosition += 4;

            data.setFloat32(dataPosition, conicalView.direction.x, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, conicalView.direction.y, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, conicalView.direction.z, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            GLMHelpers.packFloatAngleToTwoByte(data, dataPosition, conicalView.halfAngle);
            dataPosition += 2;
            GLMHelpers.packClipValueToTwoByte(data, dataPosition, conicalView.farClip);
            dataPosition += 2;
            data.setFloat32(dataPosition, conicalView.centerRadius, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        data.setInt32(dataPosition, info.maxQueryPPS, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.octreeElementSizeScale, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setInt32(dataPosition, info.boundaryLevelAdjust, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setUint16(dataPosition, Object.keys(info.jsonParameters).length, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        data.setUint16(dataPosition, info.queryFlags, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default EntityQuery;
export type { EntityQueryDetails };
