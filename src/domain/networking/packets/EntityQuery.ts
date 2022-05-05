//
//  EntityQuery.ts
//
//  Created by Julien Merzoug on 27 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../NLPacket";
import PacketTypeValue from "../udt/PacketHeaders";
import { OctreeQueryFlags } from "../../octree/OctreeQuery";
import ConicalViewFrustrum from "../../shared/ConicalViewFrustrum";
import UDT from "../udt/UDT";
import GLMHelpers from "../../shared/GLMHelpers";


type EntityQueryDetails = {
    connectionID: number,
    numFrustrums: number,
    conicalViews: Array<ConicalViewFrustrum>,
    maxQueryPPS: number,
    octreeElementSizeScale: number,
    boundaryLevelAdjust: number,
    jsonParameters: Record<string, unknown>,
    queryFlags: OctreeQueryFlags,
};


const EntityQuery = new class {
    // C++ N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|writing} a {@link PacketType(1)|EntityQuery} packet.
     *  @typedef {object} PacketScribe.EntityQueryDetails
     *  WEBRTC TODO: Address further documentation.
     */

    /*@devdoc
     *  Writes a {@link PacketType(1)|EntityQuery} packet, ready for sending.
     *  @function PacketScribe.EntityQuery&period;write
     *  @param {PacketScribe.EntityQueryDetails} info - The information needed for writing the packet list.
     *  @return {NLPacket} The packet, ready for sending.
     */
    write(info: EntityQueryDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++ int OctreeQuery::getBroadcastData(unsigned char* destinationBuffer)
        //     int ConicalViewFrustum::serialize(unsigned char* destinationBuffer) const

        const packet = NLPacket.create(PacketTypeValue.EntityQuery);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint16(dataPosition, info.connectionID, UDT.LITTLE_ENDIAN);
        dataPosition += 2;
        data.setUint8(dataPosition, info.numFrustrums);
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
            GLMHelpers.packFloatAngleToTwoByte(data, dataPosition, conicalView.angle);
            dataPosition += 2;
            GLMHelpers.packClipValueToTwoByte(data, dataPosition, conicalView.farClip);
            dataPosition += 2;
            data.setFloat32(dataPosition, conicalView.radius, UDT.LITTLE_ENDIAN);
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

        // WEBRTC TODO: Pack jsonParameters.

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
