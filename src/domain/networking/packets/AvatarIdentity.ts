//
//  AvatarIdentity.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacketList from "../NLPacketList";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import { IdentityFlag } from "../../avatars/AvatarData";
import Uuid from "../../shared/Uuid";


type AvatarIdentityDetails = {
    sessionUUID: Uuid,
    identitySequenceNumber: number,
    attachmentData: Array<any>,
    displayName: string | null,
    sessionDisplayName: string | null,
    isReplicated: boolean,
    lookAtSnapping: boolean,
    verificationFailed: boolean
};


const AvatarIdentity = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} an {@link PacketType(1)|AvatarIdentity} packet.
     *  @typedef {object} PacketScribe.AvatarIdentityDetails
     *  @property {Uuid} sessionUUID - The session UUID assigned to the avatar by the domain server.
     *  @property {number} identitySequenceNumber - The sequence number of the avatar identity. Increments each time the
     *      AvatarIdentity data changes.
     *  @property {Array<Attachment>} attachmentData - The avatar attachments.
     *  @property {string|null} displayName - The avatar's display name.
     *  @property {string|null} sessionDisplayName - The avatar's session display name, assigned by the domain server. It is
     *      unique among all avatars present in the domain.
     *  @property {boolean} isReplicated
     *  @property {boolean} lookAtSnapping
     *  @property {boolean} verificationFailed
     */


    /*@devdoc
     *  Writes an {@link PacketType(1)|AvatarIdentity} packet list, ready for sending.
     *  @function PacketScribe.AvatarIdentity&period;write
     *  @param {PacketScribe.AvatarIdentityDetails} info - The information needed for writing the packet list.
     *  @returns {NLPacketList}
     */
    write(info: AvatarIdentityDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  int AvatarData::sendIdentityPacket()
        //      QByteArray AvatarData::identityByteArray(bool setIsReplicated)

        const packetList = NLPacketList.create(PacketType.AvatarIdentity, null, true, true);

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        packetList.writePrimitive(info.sessionUUID);
        packetList.writePrimitive(info.identitySequenceNumber, 4, UDT.BIG_ENDIAN);

        if (info.attachmentData.length > 0) {
            console.warn("Writing attachment data in AvatarIdentity packet not implemented!");
        }
        packetList.writePrimitive(0, 4);  // Attachment data length = 0.

        packetList.writeString(info.displayName, UDT.BIG_ENDIAN);
        packetList.writeString(info.sessionDisplayName, UDT.BIG_ENDIAN);

        let identityFlags = IdentityFlag.none;
        if (info.isReplicated) {
            identityFlags |= IdentityFlag.isReplicated;
        }
        if (info.lookAtSnapping) {
            identityFlags |= IdentityFlag.lookAtSnapping;
        }
        if (info.verificationFailed) {
            identityFlags |= IdentityFlag.verificationFailed;
        }
        packetList.writePrimitive(identityFlags, 4, UDT.BIG_ENDIAN);

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return packetList;
    }

}();

export default AvatarIdentity;
export type { AvatarIdentityDetails };
