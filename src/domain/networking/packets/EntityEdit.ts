//
//  EntityEdit.ts
//
//  Created by David Rowe on 21 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import EntityItemProperties from "../../entities/EntityItemProperties";
import EntityPropertyFlags from "../../entities/EntityPropertyFlags";
import { AppendState } from "../../octree/OctreeElement";
import Uuid from "../../shared/Uuid";
import PacketTypeValue from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import { EntityProperties } from "./EntityData";


type EntityEditDetails = {
    entityID: Uuid,
    properties: EntityProperties,
    requestedProperties: EntityPropertyFlags,
    didntFitProperties: EntityPropertyFlags
};

const EntityEdit = new class {
    // C++ N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|EntityEdit} packet.
     *  @typedef {object} PacketScribe.EntityEditDetails
     *  @property {Uuid} entityID - The ID of the entity to edit.
     *  @property {EntityProperties} properties - Required and changed properties for the entity edit.
     *  @property {EntityPropertyFlags} requestedProperties - The properties requested to be included in the packet.
     *  @property {EntityPropertyFlags} didntFitProperties - Properties that couldn't be included in the packet write because
     *     they didn't fit. Must be empty when passed in.
     */

    /*@devdoc
     *  Writes an {@link PacketType(1)|EntityEdit} packet, ready for sending reliably.
     *  @function PacketScribe.EntityEdit&period;write
     *  @param {PacketScribe.EntityEditDetails} info - The information needed for writing the packet. This information is
     *      updated with any properties that didn't fit in the packet.
     *  @return {NLPacket} The packet, ready for sending, or <code>null<code> if the packet couldn't be written because a
     *      property couldn't fit.
     */
    write(info: EntityEditDetails): NLPacket | null {  /* eslint-disable-line class-methods-use-this */
        // C++  OctreeElement::AppendState EntityItemProperties::encodeEntityEditPacket(PacketType command, EntityItemID id,
        //          const EntityItemProperties& properties, QByteArray & buffer, EntityPropertyFlags requestedProperties,
        //          EntityPropertyFlags & didntFitProperties)
        // C++  void OctreeEditPacketSender::queueOctreeEditMessage(PacketType type, QByteArray& editMessage)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const packet = NLPacket.create(PacketTypeValue.EntityEdit, -1, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;


        // C++  OctreeEditPacketSender::initializePacket(...)

        // Leave space for the sequence number which is written when the packet is sent.
        dataPosition += 2;

        // WEBRTC TODO: Address further C++ code - clock skew.

        // WEBRTC TODO: High precision timestamp.
        const MS_TO_CLOCK_TICKS = 10000000n;
        const now = BigInt(Date.now()) * MS_TO_CLOCK_TICKS;
        data.setBigInt64(dataPosition, now, UDT.LITTLE_ENDIAN);
        dataPosition += 8;


        // C++  EntityItemProperties::encodeEntityEditPacket(...)

        messageData.dataPosition = dataPosition;

        info.didntFitProperties = new EntityPropertyFlags();

        const appendState = EntityItemProperties.encodeEntityEditPacket(/* PacketTypeValue.EntityEdit, */ info.entityID,
            info.properties, messageData, info.requestedProperties, info.didntFitProperties);
        dataPosition = messageData.dataPosition;

        if (appendState === AppendState.NONE) {
            return null;
        }


        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default EntityEdit;
export type { EntityEditDetails };
