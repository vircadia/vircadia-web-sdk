//
//  MicrophoneAudioNoEcho.ts
//
//  Created by David Rowe on 26 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import assert from "../../shared/assert";
import { vec3 } from "../../shared/Vec3";
import { quat } from "../../shared/Quat";


type MicrophoneAudioNoEchoDetails = {
    sequenceNumber: number,
    codecName: string,
    isStereo: boolean,
    audioPosition?: vec3,
    audioOrientation?: quat,
    avatarBoundingBoxCorner?: vec3,
    avatarBoundingBoxScale?: vec3,
    audioBuffer: Uint8Array
};


const MicrophoneAudioNoEcho = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|MicrophoneAudioNoEcho} packet.
     *  @typedef {object} PacketScribe.MicrophoneAudioNoEchoDetails
     *  @property {number} sequenceNumber - The sequence number of the audio packet. It starts at <code>0</code> for each
     *      connection to the audio mixer, incrementing each time an audio packet is sent. The value wraps around to
     *      <code>0</code> after <code>65535</code>.</p>
     *      <p>The sequence number for the client sending audio packets to the audio mixer is shared among the following
     *      packets: <code>MicrophoneAudioWithEcho</code>, <code>MicrophoneAudioNoEcho</code>, and
     *      <code>SilentAudioFrame</code>.
     *      The sequence number for the audio mixer sending audio packets to the user client is shared among the following
     *      packets: <code>MixedAudio</code> and <code>MicrophoneAudioNoEcho</code>.
     *  @property {string} codecName - The name of the audio codec used, e.g., <code>"opus"</code>.
     *  @property {boolean} isStereo - <code>true</code> if the audio data is stereo, <code>false</code> if mono.
     *  @property {vec3} [audioPosition] - The position of the audio source in the domain. The user client sends this to the
     *      audio mixer.
     *  @property {quat} [audioOrientation] - The orientation of the audio source in the domain. The user client sends this to
     *      the audio mixer.
     *  @property {vec3} [avatarBoundingBoxCorner] - The position of the minimum-xyz corner of the axis-aligned bounding box
     *      containing the user's avatar. The user client sends this to the audio mixer.
     *  @property {vec3} [avatarBoundingBoxScale] - The size of the axis-aligned bounding box containing the user's avatar. The
     *      user client sends this to the audio mixer.
     *  @property {Uint8Array} audioBuffer - The encoded audio data comprising the samples per the {@link AudioConstants},
     *      i.e., 240 frames being 10ms of audio data. The number of bytes depends on the number of channels and the codec used
     *      &mdash; e.g., 960 bytes for PCM stereo (240 frames, each a stereo pair of 2-byte samples), significantly fewer bytes
     *      for other codecs.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|MicrophoneAudioNoEcho} packet, ready for sending.
     *  @function PacketScribe.MicrophoneAudioNoEcho&period;write
     *  @param {PacketScribe.MicrophoneAudioNoEchoDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The packet, ready for sending.
     */
    write(info: MicrophoneAudioNoEchoDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void AbstractAudioInterface::emitAudioPacket(const void* audioData, size_t bytes, quint16& sequenceNumber,
        //      bool isStereo, const Transform& transform, glm::vec3 avatarBoundingBoxCorner, glm::vec3 avatarBoundingBoxScale,
        //      PacketType packetType, QString codecName)

        const packet = NLPacket.create(PacketType.MicrophoneAudioNoEcho);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        data.setUint16(dataPosition, info.sequenceNumber, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        const codecName = info.codecName;
        data.setUint32(dataPosition, codecName.length, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        for (let i = 0, length = codecName.length; i < length; i++) {
            data.setUint8(dataPosition, codecName.charCodeAt(i));
            dataPosition += 1;
        }

        data.setUint8(dataPosition, info.isStereo ? 1 : 0);
        dataPosition += 1;

        assert(info.audioPosition !== undefined && info.audioOrientation !== undefined
            && info.avatarBoundingBoxCorner !== undefined && info.avatarBoundingBoxScale !== undefined);

        data.setFloat32(dataPosition, info.audioPosition.x, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.audioPosition.y, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.audioPosition.z, UDT.LITTLE_ENDIAN);
        dataPosition += 4;

        data.setFloat32(dataPosition, info.audioOrientation.x, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.audioOrientation.y, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.audioOrientation.z, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.audioOrientation.w, UDT.LITTLE_ENDIAN);
        dataPosition += 4;

        data.setFloat32(dataPosition, info.avatarBoundingBoxCorner.x, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.avatarBoundingBoxCorner.y, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.avatarBoundingBoxCorner.z, UDT.LITTLE_ENDIAN);
        dataPosition += 4;

        data.setFloat32(dataPosition, info.avatarBoundingBoxScale.x, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.avatarBoundingBoxScale.y, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        data.setFloat32(dataPosition, info.avatarBoundingBoxScale.z, UDT.LITTLE_ENDIAN);
        dataPosition += 4;

        const dataArray = new Uint8Array(data.buffer);
        dataArray.set(info.audioBuffer, dataPosition);
        dataPosition += info.audioBuffer.byteLength;

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default MicrophoneAudioNoEcho;
export type { MicrophoneAudioNoEchoDetails };
