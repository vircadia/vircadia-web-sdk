//
//  SetAvatarTraits.ts
//
//  Created by Julien Merzoug on 6 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarTraits from "../../avatars/AvatarTraits";
import { ClientTraitStatus } from "../../avatars/ClientTraitsHandler";
import NLPacketList from "../NLPacketList";
import PacketTypeValue from "../udt/PacketHeaders";


type SetAvatarTraitsDetails = {
    currentTraitVersion: number;
    skeletonModelURL: string;
    traitStatuses: Array<ClientTraitStatus>;
    initialSend: boolean;
};


const SetAvatarTraits = new class {
    // C++ N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|SetAvatarTraits} packet list.
     *  @typedef {object} PacketScribe.SetAvatarTraitsDetails
     *  @property {number} currentTraitVersion - Trait sending sequence number. This should be incremented for each
     *      <code>SetAvatarTraits</code> packet written.
     *  @property {string} skeletonModelURL - The URL of avatar's FST, glTF, or FBX model file.
     *  @property {ClientTraitStatus[]} traitStatuses - The status of each avatar trait.
     *  @property {boolean} initialSend - <code>true</code> to send all traits, <code>false</code> to send only those that have
     *      been updated.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|SetAvatarTraits} packet list, ready for sending.
     *  @function PacketScribe.SetAvatarTraits&period;write
     *  @param {PacketScribe.SetAvatarTraitsDetails} info - The information needed for writing the packet list.
     *  @returns {NLPacketList} The packet list, ready for sending.
     */
    write(info: SetAvatarTraitsDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  ClientTraitsHandler::sendChangedTraitsToMixer()

        const textEncoder = new TextEncoder();

        const packetList = NLPacketList.create(PacketTypeValue.SetAvatarTraits, null, true, true);

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        packetList.writePrimitive(info.currentTraitVersion, 4);

        for (const [index, traitStatus] of info.traitStatuses.entries()) {
            if (info.initialSend || traitStatus === ClientTraitStatus.Updated) {
                const traitType = index;
                if (traitType === AvatarTraits.SkeletonModelURL) {
                    packetList.writePrimitive(AvatarTraits.SkeletonModelURL, 1);
                    const encodedUrl = textEncoder.encode(info.skeletonModelURL);
                    packetList.writePrimitive(encodedUrl.length, 2);
                    packetList.write(encodedUrl);
                }
            }
        }

        return packetList;
    }
}();

export default SetAvatarTraits;
export type { SetAvatarTraitsDetails };
