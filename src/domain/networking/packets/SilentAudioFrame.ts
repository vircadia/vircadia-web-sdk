//
//  SilentAudioFrame.ts
//
//  Created by David Rowe on 11 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";
import AudioConstants from "../../audio/AudioConstants";
import { vec3 } from "../../shared/Vec3";
import { quat } from "../../shared/Quat";


type SilentAudioFrameDetails = {
    sequenceNumber: number,
    codecName: string,
    isStereo: boolean,
    audioPosition: vec3,
    audioOrientation: quat,
    avatarBoundingBoxCorner: vec3,
    avatarBoundingBoxScale: vec3
};


const SilentAudioFrame = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|SilentAudioFrame} packet.
     *  @typedef {object} PacketScribe.SilentAudioFrameDetails
     *  @property {number} sequenceNumber - The sequence number of the audio packet.
     *      <p>The sequence number starts at <code>0</code> each connection to the audio mixer and is shared among the following
     *      audio packets sent, incrementing each time one of these packets is sent: <code>MicrophoneAudioWithEcho</code>,
     *      <code>MicrophoneAudioNoEcho</code>, and <code>SilentAudioFrame</code>. The value wraps around to <code>0</code>
     *      after <code>65535</code>.</p>
     *  @property {string} codecName - The name of the audio codec used, e.g., <code>"opus"</code>.
     *  @property {boolean} isStereo - <code>true</code> if the audio stream is stereo, <code>false</code> if it is mono.
     *  @property {vec3} audioPosition - The position of the audio source or hearing position in the domain.
     *  @property {quat} audioOrientation - The orientation of the audio source or hearing position in the domain.
     *  @property {vec3} avatarBoundingBoxCorner - The position of the minimum-xyz corner of the axis-aligned bounding box
     *      containing the user's avatar.
     *  @property {vec3} avatarBoundingBoxScale - The size of the axis-aligned bounding box containing the user's avatar.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|SilentAudioFrame} packet, ready for sending.
     *  @function PacketScribe.SilentAudioFrame&period;write
     *  @param {PacketScribe.SilentAudioFrameDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket}
     */
    write(info: SilentAudioFrameDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        // C++  void AbstractAudioInterface::emitAudioPacket(const void* audioData, size_t bytes, quint16& sequenceNumber,
        //      bool isStereo, const Transform& transform, glm::vec3 avatarBoundingBoxCorner, glm:: vec3 avatarBoundingBoxScale,
        //      PacketType packetType, QString codecName)

        const packet = NLPacket.create(PacketType.SilentAudioFrame);
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

        const numSilentSamples = info.isStereo
            ? AudioConstants.NETWORK_FRAME_SAMPLES_STEREO
            : AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL;
        data.setUint16(dataPosition, numSilentSamples, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

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

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        messageData.dataPosition = dataPosition;
        messageData.packetSize = dataPosition;

        return packet;
    }

}();

export default SilentAudioFrame;
export type { SilentAudioFrameDetails };
