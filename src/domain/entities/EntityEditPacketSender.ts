//
//  EntityData.ts
//
//  Created by Nshan G. on 17 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../shared/Uuid";
import ContextManager from "../shared/ContextManager";
import NodeList from "../networking/NodeList";
import NLPacket from "../networking/NLPacket"
import NodeType from "../networking/NodeType";
import { PacketTypeValue } from "../networking/udt/PacketHeaders";
import EntityData from "../networking/packets/EntityData"
import UDT from "../networking/udt/UDT";

class EntityEditPacketSender
{
    static readonly contextItemType = "EntityEditPacketSender";

    #_outgoingSequenceNumbers = new Map<string, number>();
    //TODO: native client maintains a history of sent packets per node, and resends them upon receiving a NACK packet
    // TODO: native client has a two stage message queue to pack multiple edit messages in one packet
    #_nodeList: NodeList;

    constructor(contextID: number) {
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
    }

    sendEraseEntityMessage(id: Uuid) {
        const packet = NLPacket.create(PacketTypeValue.EntityErase);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        // write sequence number
        const node = this.#_nodeList.soloNodeOfType(NodeType.EntityServer);
        if (node == null) {
            // TODO: native client buffers packets until entity server becomes available
            console.warn("EntityEditPacketSender: EntityErase packet not sent because Entity Server is not available.");
            return;
        }
        const nodeUUID = node.getUUID()
        let sequenceNumber = this.#_outgoingSequenceNumbers.get(nodeUUID.stringify());
        sequenceNumber = undefined !== sequenceNumber ? sequenceNumber + 1 : 0;
        this.#_outgoingSequenceNumbers.set(nodeUUID.stringify(), sequenceNumber);
        data.setUint16(dataPosition, sequenceNumber, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        // write timestamp in microseconds
        // TODO: the native client maintains an average packet travel time to the node (called clock skew) and adjust the timestamp
        data.setBigUint64(dataPosition, BigInt(Date.now()) * 1000n, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        // write erase message data
        const messageBytesWritten = EntityData.encodeEraseEntityMessage(id, new DataView(data.buffer, dataPosition));
        if (messageBytesWritten === 0) {
            console.warn("EntityEditPacketSender: EntityErase packet not sent because message data didn't fit in the packet.");
            return;
        }
        dataPosition += messageBytesWritten;

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        this.#_nodeList.broadcastToNodes(packet, new Set([NodeType.EntityServer]));
    }
}


export default EntityEditPacketSender;
