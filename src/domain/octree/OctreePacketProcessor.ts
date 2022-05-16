//
//  OctreePacketProcessor.ts
//
//  Created by Julien Merzoug on 11 May 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../networking/udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import PacketReceiver from "../networking/PacketReceiver";
import ReceivedMessage from "../networking/ReceivedMessage";


/*@devdoc
 *  The <code>OctreePacketProcessor</code> class handles processing of incoming voxel packets.
 *  <p>C++: <code>class OctreePacketProcessor : public ReceivedPacketProcessor</code></p>
 *
 *  @class OctreePacketProcessor
 *  @property {string} contextItemType="OctreePacketProcessor" - The type name for use with the {@link ContextManager}.
 *
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
// WEBRTC TODO:  Extend ReceivedPacketProcessor.
class OctreePacketProcessor {
    // C++ OctreePacketProcessor.cpp


    static readonly contextItemType = "OctreePacketProcessor";


    // Context
    #_nodeList;
    #_packetReceiver;

    constructor(contextID: number) {

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
        this.#_packetReceiver = this.#_nodeList.getPacketReceiver();

        const octreePackets = [
            PacketType.OctreeStats,
            PacketType.EntityData,
            PacketType.EntityErase,
            PacketType.EntityQueryInitialResultsComplete
        ];

        // C++ packetReceiver.registerDirectListenerForTypes() is used but in TypeScript we can use the non-direct variant of
        // the method.
        // Also, processPacket() is called directly unlike in the C++ where received packets are pushed to a queue
        // via OctreePacketProcessor::handleOctreePacket().
        this.#_packetReceiver.registerListenerForTypes(octreePackets,
            PacketReceiver.makeSourcedListenerReference(this.#processPacket));
    }

    // Listener
    // eslint-disable-next-line
    // @ts-ignore
    #processPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {// eslint-disable-line
        // C++ void OctreePacketProcessor::processPacket(QSharedPointer<ReceivedMessage> message, SharedNodePointer sendingNode)

        const packetType = message.getType();

        switch (packetType) {
            case PacketType.OctreeStats:
            case PacketType.EntityData:
            case PacketType.EntityErase:
            case PacketType.EntityQueryInitialResultsComplete:
                console.warn("OctreePacketProcessor: Packet type %d not processed: ", packetType);
                break;
            default:
                console.error("ERROR - Unknown packet type in processPacket() :", packetType);
        }

        // WEBRTC TODO: Address further C++ code.

    };
}

export default OctreePacketProcessor;
