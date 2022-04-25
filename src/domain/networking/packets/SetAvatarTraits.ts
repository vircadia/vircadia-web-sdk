//
//  SetAvatarTraits.ts
//
//  Created by Julien Merzoug on 6 Apr 2022.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { TraitType, ClientTraitStatus } from "../../avatars/AvatarTraits";
import NLPacketList from "../NLPacketList";
import PacketTypeValue from "../udt/PacketHeaders";

type SetAvatarTraitsDetails = {
    // TODO julien: doc
    currentTraitVersion: number;
    skeletonModelURL: string;
    traitStatuses: Array<ClientTraitStatus>;
    initialSend: boolean;
};

const SetAvatarTraits = new class {
    // C++ N/A

    write(_info: SetAvatarTraitsDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        const textEncoder = new TextEncoder();

        const packetList = NLPacketList.create(PacketTypeValue.SetAvatarTraits, null, true, true);

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        packetList.writePrimitive(_info.currentTraitVersion, 4);

        for (const [index, traitStatus] of _info.traitStatuses.entries()) {
            if (_info.initialSend || traitStatus === ClientTraitStatus.Updated) {
                const traitType = index;

                if (traitType === TraitType.SkeletonModelURL) {
                    packetList.writePrimitive(TraitType.SkeletonModelURL, 1);
                    const encodedUrl = textEncoder.encode(_info.skeletonModelURL);
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
