//
//  OctreeEditPacketSender.js
//
//  Created by David Rowe on 20 Jun 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../networking/NLPacket";
import NLPacketList from "../networking/NLPacketList";
import NodeList from "../networking/NodeList";
import NodeType from "../networking/NodeType";
import PacketType from "../networking/udt/PacketHeaders";
import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";


/*@devdoc
 *  The <code>OctreeEditPacketSender</code> class handles sending entity editing packets.
 *  <p>C++: <code>class OctreeEditPacketSender : public PacketSender</code></p>
 *
 *  @class OctreeEditPacketSender
 *  @param {number} contextID - The {@link ContextManager} context ID.
 */
class OctreeEditPacketSender {
    // C++  class OctreeEditPacketSender : public PacketSender

    static readonly contextItemType: "EntityEditPacketSender" | "OctreeEditPacketSender" = "OctreeEditPacketSender";

    static #_VALID_PACKET_TYPES = [PacketType.EntityAdd, PacketType.EntityEdit, PacketType.EntityClone, PacketType.EntityErase];


    // Context
    #_nodeList;


    constructor(contextID: number) {

        // Context
        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;
    }


    /*@devdoc
     *  Sends an {@link NLPacket} or {@link NLPacketList} to the entity server.
     *  <p>Note: The packet is sent straight away whereas the C++ queues the packet if not connected to the entity server.</p>
     *  @param {NLPacket | NLPacketList} editMessage - The packet to send.
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queueOctreeEditMessage(/* type: PacketTypeValue, */ editMessage: NLPacket | NLPacketList): void {
        // C++  void OctreeEditPacketSender::queueOctreeEditMessage(PacketType type, QByteArray & editMessage)

        const packetType = editMessage.getType();
        assert(OctreeEditPacketSender.#_VALID_PACKET_TYPES.indexOf(packetType) !== -1,
            `queueOctreeEditMessage() unexpected packet type: ${packetType}`);

        // WEBRTC TODO: Address further C++ code - queue edits if not connected to entity server. Perhaps reuse SendQueue?
        const entityServer = this.#_nodeList.soloNodeOfType(NodeType.EntityServer);
        if (entityServer && entityServer.getActiveSocket()) {
            if (editMessage instanceof NLPacket) {
                this.#_nodeList.sendPacket(editMessage, entityServer);
            } else {
                this.#_nodeList.sendPacketList(editMessage, entityServer);
            }
        } else {
            console.warn("[EntityServer] Could not send edit message because not connected.");
        }
    }
}

export default OctreeEditPacketSender;
