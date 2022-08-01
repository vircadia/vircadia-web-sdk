//
//  AvatarQuery.ts
//
//  Created by David Rowe on 10 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ConicalViewFrustum } from "../../shared/Camera";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import GLMHelpers from "../../shared/GLMHelpers";


type AvatarQueryDetails = {
    conicalViews: ConicalViewFrustum[]
};


const AvatarQuery = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} an {@link PacketType(1)|AvatarQuery} packet.
     *  @typedef {object} PacketScribe.AvatarQueryDetails
     *  @property {ConicalViewFrustum[]} conicalViews - The views that the client wants the details of avatars in.
     */


    /*@devdoc
     *  Writes an {@link PacketType(1)|AvatarIdentity} packet, ready for sending.
     *  @function PacketScribe.AvatarQuery&period;write
     *  @param {PacketScribe.AvatarQueryDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: AvatarQueryDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void Application::queryAvatars()
        //      int ConicalViewFrustum::serialize()

        const packet = NLPacket.create(PacketType.AvatarQuery);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint8(dataPosition, info.conicalViews.length);
        dataPosition += 1;

        for (const conicalView of info.conicalViews) {
            const position = conicalView.position;
            data.setFloat32(dataPosition, position.x, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, position.y, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, position.z, UDT.LITTLE_ENDIAN);
            dataPosition += 4;

            const direction = conicalView.direction;
            data.setFloat32(dataPosition, direction.x, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, direction.y, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            data.setFloat32(dataPosition, direction.z, UDT.LITTLE_ENDIAN);
            dataPosition += 4;

            GLMHelpers.packFloatAngleToTwoByte(data, dataPosition, conicalView.halfAngle);
            dataPosition += 2;
            GLMHelpers.packClipValueToTwoByte(data, dataPosition, conicalView.farClip);
            dataPosition += 2;
            data.setFloat32(dataPosition, conicalView.centerRadius, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default AvatarQuery;
export type { AvatarQueryDetails };
