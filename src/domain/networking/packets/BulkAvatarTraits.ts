//
//  BulkAvatarTraits.ts
//
//  Created by David Rowe on 28 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";


type BulkAvatarTraitsDetails = {
    traitSequenceNumber: bigint
};


const BulkAvatarTraits = new class {
    // C++  N/A

    /*@devdoc
     *  Avatar traits information {@link PacketScribe|read} from a {@link PacketType(1)|BulkAvatarTraits} message.
     *  @typedef {object} PacketScribe.BulkAvatarTraitsDetails
     *  @property {bigint} sequenceID - The avatar traits message sequence number.
     */


    /*@devdoc
     *  Reads a {@link PacketType(1)|BulkAvatarTraits} packet.
     *  @function PacketScribe.BulkAvatarTraits&period;read
     *  @param {DataView} data - The BulkAvatarTraits message data to read.
     *  @returns {PacketScribe.BulkAvatarTraitsDetails} The traits information obtained from reading the packet.
     */
    read(data: DataView): BulkAvatarTraitsDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void AvatarHashMap::processBulkAvatarTraits(ReceivedMessage* message, Node* sendingNode)

        let dataPosition = 0;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const traitSequenceNumber = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 8;

        // WEBRTC TODO: Read further data.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        // WEBRTC TODO: Assert at end of packet.

        return {
            traitSequenceNumber
        };
    }

}();

export default BulkAvatarTraits;
export type { BulkAvatarTraitsDetails };
