//
//  OctreePacketProcessor.ts
//
//  Created by Julien Merzoug on 18 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketScribe from "../networking/packets/PacketScribe";
import PacketType from "../networking/udt/PacketHeaders";
import ContextManager from "../shared/ContextManager";
import NLPacket from "../networking/NLPacket";
import Node from "../networking/Node";
import NodeList from "../networking/NodeList";
import PacketReceiver from "../networking/PacketReceiver";
import ReceivedMessage from "../networking/ReceivedMessage";
import assert from "../shared/assert";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";


/*@devdoc
 *  The <code>OctreePacketProcessor</code> class handles processing of incoming octree packets.
 *  <p>C++: <code>class OctreePacketProcessor : public ReceivedPacketProcessor</code></p>
 *
 *  @class OctreePacketProcessor
 *  @property {string} contextItemType="OctreePacketProcessor" - The type name for use with the {@link ContextManager}.
 *  @property {Signal} entityData - Triggered when an entity data packet is received.
 *
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
// WEBRTC TODO:  Extend ReceivedPacketProcessor.
class OctreePacketProcessor {
    // C++  class OctreePacketProcessor : public ReceivedPacketProcessor


    static readonly contextItemType = "OctreePacketProcessor";


    // Context
    #_nodeList;
    #_packetReceiver;

    #_entityData = new SignalEmitter();

    #_haveWarnedOctreeStats = false;
    #_haveWarnedEntityErase = false;
    #_haveWarnedEntityQueryInitialResultsComplete = false;


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
        // via OctreePacketProcessor::handleOctreePacket(). We can process the packet directly because we send the contents
        // off to the user app to handle.
        this.#_packetReceiver.registerListenerForTypes(octreePackets,
            PacketReceiver.makeSourcedListenerReference(this.#processPacket));
    }

    /*@devdoc
     *  Triggered when an entity data packet is received.
     *  @callback OctreePacketProcessor.entityData
     *  @param {PacketScribe.EntityDataDetails} entityData - The entity data for one or more entities.
     *  @returns {Signal}
     */
    get entityData(): Signal {
        return this.#_entityData.signal();
    }

    // Listener
    #processPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {
        // C++ void OctreePacketProcessor::processPacket(QSharedPointer<ReceivedMessage> message, SharedNodePointer sendingNode)

        assert(sendingNode !== null, "OctreePacketProcessor.processPacket()", "Sending node is missing.");

        let messageLocal = message;

        const octreePacketType = messageLocal.getType();

        if (octreePacketType === PacketType.OctreeStats) {
            if (!this.#_haveWarnedOctreeStats) {
                console.warn("OctreePacketProcessor: OctreeStats packet not processed.");
                this.#_haveWarnedOctreeStats = true;
            }

            // WEBRTC TODO: Address further C++ code - process OctreeStats packet.

            // The stats message is always 222 bytes long.
            const STATS_MESSAGE_LENGTH = 222;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const piggybackBytes = messageLocal.getMessage().byteLength - STATS_MESSAGE_LENGTH;

            if (piggybackBytes > 0) {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                const view = new DataView(
                    messageLocal.getMessage().buffer.slice(messageLocal.getMessage().byteOffset + STATS_MESSAGE_LENGTH)
                );
                const packet = NLPacket.fromReceivedPacket(view, piggybackBytes, sendingNode.getPublicSocket());
                messageLocal = new ReceivedMessage(packet);
            } else {
                return;
            }
        }

        const packetType = messageLocal.getType();

        switch (packetType) {
            case PacketType.EntityData: {
                const entityDataDetails = PacketScribe.EntityData.read(messageLocal.getMessage());
                this.#_entityData.emit(entityDataDetails);
                break;
            }
            case PacketType.EntityErase:
                if (!this.#_haveWarnedEntityErase) {
                    console.warn("OctreePacketProcessor: EntityErase packet not processed.");
                    this.#_haveWarnedEntityErase = true;
                }
                // WEBRTC TODO: Address further C++ code.
                break;
            case PacketType.EntityQueryInitialResultsComplete:
                if (!this.#_haveWarnedEntityQueryInitialResultsComplete) {
                    console.warn("OctreePacketProcessor: EntityQueryInitialResultsComplete packet not processed.");
                    this.#_haveWarnedEntityQueryInitialResultsComplete = true;
                }
                // WEBRTC TODO: Address further C++ code.
                break;
            default:
                console.error("ERROR - Unexpected packet type in OctreePacketProcessor.processPacket() :", packetType);
        }

        // WEBRTC TODO: Address further C++ code.

    };
}

export default OctreePacketProcessor;
