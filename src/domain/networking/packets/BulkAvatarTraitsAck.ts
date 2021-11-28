//
//  BulkAvatarTraitsAck.ts
//
//  Created by David Rowe on 28 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type BulkAvatarTraitsAckDetails = {
    traitSequenceNumber: bigint
};


const BulkAvatarTraitsAck = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|BulkAvatarTraitsAck} packet.
     *  @typedef {object} PacketScribe.BulkAvatarTraitsAckDetails
     *  @property {bigint} traitSequenceNumber - The sequence number of the avatar traits message being acknowledged.
     */

    /*@devdoc
     *  Writes a {@link PacketType(1)|BulkAvatarTraitsAck} packet, ready for sending.
     *  @function PacketScribe.BulkAvatarTraitsAck&period;write
     *  @param {PacketScribe.BulkAvatarTraitsAckDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: BulkAvatarTraitsAckDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void AvatarHashMap::processBulkAvatarTraits(ReceivedMessage* message, Node* sendingNode)

        const TRAIT_SEQ_NUM_BYTES = 8;
        const packet = NLPacket.create(PacketType.BulkAvatarTraitsAck, TRAIT_SEQ_NUM_BYTES, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setBigUint64(dataPosition, info.traitSequenceNumber, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default BulkAvatarTraitsAck;
export type { BulkAvatarTraitsAckDetails };
