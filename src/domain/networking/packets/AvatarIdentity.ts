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
    // No attachment data - attachments are deprecated in favor of avatar entities.
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

        // AttachmentData is deprecated; just write the number of attachments as 0.
        packetList.writePrimitive(0, 4);

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

    /*@devdoc
     *  Reads a {@link PacketType(1)|AvatarIdentity} multi-packet message containing the identity details of one or more
     *  avatars.
     *  @function PacketScribe.AvatarIdentity&period;read
     *  @param {DataView} data - The AvatarIdentity message data to read.
     *  @returns {PacketScribe.AvatarIdentityDetails[]} The information obtained from reading the message.
     */
    read(data: DataView): AvatarIdentityDetails[] {  /* eslint-disable-line class-methods-use-this */
        // C++  void AvatarHashMap::processAvatarIdentityPacket(ReceivedMessage* message, Node* sendingNode)
        //      void AvatarData::processAvatarIdentity(QDataStream& packetStream, bool& identityChanged,
        //          bool & displayNameChanged)

        const avatarIdentityDetailsList: AvatarIdentityDetails[] = [];

        const textDecoder = new TextDecoder("utf-16be");

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;
        let byteLength = 0;

        while (dataPosition < data.byteLength - data.byteOffset) {
            const sessionUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 16;

            const identitySequenceNumber = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 4;

            // AttachmentData is deprecated, however we need to read over it in case it is sent.
            const numAttachments = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 4;
            if (numAttachments > 0) {
                console.warn("[networking] Unexpected attachment data in AvatarIdentity packet.");
            }
            for (let i = 0; i < numAttachments; i++) {
                // Skip over model URL (length plus characters).
                byteLength = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
                dataPosition += byteLength;
                // Skip over joint name (length plus characters).
                byteLength = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
                dataPosition += byteLength;
                // Skip over translation (x, y, z floats).
                dataPosition += 12;
                // Skip over rotation (x, y, z, w floats);
                dataPosition += 16;
                // Skip over scale (float).
                dataPosition += 4;
                // Skip over isSoft (boolean).
                dataPosition += 1;
            }

            byteLength = data.getInt32(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 4;
            let displayName = null;
            if (byteLength >= 0) {  // byteLength === -1 for null value.
                displayName = textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, byteLength));
                dataPosition += byteLength;
            }

            byteLength = data.getInt32(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 4;
            let sessionDisplayName = null;
            if (byteLength >= 0) {  // byteLength === -1 for null value.
                sessionDisplayName = textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, byteLength));
                dataPosition += byteLength;
            }

            const identityFlags = data.getUint32(dataPosition, UDT.BIG_ENDIAN);
            dataPosition += 4;
            const isReplicated = (identityFlags & IdentityFlag.isReplicated) > 0;
            const lookAtSnapping = (identityFlags & IdentityFlag.lookAtSnapping) > 0;
            const verificationFailed = (identityFlags & IdentityFlag.verificationFailed) > 0;

            avatarIdentityDetailsList.push({
                sessionUUID,
                identitySequenceNumber,
                displayName,
                sessionDisplayName,
                isReplicated,
                lookAtSnapping,
                verificationFailed
            });
        }

        return avatarIdentityDetailsList;
    }

}();

export default AvatarIdentity;
export type { AvatarIdentityDetails };
