//
//  MixedAudio.ts
//
//  Created by David Rowe on 14 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import AudioConstants from "../../audio/AudioConstants";


type MixedAudioDetails = {
    sequenceNumber: number,
    codecName: string,
    numAudioSamples: number,
    audioBuffer: Uint8Array
};


const MixedAudio = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|MixedAudio} packet.
     *  @typedef {object} PacketScribe.MixedAudioDetails
     *  @property {number} sequenceNumber - The sequence number of the audio packet. It starts at <code>0</code> for each
     *      connection to the audio mixer, incrementing each time an audio packet is sent. The value wraps around to
     *      <code>0</code> after <code>65535</code>.</p>
     *      <p>The sequence number for the audio mixer sending audio packets to the user client is shared among the following
     *      packets: <code>MixedAudio</code> and <code>SilentAudioFrame</code>.
     *  @property {string} codecName - The name of the audio codec used, e.g., <code>"opus"</code>.
     *  @property {number} numAudioSamples - The number of audio samples in the packet. This number is always <code>240</code>
     *      and the samples are always stereo.
     *  @property {Uint8Array} audioBuffer - The encoded audio data comprising the samples.
     */

    /*@devdoc
     *  Reads a {@link PacketType(1)|MixedAudio} packet.
     *  @function PacketScribe.MixedAudio&period;read
     *  @param {DataView} data - The {@link Packets|MixedAudio} message data to read.
     *  @returns {PacketScribe.MixedAudioDetails} The mixed audio information.
     */
    read(data: DataView): MixedAudioDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  int InboundAudioStream::parseData(ReceivedMessage& message)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        const textDecoder = new TextDecoder();

        let dataPosition = 0;

        const sequenceNumber = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        const codecNameSize = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        const codecName = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, codecNameSize));
        dataPosition += codecNameSize;

        const numAudioSamples = AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL;

        const audioBuffer = new Uint8Array(data.buffer, data.byteOffset + dataPosition);

        /* eslint-ENable @typescript-eslint/no-magic-numbers */

        return {
            sequenceNumber,
            codecName,
            numAudioSamples,
            audioBuffer
        };

    }

}();

export default MixedAudio;
export type { MixedAudioDetails };
