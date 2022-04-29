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


// WEBRTC TODO: Doc.
type EntityQueryDetails = {
    connectionID: number,
    numFrustrums: number,
    conicalViews: Array<ConicalViewFrustrum>, // TODO julien: fix linter warning
    maxQueryPPS: number,
    octreeElementSizeScale: number,
    boundaryLevelAdjust: number,
    jsonParameters: Record<string, unknown>,
    queryFlags: OctreeQueryFlags,
};


// WEBRTC TODO: Doc.
const EntityQuery = new class {
    // C++ N/A

    // WEBRTC TODO: Doc.
    write(info: EntityQueryDetails): NLPacket {
        const packet = NLPacket.create(PacketTypeValue.EntityQuery);
        // const messageData = packet.getMessageData();
        // messageData.packetSize = messageData.dataPosition;

        // WEBRTC TODO: Pack info's properties into the packet

        return packet;
    }

}();

export default EntityQuery;
export type { EntityQueryDetails };
