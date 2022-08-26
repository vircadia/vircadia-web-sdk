//
//  PerAvatarGainSet.ts
//
//  Created by David Rowe on 10 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioHelpers from "../../shared/AudioHelpers";
import Uuid from "../../shared/Uuid";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type PerAvatarGainSetDetails = {
    id: Uuid,
    gain: number
};


const PerAvatarGainSet = new class {

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} an {@link PacketType(1)|PerAvatarGainSet} packet.
     *  @typedef {object} PacketScribe.PerAvatarGainSetDetails
     *  @property {Uuid} id - The avatar's session ID, or <code>Uuid.NULL</code> to set the master avatar gain.
     *  @property {number} gain - The gain to set, in dB.
     */


    /*@devdoc
     *  Writes an {@link PacketType(1)|PerAvatarGainSet} packet, ready for sending.
     *  @function PacketScribe.PerAvatarGainSet&period;write
     *  @param {PacketScribe.PerAvatarGainSetDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: PerAvatarGainSetDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void NodeList::setAvatarGain(const QUuid& nodeID, float gain)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const packet = NLPacket.create(PacketType.PerAvatarGainSet, Uuid.NUM_BYTES_RFC4122_UUID + 4, true);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        data.setBigUint128(dataPosition, info.id.value(), UDT.BIG_ENDIAN);
        dataPosition += 16;

        data.setUint8(dataPosition, AudioHelpers.packFloatGainToByte(2 ** (info.gain / 6.02059991)));
        dataPosition += 1;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default PerAvatarGainSet;
export type { PerAvatarGainSetDetails };
