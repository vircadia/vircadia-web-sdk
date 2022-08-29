//
//  AvatarData.ts
//
//  Created by David Rowe on 29 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AvatarDataDetail } from "../../avatars/AvatarData";
import AvatarDataPacket from "../../avatars/AvatarDataPacket";
import assert from "../../shared/assert";
import AudioHelpers from "../../shared/AudioHelpers";
import BitVectorHelpers from "../../shared/BitVectorHelpers";
import GLMHelpers from "../../shared/GLMHelpers";
import Quat, { quat } from "../../shared/Quat";
import Vec3, { vec3 } from "../../shared/Vec3";
import PacketType from "../udt/PacketHeaders";
import UDT from "../udt/UDT";
import NLPacket from "../NLPacket";


type AvatarDataDetails = {

    // Packet writing.
    sequenceNumber: number,  // C++  AvatarDataSequenceNumber = uint16_t
    dataDetail: AvatarDataDetail,
    lastSentTime: number,
    // lastSentJointData: JointData[], - See lastSentJointRotations and lastSentJointTranslations, below.
    // sendStatus: SendStatus, - Not used in user client.
    // dropFaceTracking: boolean,
    // distanceAdjust: boolean, - Always false in user client.
    // viewerPosition: vec3, - Always 0, 0, 0 in user client, and not used.
    // sentJointDataOut: JointData[], - Not used in user client.
    // maxDataSize: number, - Always 0 in user client.
    // WEBRTC TODO: Address further C++ code - AvatarDataRate.

    // Avatar data.
    globalPosition: vec3 | undefined,
    localOrientation: quat | undefined,
    avatarScale: number | undefined,
    audioLoudness: number | undefined,
    jointRotations: Array<quat | null> | undefined,  // C++ doesn't have undefined case but it's useful for unit tests.
    jointTranslations: Array<vec3 | null> | undefined,    // Ditto.
    lastSentJointRotations: Array<quat | null> | undefined,
    lastSentJointTranslations: Array<vec3 | null> | undefined
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
     *
     *  @property {vec3|undefined} globalPosition - The avatar's position in the domain.<br />
     *      Should be <code>undefined</code> if not known, otherwise it should always be sent.
     *  @property {quat|undefined} localOrientation - The avatar's orientation.<br />
     *      Should be <code>undefined</code> if not known or the value hasn't changed since the last time the packet was sent.
     *  @property {number|undefined} avatarScale - The target scale of the avatar. The target scale is the desired scale of the
     *      avatar without any restrictions on permissible scale values imposed by the domain.<br />
     *      Should be <code>undefined</code> if not known or the value hasn't changed since the last time the packet was sent.
     *  @property {number|undefined} audioLoudness - The instantaneous loudness of the audio input that the avatar is injecting
     *      into the domain.
     *  @property {Array<quat|null>|undefined} jointRotations - The joint rotations relative to avatar space (i.e., not relative
     *      to parent bones). Set a rotation to <code>null</code> if the avatar's default pose's rotation should be used.
     *      May be <code>undefined</code> if the joints are not known.
     *      <p>Note: All of <code>jointRotations</code>, <code>jointTranslations</code>, <code>lastSentJointRotations</code>,
     *      and <code>lastSentJointTranslations</code> must be defined in order for any joint data to be sent.</p>
     *  @property {Array<vec3|null>|undefined} jointTranslations - The joint translations relative to their parent joints in
     *      avatar model coordinates. Set a translation to <code>null</code> if the avatar's default pose's translation should
     *      be used.
     *      May be <code>undefined</code> if the joints are not known.
     *      <p><strong>Warning:</strong> The avatar model coordinate system is not necessarily meters.</p>
     *  @property {Array<quat|null>|undefined} lastSentJointRotations - The most recently sent joint rotation values. If the
     *      current joint rotation is the same or nearly the same then it may not be sent in the packet.
     *      May be <code>undefined</code> if the joints are not known.
     *  @property {Array<quat|null>|undefined} lastSentJointTranslations - The most recently sent joint translation values. If
     *      the current joint translation is the same or nearly the same then it may not be sent in the packet.
     *      May be <code>undefined</code> if the joints are not known.
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
        //
        // Called with the following when sending data to the avatar mixer:
        // - dataDetail = value
        // - lastSentTime = value
        // - lastSentJointData = value
        // - sendStatus = default value
        // - dropFaceTracking = value
        // - distanceAdjust = false
        // - viewerPosition = 0, 0, 0
        // - sentJointData = null
        // - maxDataSize = 0
        // - outboundDataRate = value

        // In the user client, sendStatus is not used externally so we can just create it here for internal use.
        const sendStatus = {
            itemFlags: 0,
            sendUUID: false,
            rotationsSent: 0,
            translationsSent: 0
        };

        const TRANSLATION_COMPRESSION_RADIX = 14;
        const BITS_IN_BYTE = 8;
        const AUDIO_LOUDNESS_SCALE = 1024.0;

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

            const cullSmallChanges = info.dataDetail === AvatarDataDetail.CullSmallData;
            const sendAll = info.dataDetail === AvatarDataDetail.SendAllData;
            const sendMinimum = info.dataDetail === AvatarDataDetail.MinimumData;
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
                const hasAvatarGlobalPosition = info.globalPosition !== undefined;  // Should always be sent.
                let hasAvatarOrientation = false;
                const hasAvatarBoundingBox = false;
                let hasAvatarScale = false;
                const hasLookAtPosition = false;
                let hasAudioLoudness = false;
                const hasSensorToWorldMatrix = false;
                let hasJointData = false;
                let hasJointDefaultPoseFlags = false;
                const hasAdditionalFlags = false;

                // local position, and parent info only apply to avatars that are parented. The local position
                // and the parent info can change independently though, so we track their "changed since"
                // separately
                const hasParentInfo = false;
                const hasAvatarLocalPosition = false;
                const hasHandControllers = false;

                const hasFaceTrackerInfo = false;

                if (sendPALMinimum) {
                    // This shouldn't occur in the client.
                    console.error("Invalid client code path!");
                    hasAudioLoudness = true;
                } else {

                    // The C++ code is included here, commented out, so that the native client logic can be seen.
                    // Most of this logic is implemented in AvatarData.sendAvatarDataPacket().
                    //
                    // hasAvatarOrientation = sendAll || rotationChangedSince(lastSentTime);
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

                    hasAvatarOrientation = info.localOrientation !== undefined;
                    hasAvatarScale = info.avatarScale !== undefined;
                    hasAudioLoudness = info.audioLoudness !== undefined;
                    hasJointData = !sendMinimum;  // Joint data is always included in AvatarDataDetails but may not be wanted.
                    hasJointDefaultPoseFlags = hasJointData;

                    // WEBRTC TODO: Address further C++ code - Further avatar properties.
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

            if (wantedFlags & AvatarDataPacket.PACKET_HAS_GRAB_JOINTS) {

                // WEBRTC TODO: Address further C++ code - Grab joints.

                wantedFlags &= ~AvatarDataPacket.PACKET_HAS_GRAB_JOINTS;
            }

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

            if (avatarSpace(AvatarDataPacket.PACKET_HAS_AVATAR_ORIENTATION, 6)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                GLMHelpers.packOrientationQuatToSixBytes(data, dataPosition, info.localOrientation!);
                dataPosition += 6;
                // WEBRTC TODO: Address further C++ code - Outbound data rate.
            }

            if (avatarSpace(AvatarDataPacket.PACKET_HAS_AVATAR_SCALE, 2)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                GLMHelpers.packFloatRatioToTwoByte(data, dataPosition, info.avatarScale!);
                dataPosition += 2;
                // WEBRTC TODO: Address further C++ code - Outbound data rate.
            }

            // WEBRTC TODO: Address further C++ code - PACKET_HAS_LOOK_AT_POSITION.

            if (avatarSpace(AvatarDataPacket.PACKET_HAS_AUDIO_LOUDNESS, 1)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                data.setUint8(dataPosition, AudioHelpers.packFloatGainToByte(info.audioLoudness! / AUDIO_LOUDNESS_SCALE));
                dataPosition += 1;
                // WEBRTC TODO: Address further C++ code - Outbound data rate.
            }

            // WEBRTC TODO: Address further C++ code - PACKET_HAS_SENSOR_TO_WORLD_MATRIX.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_ADDITIONAL_FLAGS.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_PARENT_INFO.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_AVATAR_LOCAL_POSITION.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_HAND_CONTROLLERS.
            // WEBRTC TODO: Address further C++ code - PACKET_HAS_FACE_TRACKER_INFO.

            let numJoints = 0;
            if (wantedFlags & (AvatarDataPacket.PACKET_HAS_JOINT_DATA | AvatarDataPacket.PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS)) {
                assert(info.jointRotations !== undefined);
                numJoints = info.jointRotations.length;
            }
            assert(numJoints <= 255);
            const jointBitVectorSize = BitVectorHelpers.calcBitVectorSize(numJoints);

            if (avatarSpace(AvatarDataPacket.PACKET_HAS_JOINT_DATA, AvatarData.#minJointDataSize(jointBitVectorSize))) {
                assert(info.jointRotations !== undefined && info.jointTranslations !== undefined
                    && info.lastSentJointRotations !== undefined && info.lastSentJointTranslations !== undefined);

                // Calculations.
                // Minimum space required for another rotation joint:
                // size of joint + following translation bit-vector + translation scale:
                const minSizeForJoint = 6 + jointBitVectorSize + 4;

                // Compute maxTranslationDimension before we send any joint data.
                let maxTranslationDimension = 0.001;
                for (let i = sendStatus.translationsSent; i < numJoints; ++i) {
                    const translation = info.jointTranslations[i] ?? null;
                    if (translation !== null) {
                        maxTranslationDimension = Math.max(translation.x, translation.y, translation.z,
                            maxTranslationDimension);
                    }
                }


                // Rotations.
                data.setUint8(dataPosition, numJoints);
                dataPosition += 1;

                let validityPosition = dataPosition;  // Validity bits are written later.
                let validityPositionBytes = new Array(jointBitVectorSize);
                validityPositionBytes.fill(0);
                dataPosition += jointBitVectorSize;

                // C++'s sentJointDataOut is not used when sending data to the avatar mixer.

                // C++'s sentJoints is not used when sending data to the avatar mixer.

                // C++'s distanceAdjust is always false when sending data to the avatar mixer so use AVATAR_MIN_ROTATION_DOT.
                const AVATAR_MIN_ROTATION_DOT = 0.9999999;
                const minRotationDOT = AVATAR_MIN_ROTATION_DOT;

                let i = sendStatus.rotationsSent;
                for (; i < numJoints; i++) {
                    const thisRotation = info.jointRotations[i];
                    const lastRotation = info.lastSentJointRotations[i];
                    assert(thisRotation !== undefined && lastRotation !== undefined);

                    if (packetEnd - dataPosition >= minSizeForJoint) {
                        if (thisRotation !== null) {
                            // The dot product for larger rotations is a lower number, so if the dot() is less than the value
                            // then the rotation is a larger angle of rotation.
                            if (sendAll || lastRotation === null
                                || !cullSmallChanges && !Quat.equal(lastRotation, thisRotation)
                                || cullSmallChanges && Math.abs(Quat.dot(lastRotation, thisRotation)) < minRotationDOT) {
                                validityPositionBytes[Math.trunc(i / BITS_IN_BYTE)] |= 1 << i % BITS_IN_BYTE;
                                GLMHelpers.packOrientationQuatToSixBytes(data, dataPosition, thisRotation);
                                dataPosition += 6;

                                // C++'s sentJoints is not used when sending data to the avatar mixer.
                            }
                        }
                    } else {
                        break;
                    }
                }
                sendStatus.rotationsSent = i;
                for (i = 0; i < jointBitVectorSize; i++) {
                    data.setUint8(validityPosition + i, validityPositionBytes[i]);
                }


                // Translations.
                validityPosition = dataPosition;  // Validity bits are written later.
                validityPositionBytes = new Array(jointBitVectorSize);
                validityPositionBytes.fill(0);
                dataPosition += jointBitVectorSize;

                data.setFloat32(dataPosition, maxTranslationDimension, UDT.LITTLE_ENDIAN);
                dataPosition += 4;

                const AVATAR_MIN_TRANSLATION = 0.0001;
                const minTranslation = AVATAR_MIN_TRANSLATION;

                const invMaxTranslationDimension = 1.0 / maxTranslationDimension;
                i = sendStatus.translationsSent;
                for (; i < numJoints; i++) {
                    const thisTranslation = info.jointTranslations[i];
                    const lastTranslation = info.lastSentJointTranslations[i];
                    assert(thisTranslation !== undefined && lastTranslation !== undefined);

                    // Note minSizeForJoint is conservative since there isn't a following bit-vector + scale.
                    if (packetEnd - dataPosition >= minSizeForJoint) {
                        if (thisTranslation !== null) {
                            if (sendAll || lastTranslation === null
                                || !cullSmallChanges && !Vec3.equal(lastTranslation, thisTranslation)
                                || cullSmallChanges && Vec3.distance(thisTranslation, lastTranslation) > minTranslation) {
                                validityPositionBytes[Math.trunc(i / BITS_IN_BYTE)] |= 1 << i % BITS_IN_BYTE;
                                GLMHelpers.packFloatVec3ToSignedTwoByteFixed(data, dataPosition,
                                    Vec3.multiply(invMaxTranslationDimension, thisTranslation), TRANSLATION_COMPRESSION_RADIX);
                                dataPosition += 6;

                                // C++'s sentJoints is not used when sending data to the avatar mixer.
                            }
                        }
                    } else {
                        break;
                    }
                }
                sendStatus.translationsSent = i;
                for (i = 0; i < jointBitVectorSize; i++) {
                    data.setUint8(validityPosition + i, validityPositionBytes[i]);
                }


                // Grab joints.
                if (avatarSpace(AvatarDataPacket.PACKET_HAS_GRAB_JOINTS, 21 * 4)) {

                    // WEBRTC TODO: Address further C++ code - actual grab joints.

                    const leftFarGrabPosition = Vec3.ZERO;
                    const leftFarGrabRotation = Quat.IDENTITY;
                    const rightFarGrabPosition = Vec3.ZERO;
                    const rightFarGrabRotation = Quat.IDENTITY;
                    const mouseFarGrabPosition = Vec3.ZERO;
                    const mouseFarGrabRotation = Quat.IDENTITY;

                    data.setFloat32(dataPosition, leftFarGrabPosition.x, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, leftFarGrabPosition.y, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, leftFarGrabPosition.z, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;

                    data.setFloat32(dataPosition, leftFarGrabRotation.w, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, leftFarGrabRotation.x, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, leftFarGrabRotation.y, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, leftFarGrabRotation.z, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;

                    data.setFloat32(dataPosition, rightFarGrabPosition.x, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, rightFarGrabPosition.y, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, rightFarGrabPosition.z, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;

                    data.setFloat32(dataPosition, rightFarGrabRotation.w, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, rightFarGrabRotation.x, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, rightFarGrabRotation.y, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, rightFarGrabRotation.z, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;

                    data.setFloat32(dataPosition, mouseFarGrabPosition.x, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, mouseFarGrabPosition.y, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, mouseFarGrabPosition.z, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;

                    data.setFloat32(dataPosition, mouseFarGrabRotation.w, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, mouseFarGrabRotation.x, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, mouseFarGrabRotation.y, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;
                    data.setFloat32(dataPosition, mouseFarGrabRotation.z, UDT.LITTLE_ENDIAN);
                    dataPosition += 4;

                    // WEBRTC TODO: Address further C++ code - Outbound data rate.
                }


                // Final data.

                // C++'s extraReturnedFlags is not used when sending data to the avatar mixer/

            }

            if (avatarSpace(AvatarDataPacket.PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS, 1 + 2 * jointBitVectorSize)) {
                assert(info.jointRotations !== undefined && info.jointTranslations !== undefined);

                // Number of joints.
                data.setUint8(dataPosition, numJoints);
                dataPosition += 1;

                // Rotation default pose bits.
                dataPosition += BitVectorHelpers.writeBitVector(data, dataPosition, info.jointRotations,
                    (x: quat | null) => {
                        return x === null;
                    }
                );

                // Translation default pose bits.
                dataPosition += BitVectorHelpers.writeBitVector(data, dataPosition, info.jointTranslations,
                    (x: vec3 | null) => {
                        return x === null;
                    }
                );

                // WEBRTC TODO: Address further C++ code - Outbound data rate.
            }

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


    #minJointDataSize(validityBitsSize: number): number {  // eslint-disable-line class-methods-use-this
        // C++  size_t AvatarDataPacket::minJointDataSize(size_t numJoints)

        let totalSize = 1; // numJoints

        totalSize += validityBitsSize; // Orientations mask
        // assume no valid rotations
        totalSize += validityBitsSize; // Translations mask
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        totalSize += 4; // maxTranslationDimension
        // assume no valid translations

        return totalSize;
    }

}();

export default AvatarData;
export type { AvatarDataDetails };
