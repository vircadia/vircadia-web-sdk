//
//  EntityEditPacketSender.js
//
//  Created by David Rowe on 19 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { HostType } from "../entities/EntityItem";
import EntityPropertyFlags, { EntityPropertyList } from "../entities/EntityPropertyFlags";
import { EntityProperties } from "../networking/packets/EntityData";
import PacketScribe from "../networking/packets/PacketScribe";
import { PacketTypeValue } from "../networking/udt/PacketHeaders";
import NLPacket from "../networking/NLPacket";
import NodeList from "../networking/NodeList";
import OctreeEditPacketSender from "../octree/OctreeEditPacketSender";
import ContextManager from "../shared/ContextManager";
import { bigintReplacer, bigintReviver } from "../shared/JSONExtensions";
import Uuid from "../shared/Uuid";
import EntityItemProperties from "./EntityItemProperties";


/*@devdoc
 *  The <code>EntityEditPacketSender</code> class handles preparing and sending entity edit packets to the entity server.
 *  <p>C++: <code>class EntityEditPacketSender : public OctreeEditPacketSender</code></p>
 *
 *  @class EntityEditPacketSender
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class EntityEditPacketSender extends OctreeEditPacketSender {
    // C++  class EntityEditPacketSender : public OctreeEditPacketSender

    static override readonly contextItemType = "EntityEditPacketSender";


    // Context
    #_nodeList;


    constructor(contextID: number) {
        super(contextID);

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
    }


    /*@devdoc
     *  Sends an entity edit to the entity server as an {@link NLPacket} or {@link NLPacketList}.
     *  <p>Note: The edit is sent reliably whereas the C++ sends it unreliably. The C++ can send it unreliably because it
     *  maintains its own copy of the entity tree</p>
     *  @param {PacketTypeValue} type - The entity edit packet type.
     *  @param {Uuid} entityItemID - The entity ID.
     *  @param {EntityProperties} properties - The properties to include in the entity edit.
     */
    queueEditEntityMessage(type: PacketTypeValue, entityItemID: Uuid, properties: EntityProperties): void {
        // C++  void EntityEditPacketSender::queueEditEntityMessage(PacketType type, EntityTreePointer entityTree,
        //          EntityItemID entityItemID, const EntityItemProperties& properties)

        if (properties.entityHostType === HostType.AVATAR) {

            // WEBRTC TODO: Address further C++ code - avatar entities.

            console.error("[EntityEditPacketSender] queueEditEntityMessage() for avatar entities not implemented!");
            return;
        }
        if (properties.entityHostType === HostType.LOCAL) {
            // Don't send edits for local entities
            return;
        }

        // WEBRTC TODO: Address further C++ code - serverless domains.

        let didntFitProperties = new EntityPropertyFlags();
        const propertiesCopy = JSON.parse(JSON.stringify(properties, bigintReplacer), bigintReviver) as EntityProperties;

        if (properties.parentID && properties.parentID.value() === Uuid.AVATAR_SELF_ID) {
            const myNodeID = this.#_nodeList.getSessionUUID();
            propertiesCopy.parentID = myNodeID;
        }

        let requestedProperties = EntityItemProperties.getChangedProperties(propertiesCopy);

        if (!this.#_nodeList.getThisNodeCanGetAndSetPrivateUserData()
                && requestedProperties.getHasProperty(EntityPropertyList.PROP_PRIVATE_USER_DATA)) {
            requestedProperties.setHasProperty(EntityPropertyList.PROP_PRIVATE_USER_DATA, false);
        }

        let packetType = type;
        /*
        let nlPacketList: NLPacketList | null = null;
        */
        let nlPacket: NLPacket | null = null;

        let packetOverflow = false;
        while (!requestedProperties.isEmpty() && !packetOverflow) {
            // Create NLPacketList / NLPacket here rather than in queueOctreeEditMessage().
            const entityOperationDetails = {
                entityID: entityItemID,
                properties: propertiesCopy,
                requestedProperties,
                didntFitProperties
            };
            if (packetType === PacketTypeValue.EntityAdd) {
                // WEBRTC TODO: Implement EntityAdd.
                /*
                nlPacketList = PacketScribe.EntityAdd.write(entityOperationDetails);  // Creates a reliable packet.
                this.queueOctreeEditMessage(type, nlPacketList);
                */
            } else {
                switch (packetType) {
                    case PacketTypeValue.EntityEdit:
                        nlPacket = PacketScribe.EntityEdit.write(entityOperationDetails);  // Creates a reliable packet.
                        break;
                    default:
                        // WEBRTC TODO: Address further packet types.
                        console.error("[EntityEditPacketSender] Not implemented for packet type!", packetType);
                        return;
                }
                if (nlPacket) {
                    this.queueOctreeEditMessage(/* type, */ nlPacket);
                } else {
                    console.warn("[networking] Some properties didn't fit writing an EntityEdit packet - packet not sent.",
                        entityOperationDetails.entityID.stringify());
                    packetOverflow = true;
                }
            }

            packetType = PacketTypeValue.EntityEdit;
            requestedProperties = didntFitProperties;
            didntFitProperties = new EntityPropertyFlags();
        }
    }
}

export default EntityEditPacketSender;
