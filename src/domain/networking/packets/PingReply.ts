//
//  PingReply.ts
//
//  Created by David Rowe on 7 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type PingReplyDetails = {
    pingType: number,
    timestampPing: bigint,
    timestampReply: bigint
};


const PingReply = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|PingReply} packet.
     *  @typedef {object} PacketScribe.PingReplyDetails
     *  @property {PingType} pingType - The type of ping.
     *  @property {bigint} timestampPing - The time at which the originating ping packet was created, in usec.
     *  @property {bigint} timestampReply - The time at which the ping reply packet was created, in usec.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|PingReply} packet, ready for sending.
     *  @function PacketScribe.PingReply&period;write
     *  @param {PacketScribe.PingReplyDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: PingReplyDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  NLPacket* LimitedNodeList::constructPingReplyPacket(ReceivedMessage& message)

        const packet = NLPacket.create(PacketType.PingReply);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint8(dataPosition, info.pingType);
        dataPosition += 1;
        data.setBigUint64(dataPosition, info.timestampPing, UDT.BIG_ENDIAN);
        dataPosition += 8;
        data.setBigUint64(dataPosition, info.timestampReply, UDT.BIG_ENDIAN);
        dataPosition += 8;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default PingReply;
export type { PingReplyDetails };
