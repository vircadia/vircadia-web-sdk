//
//  NodeKickRequest.ts
//
//  Created by David Rowe on 22 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


import { BanFlagsValue } from "../../shared/ModerationFlags";
import Uuid from "../../shared/Uuid";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type NodeKickRequestDetails = {
    nodeID: Uuid,
    banFlags: BanFlagsValue
};


const NodeKickRequest = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|NodeKickRequest} packet.
     *  @typedef {object} PacketScribe.NodeKickRequestDetails
     *  @property {Uuid} nodeID - The avatar's session ID.
     *  @property {ModerationFlags.BanFlagsValue} banFlags - The methods of kicking (banning).
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|NodeKickRequest} packet, ready for sending.
     *  @function PacketScribe.NodeKickRequest&period;write
     *  @param {PacketScribe.NodeKickRequestDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: NodeKickRequestDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::muteNodeBySessionID(const QUuid& nodeID)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const packet = NLPacket.create(PacketType.NodeKickRequest, Uuid.NUM_BYTES_RFC4122_UUID + 4, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        data.setBigUint128(dataPosition, info.nodeID.value(), UDT.BIG_ENDIAN);
        dataPosition += 16;

        data.setUint32(dataPosition, info.banFlags, UDT.LITTLE_ENDIAN);
        dataPosition += 4;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default NodeKickRequest;
export type { NodeKickRequestDetails };
