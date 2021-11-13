//
//  KillAvatar.ts
//
//  Created by David Rowe on 3 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";
import Uuid from "../../shared/Uuid";
import { KillAvatarReason } from "../../avatars/AvatarData";
import "../../shared/DataViewExtensions";


type KillAvatarDetails = {
    sessionUUID: Uuid,
    reason: KillAvatarReason
};


const KillAvatar = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|KillAvatar} packet.
     *  @typedef {object} PacketScribe.KillAvatarDetails
     *  @property {Uuid} sessionUUID - The session UUID that was assigned to the avatar by the domain server.
     *  @property {KillAvatarReason} reason - The reason the avatar was killed.
     */


    /*@devdoc
     *  Reads a {@link PacketType(1)|KillAvatar} packet.
     *  @function PacketScribe.KillAvatar&period;read
     *  @param {DataView} data - The {@link Packets|KillAvatar} message data to read.
     *  @returns {PacketScribe.KillAvatarDetails} The KillAvatar details.
     */
    read(data: DataView): KillAvatarDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::processKillAvatarPacket(ReceivedMessage* message, Node* sendingNode)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const sessionUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
        dataPosition += 16;
        const reason = data.getUint8(dataPosition);
        dataPosition += 1;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading KillAvatar packet!");

        return {
            sessionUUID,
            reason
        };
    }

}();

export default KillAvatar;
export type { KillAvatarDetails };
