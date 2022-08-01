//
//  SelectedAudioFormat.ts
//
//  Created by David Rowe on 10 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../udt/UDT";
import assert from "../../shared/assert";


type SelectedAudioFormatDetails = {
    selectedCodecName: string
};


const SelectedAudioFormat = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} a {@link PacketType(1)|SelectedAudioFormat} packet.
     *  @typedef {object} PacketScribe.SelectedAudioFormatDetails
     *  @property {string} selectedCodecName - The name of the audio codec selected for use.
     */


    /*@devdoc
     *  Reads a {@link PacketType(1)|SelectedAudioFormat} packet.
     *  @function PacketScribe.SelectedAudioFormat&period;read
     *  @param {DataView} data - The {@link Packets|SelectedAudioFormat} message data to read.
     *  @returns {PacketScribe.SelectedAudioFormatDetails} The audio codec selected for use.
     */
    read(data: DataView): SelectedAudioFormatDetails {  /* eslint-disable-line class-methods-use-this */
        // C++  void AudioClient::handleSelectedAudioFormat(ReceivedMessage* message)

        const textDecoder = new TextDecoder();

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const selectedCodecNameSize = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        const selectedCodecName = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition,
            selectedCodecNameSize));
        dataPosition += selectedCodecNameSize;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        assert(dataPosition === data.byteLength, "ERROR: Length mismatch reading SelectedAudioFormat packet!");

        return {
            selectedCodecName
        };
    }

}();

export default SelectedAudioFormat;
export type { SelectedAudioFormatDetails };
