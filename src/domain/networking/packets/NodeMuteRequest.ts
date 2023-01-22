//
//  NodeMuteRequest.ts
//
//  Created by David Rowe on 21 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import Uuid from "../../shared/Uuid";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type NodeMuteRequestDetails = {
    nodeID: Uuid
};


const NodeMuteRequest = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|NodeMuteRequest} packet.
     *  @typedef {object} PacketScribe.NodeMuteRequestDetails
     *  @property {Uuid} nodeID - The avatar's session ID.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|NodeMuteRequest} packet, ready for sending.
     *  @function PacketScribe.NodeMuteRequest&period;write
     *  @param {PacketScribe.NodeMuteRequestDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: NodeMuteRequestDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::muteNodeBySessionID(const QUuid& nodeID)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const packet = NLPacket.create(PacketType.NodeMuteRequest, Uuid.NUM_BYTES_RFC4122_UUID, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        data.setBigUint128(dataPosition, info.nodeID.value(), UDT.BIG_ENDIAN);
        dataPosition += 16;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default NodeMuteRequest;
export type { NodeMuteRequestDetails };
