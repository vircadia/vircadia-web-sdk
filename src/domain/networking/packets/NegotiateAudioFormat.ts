//
//  NegotiateAudioFormat.ts
//
//  Created by David Rowe on 27 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import "../../shared/DataViewExtensions";


type NegotiateAudioFormatDetails = {
    codecs: Array<string>
};


const NegotiateAudioFormat = new class {

    /*@devdoc
     *  Information needed for {@link Packets|writing} a {@link PacketType(1)|NegotiateAudioFormat} packet.
     *  @typedef {object} PacketScribe.NegotiateAudioFormatDetails
     *  @property {string[]} codecs - The names of the audio codecs that the user client can use, e.g., <code>"opus"</code>.
     */

    /*@devdoc
     *  Writes a {@link PacketType(1)|NegotiateAudioFormat} packet, ready for sending.
     *  @function PacketScribe.NegotiateAudioFormat&period;write
     *  @param {PacketScribe.NegotiateAudioFormatDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket}
     */
    write(info: NegotiateAudioFormatDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void AudioClient::negotiateAudioFormat()

        const packet = NLPacket.create(PacketType.NegotiateAudioFormat);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint8(dataPosition, info.codecs.length);
        dataPosition += 1;

        for (const codec of info.codecs) {
            data.setUint32(dataPosition, codec.length, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
            for (let i = 0; i < codec.length; i++) {
                data.setUint8(dataPosition, codec.charCodeAt(i));
                dataPosition += 1;
            }
        }

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default NegotiateAudioFormat;
export type { NegotiateAudioFormatDetails };
