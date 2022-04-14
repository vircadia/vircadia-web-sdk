//
//  SetAvatarTraits.ts
//
//  Created by Julien Merzoug on 6 Apr 2022.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { TraitType } from "../../avatars/AvatarTraits";
import NLPacketList from "../NLPacketList";
import PacketTypeValue from "../udt/PacketHeaders";

type SetAvatarTraitsDetails = {
    currentTraitVersion: number;
    skeletonModelURL: string;
};

const SetAvatarTraits = new class {
    // TODO julien: doc

    write(_info: SetAvatarTraitsDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        const textEncoder = new TextEncoder();

        const packetList = NLPacketList.create(PacketTypeValue.SetAvatarTraits, null, true, true);

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        packetList.writePrimitive(_info.currentTraitVersion, 4);

        packetList.writePrimitive(TraitType.SkeletonModelURL, 1);
        const encodedUrl = textEncoder.encode(_info.skeletonModelURL);
        packetList.writePrimitive(encodedUrl.length, 2);
        packetList.write(encodedUrl);

        return packetList;
    }
}();

export default SetAvatarTraits;
export type { SetAvatarTraitsDetails };
