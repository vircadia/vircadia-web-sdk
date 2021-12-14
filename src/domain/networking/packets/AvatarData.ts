//
//  AvatarData.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import NLPacket from "../NLPacket";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import { AvatarDataDetail } from "../../avatars/AvatarData";
import AvatarDataPacket from "../../avatars/AvatarDataPacket";
import assert from "../../shared/assert";
import { quat } from "../../shared/Quat";
import { vec3 } from "../../shared/Vec3";
import GLMHelpers from "../../shared/GLMHelpers";


type AvatarDataDetails = {

    // Packet writing.
    sequenceNumber: number,  // C++  AvatarDataSequenceNumber = uint16_t
    dataDetail: AvatarDataDetail,
    lastSentTime: number,
    // WEBRTC TODO: Address further C++ code - JointData.
    // sendStatus: SendStatus, - Not used in user client.
    dropFaceTracking: boolean,
    distanceAdjust: boolean,
    viewerPosition: vec3,
    // sentJointDataOut: JointData[], - Not used in user client.
    // maxDataSize: number, - Always 0 in user client.
    // WEBRTC TODO: Address further C++ code - AvatarDataRate.

    // Avatar data.
    globalPosition: vec3 | undefined,
    globalOrientation: quat | undefined
};


const AvatarData = new class {
    // C++  N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} an {@link PacketType(1)|AvatarData} packet. Not all properties are
     *  necessarily needed &mdash; those not needed may be <code>undefined</code>.
     *  @typedef {object} PacketScribe.AvatarDataDetails
     *  @param {SequenceNumber} sequenceNumber - The 2-byte sequence number of the avatar data. This increments each time an
     *      AvatarData packet is sent.
     *  @property {AvatarDataDetail} dataDetail - The level of detail to send.
     *  @property {number} lastSentTime - The last time that an AvatarData packet was sent, as the number of milliseconds since
     *      1 Jan 1970.
     *  @property {boolean} dropFaceTracking
     *  @property {boolean} distanceAdjust
     *  @property {vec3} viewerPosition
     *
     *  @property {vec3|undefined} globalPosition - The avatar's position in the domain.
     *  @property {quat|undefined} globalOrientation - The avatar's orientation in the domain.
     */


    /*@devdoc
     *  Writes an {@link PacketType(1)|AvatarData} packet, ready for sending.
     *  @function PacketScribe.AvatarData&period;write
     *  @param {PacketScribe.AvatarDataDetails} info - The information needed for writing the packet.
     *  @returns {NLPacket} The  packet, ready for sending, or a 0-sized packet if the requested data couldn't fit into a single
     *      packet.
     */
    write(info: AvatarDataDetails): NLPacket {  /* eslint-disable-line class-methods-use-this */
        //      QByteArray AvatarData::toByteArray(AvatarDataDetail dataDetail, quint64 lastSentTime,
        //          const QVector<JointData>& lastSentJointData, AvatarDataPacket::SendStatus& sendStatus,
        //          bool dropFaceTracking, bool distanceAdjust, glm::vec3 viewerPosition, QVector<JointData>* sentJointDataOut,
        //          int maxDataSize, AvatarDataRate* outboundDataRateOut)

        // In the user client, sendStatus is not used externally so we can just create it here for internal use.
        const sendStatus = {
            itemFlags: 0,
            sendUUID: false,
            rotationsSent: 0,
            translationsSent: 0
        };

        const packet = NLPacket.create(PacketType.AvatarData);
        const messageData = packet.getMessageData();
        const data = messageData.data;
        let dataPosition = messageData.dataPosition;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        // There may be too much data to fit in the packet. Catch this error and signal that it occurred by setting the packet
        // size to 0.

        try {

            data.setUint16(dataPosition, info.sequenceNumber, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            // const cullSmallChanges = info.dataDetail === AvatarDataDetail.CullSmallData;
            // const sendAll = info.dataDetail === AvatarDataDetail.SendAllData;
            // const sendMinimum = info.dataDetail === AvatarDataDetail.MinimumData;
            const sendPALMinimum = info.dataDetail === AvatarDataDetail.PALMinimum;

            // lazyInitHeadData(); - Is called in AvatarData.sendAvatarDataPacket().

            // maxDataSize is always - in user client.

            // Leading flags, to indicate how much data is actually included in the packet.
            let wantedFlags = 0;
            let includedFlags = 0;
            // let extraReturnedFlags = 0;  // For partial joint data.

            // Special case, if we were asked for no data, then just include the flags all set to nothing.
            if (info.dataDetail === AvatarDataDetail.NoData) {
                // This shouldn't occur in the client.
                console.error("Invalid client code path!");
            }

            if (sendStatus.itemFlags === 0) {
                // New avatar...
                const hasAvatarGlobalPosition = info.globalPosition !== undefined;
                const hasAvatarOrientation = info.globalOrientation !== undefined;
                const hasAvatarBoundingBox = false;
                const hasAvatarScale = false;
                const hasLookAtPosition = false;
                const hasAudioLoudness = false;
                const hasSensorToWorldMatrix = false;
                const hasJointData = false;
                const hasJointDefaultPoseFlags = false;
                const hasAdditionalFlags = false;

                // local position, and parent info only apply to avatars that are parented. The local position
                // and the parent info can change independently though, so we track their "changed since"
                // separately
                const hasParentInfo = false;
                const hasAvatarLocalPosition = false;
                const hasHandControllers = false;

                const hasFaceTrackerInfo = false;

                if (sendPALMinimum) {
                    // hasAudioLoudness = true;
                } else {
                    // WEBRTC TODO: Address further C++ code - Further avatar properties.
                    // hasAvatarOrientation = sendAll || info.avatarData.rotationChangedSince(info.lastSentTime);
                    // hasAvatarBoundingBox = sendAll || avatarBoundingBoxChangedSince(lastSentTime);
                    // hasAvatarScale = sendAll || avatarScaleChangedSince(lastSentTime);
                    // hasLookAtPosition = sendAll || lookAtPositionChangedSince(lastSentTime);
                    // hasAudioLoudness = sendAll || audioLoudnessChangedSince(lastSentTime);
                    // hasSensorToWorldMatrix = sendAll || sensorToWorldMatrixChangedSince(lastSentTime);
                    // hasAdditionalFlags = sendAll || additionalFlagsChangedSince(lastSentTime);
                    // hasParentInfo = sendAll || parentInfoChangedSince(lastSentTime);
                    // hasAvatarLocalPosition = hasParent() && (sendAll ||
                    //     tranlationChangedSince(lastSentTime) ||
                    //     parentInfoChangedSince(lastSentTime));
                    // hasHandControllers = _controllerLeftHandMatrixCache.isValid()
                    //     || this.#_controllerRightHandMatrixCache.isValid();
                    // hasFaceTrackerInfo = !dropFaceTracking && (getHasScriptedBlendshapes()
                    //     || this.#_headData._hasInputDrivenBlendshapes) &&
                    //     (sendAll || faceTrackerInfoChangedSince(lastSentTime));
                    // hasJointData = !sendMinimum;
                    // hasJointDefaultPoseFlags = hasJointData;
                }

                wantedFlags
                    = (hasAvatarGlobalPosition ? AvatarDataPacket.PACKET_HAS_AVATAR_GLOBAL_POSITION : 0)
                    | (hasAvatarBoundingBox ? AvatarDataPacket.PACKET_HAS_AVATAR_BOUNDING_BOX : 0)
                    | (hasAvatarOrientation ? AvatarDataPacket.PACKET_HAS_AVATAR_ORIENTATION : 0)
                    | (hasAvatarScale ? AvatarDataPacket.PACKET_HAS_AVATAR_SCALE : 0)
                    | (hasLookAtPosition ? AvatarDataPacket.PACKET_HAS_LOOK_AT_POSITION : 0)
                    | (hasAudioLoudness ? AvatarDataPacket.PACKET_HAS_AUDIO_LOUDNESS : 0)
                    | (hasSensorToWorldMatrix ? AvatarDataPacket.PACKET_HAS_SENSOR_TO_WORLD_MATRIX : 0)
                    | (hasAdditionalFlags ? AvatarDataPacket.PACKET_HAS_ADDITIONAL_FLAGS : 0)
                    | (hasParentInfo ? AvatarDataPacket.PACKET_HAS_PARENT_INFO : 0)
                    | (hasAvatarLocalPosition ? AvatarDataPacket.PACKET_HAS_AVATAR_LOCAL_POSITION : 0)
                    | (hasHandControllers ? AvatarDataPacket.PACKET_HAS_HAND_CONTROLLERS : 0)
                    | (hasFaceTrackerInfo ? AvatarDataPacket.PACKET_HAS_FACE_TRACKER_INFO : 0)
                    | (hasJointData ? AvatarDataPacket.PACKET_HAS_JOINT_DATA : 0)
                    | (hasJointDefaultPoseFlags ? AvatarDataPacket.PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS : 0)
                    | (hasJointData ? AvatarDataPacket.PACKET_HAS_GRAB_JOINTS : 0);

                sendStatus.itemFlags = wantedFlags;
                sendStatus.rotationsSent = 0;
                sendStatus.translationsSent = 0;
            } else {
                // This shouldn't occur in the client.
                console.error("Invalid client code path!");
            }

            // WEBRTC TODO: Address further C++ code - Grab joints.

            // WEBRTC TODO: Address further C++ code - Parent ID.

            const packetEnd = data.byteLength;


            if (sendStatus.sendUUID) {
                // This shouldn't occur in the client.
                console.error("Invalid client code path!");
            }

            // Reserve space for packet flags to be written later.
            const packetFlagsLocation = dataPosition;
            dataPosition += 2;


            const avatarSpace = (flag: number, space: number) => {
                if (wantedFlags & flag && packetEnd - dataPosition >= space) {
                    includedFlags |= flag;
                    return true;
                }
                return false;
            };


            if (avatarSpace(AvatarDataPacket.PACKET_HAS_AVATAR_GLOBAL_POSITION, 12)) {
                const globalPosition = info.globalPosition;
                assert(globalPosition !== undefined);
                data.setFloat32(dataPosition, globalPosition.x, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
                data.setFloat32(dataPosition, globalPosition.y, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
                data.setFloat32(dataPosition, globalPosition.z, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
                // WEBRTC TODO: Address further C++ code - Outbound data rate.
            }

            // WEBRTC TODO: Address further C++ code - PACKET_HAS_AVATAR_BOUNDING_BOX.

            // WEBRTC TODO: Address further C++ code - PACKET_HAS_AVATAR_ORIENTATION.
            if (avatarSpace(AvatarDataPacket.PACKET_HAS_AVATAR_ORIENTATION, 6)) {
                GLMHelpers.packOrientationQuatToSixBytes(data, dataPosition, info.globalOrientation!);
                dataPosition += 6;
                // WEBRTC TODO: Address further C++ code - Outbound data rate.
            }

            // WEBRTC TODO: Address further C++ code - PACKET_HAS_AVATAR_SCALE.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_LOOK_AT_POSITION.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_AUDIO_LOUDNESS.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_SENSOR_TO_WORLD_MATRIX.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_ADDITIONAL_FLAGS.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_PARENT_INFO.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_AVATAR_LOCAL_POSITION.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_HAND_CONTROLLERS.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_FACE_TRACKER_INFO.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_JOINT_DATA.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS.

            // Write the included flags.
            data.setUint16(packetFlagsLocation, includedFlags, UDT.LITTLE_ENDIAN);

            // We don't need to return dropped items in sendStatus for the user client.

            messageData.dataPosition = dataPosition;
            messageData.packetSize = dataPosition;

        } catch (error) {
            if (error instanceof Error && error.name === "RangeError") {
                // We've tried writing beyond the end of the packet.
                messageData.dataPosition = 0;
                messageData.packetSize = 0;
            } else {
                // Unexpected error - re-throw.
                throw error;
            }
        }

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return packet;
    }

}();

export default AvatarData;
export type { AvatarDataDetails };
