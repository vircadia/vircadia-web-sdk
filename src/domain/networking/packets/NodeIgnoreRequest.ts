//
//  NodeIgnoreRequest.ts
//
//  Created by David Rowe on 26 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../../shared/Uuid";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import NLPacketList from "../NLPacketList";
import assert from "../../shared/assert";


type NodeIgnoreRequestDetails = {
    nodeID?: bigint
    nodeIDs?: bigint[],
    muteEnabled: boolean
};


const NodeIgnoreRequest = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} an {@link PacketType(1)|NodeIgnoreRequest} packet.
     *  Exactly one of either <code>nodeID</code> or <code>nodeIDs</code> must be specified.
     *  @typedef {object} PacketScribe.NodeIgnoreRequestDetails
     *  @property {bigint} nodeID - The session ID value of a single avatar.
     *  @property {bigint[]} nodeIDs - The session ID values of possibly multiple avatars.
     *  @property {boolean} muteEnabled - <code>true</code> to mute the avatar or avatars, <code>false</code> to unumte.
     */


    /*@devdoc
     *  Writes an {@link PacketType(1)|NodeIgnoreRequest} packet or packet list, ready for sending. A packet is returned if
     *  <code>nodeID</code> is specified; a packet list is returned if <code>nodeIDs</code> is specified.
     *  @function PacketScribe.NodeIgnoreRequest&period;write
     *  @param {PacketScribe.NodeIgnoreRequestDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket|NLPacketList} The packet or packet list, ready for sending.
     */
    write(info: NodeIgnoreRequestDetails): NLPacket | NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::personalMuteNodeBySessionID(const QUuid& nodeID, bool muteEnabled)
        //      void NodeList::maybeSendIgnoreSetToNode(SharedNodePointer newNode)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        assert(info.nodeID !== undefined || info.nodeIDs !== undefined);

        // Write an NLPacket with a single node.
        if (info.nodeID !== undefined) {
            assert(info.nodeIDs === undefined);

            const packet = NLPacket.create(PacketType.NodeIgnoreRequest, Uuid.NUM_BYTES_RFC4122_UUID + 1, true);
            const messageData = packet.getMessageData();
            const data = messageData.data;
            let dataPosition = messageData.dataPosition;

            data.setUint8(dataPosition, info.muteEnabled ? 1 : 0);
            dataPosition += 1;

            data.setBigUint128(dataPosition, info.nodeID, UDT.BIG_ENDIAN);
            dataPosition += 16;

            /* eslint-enable @typescript-eslint/no-magic-numbers */

            messageData.dataPosition = dataPosition;
            messageData.packetSize = dataPosition;

            return packet;
        }

        // Write an NLPacketList with multiple nodes.
        assert(info.nodeIDs !== undefined);

        assert(info.nodeID === undefined);
        const packetList = NLPacketList.create(PacketType.NodeIgnoreRequest, null, true, true);

        packetList.writePrimitive(info.muteEnabled);

        for (const nodeID of info.nodeIDs) {
            packetList.writePrimitive(nodeID);
        }

        return packetList;
    }

}();

export default NodeIgnoreRequest;
export type { NodeIgnoreRequestDetails };
