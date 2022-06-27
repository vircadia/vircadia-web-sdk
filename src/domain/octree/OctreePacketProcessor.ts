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
 *  @property {Signal} addedEntity - Triggered when an entity data packet is received.
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

    #_addedEntity = new SignalEmitter();

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
     *  @function OctreePacketProcessor.addedEntity
     *  @returns {Signal}
     */
    get addedEntity(): Signal {
        return this.#_addedEntity.signal();
    }

    // Listener
    #processPacket = (message: ReceivedMessage, sendingNode: Node | null): void => {
        // C++ void OctreePacketProcessor::processPacket(QSharedPointer<ReceivedMessage> message, SharedNodePointer sendingNode)

        assert(sendingNode !== null, "OctreePacketProcessor.processPacket()", "Sending node is missing.");

        let messageLocal = message;

        const octreePacketType = messageLocal.getType();

        if (octreePacketType === PacketType.OctreeStats) {
            // WEBRTC TODO: Address further C++ code - process OctreeStats packet.

            console.error("OctreePacketProcessor: Packet type not processed: ", octreePacketType);

            // WEBRTC TODO: Do not hardcode statsMessageLength.
            const statsMessageLength = 222;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const piggybackBytes = messageLocal.getMessage().byteLength - statsMessageLength;

            if (piggybackBytes > 0) {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                const view = new DataView(
                    // messageLocal.getMessage().buffer.slice(messageLocal.getMessage().byteOffset + statsMessageLength)
                    messageLocal.getMessage().buffer.slice(messageLocal.getMessage().byteOffset + statsMessageLength)
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
                // TODO: Emit entity data
                // this.#_addedEntity.emit(entityDataDetails);
                break;
            }
            case PacketType.EntityErase:
            case PacketType.EntityQueryInitialResultsComplete:
                console.error("OctreePacketProcessor: Packet type not processed: ", packetType);
                break;
            default:
                console.error("ERROR - Unexpected packet type in OctreePacketProcessor.processPacket() :", packetType);
        }

        // WEBRTC TODO: Address further C++ code.

    };
}

export default OctreePacketProcessor;
