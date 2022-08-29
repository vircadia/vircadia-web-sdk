//
//  BulkAvatarData.ts
//
//  Created by David Rowe on 9 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../../shared/Uuid";
import UDT from "../udt/UDT";
import AvatarDataPacket from "../../avatars/AvatarDataPacket";
import assert from "../../shared/assert";
import AudioHelpers from "../../shared/AudioHelpers";
import GLMHelpers from "../../shared/GLMHelpers";
import { quat } from "../../shared/Quat";
import Vec3, { vec3 } from "../../shared/Vec3";

import "../../shared/DataViewExtensions";


type BulkAvatarDataDetails = {
    sessionUUID: Uuid,
    globalPosition: vec3 | undefined,
    localOrientation: quat | undefined,
    avatarScale: number | undefined,
    audioLoudness: number | undefined,
    jointRotationsValid: boolean[] | undefined
    jointRotations: quat[] | undefined,
    jointTranslationsValid: boolean[] | undefined
    jointTranslations: vec3[] | undefined,
    jointRotationsUseDefault: boolean[] | undefined,
    jointTranslationsUseDefault: boolean[] | undefined
};

type JointData = {
    // C++  class JointData
    // The Web SDK encodes the C++'s rotationIsDefaultPose and translationIsDefaultPose property values of false as null
    // rotation and translation values in order to simplify creation and use of the data.
    rotation: quat | null,
    translation: vec3 | null
};


const BulkAvatarData = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned for an avatar {@link PacketScribe|read} from a {@link PacketType(1)|BulkAvatarData} packet. Most
     *  properties are not necessarily included in the packet read; those not included have values set to
     *  <code>undefined</code>.
     *  @typedef {object} PacketScribe.BulkAvatarDataDetails
     *  @property {Uuid} sessionUUID - The avatar's session UUID.
     *  @property {vec3|undefined} globalPosition - The avatar's position in the domain.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {quat|undefined} localOrientation - The avatar's orientation.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {number|undefined} avatarScale - The avatar's scale.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {number|undefined} audioLoudness - The instantaneous loudness of the audio input that the avatar is injecting
     *      into the domain.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {boolean[]|undefined} jointRotationsValid - A flag for each joint where <code>true</code> means that a
     *      rotation value is included in <code>jointRotations</code>, <code>false</code> means that no value is included in
     *      <code>jointRotations</code>. (A value may be excluded if it hasn't changed significantly since the last value
     *      provided or the joint's default value should be used.)
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {Array<quat>|undefined} jointRotations - The joint rotations relative to avatar space (i.e., not relative
     *      to parent bones). Rotations are only provided for joints which have a <code>jointRotationsValid</code> flag value of
     *      <code>true</code>.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {boolean[]|undefined} jointTranslationsValid - A flag for each joint where <code>true</code> means that a
     *      rotation value is included in <code>jointTranslations</code>, <code>false</code> means that no value is included in
     *      <code>jointTranslations</code>. (A value may be excluded if it hasn't changed significantly since the last value
     *      provided or the joint's default value should be used.)
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {Array<quat>|undefined} jointTranslations - The joint rotations relative to avatar space (i.e., not relative
     *      to parent bones). Translations are only provided for joints which have a <code>jointTranslationsValid</code> flag
     *      value of <code>true</code>.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {Array<boolean>|undefined} jointRotationsUseDefault - <code>true</code> if the skeleton's default joint
     *      rotation should be used instead of any value currently held, <code>false</code> if the skeleton's default joint
     *      rotation should be used.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     *  @property {Array<boolean>|undefined} jointTranslationsUseDefault - <code>true</code> if the skeleton's default joint
     *      rotation should be used instead of any value currently held, <code>false</code> if the skeleton's default joint
     *      rotation should be used.
     *      <p>Is <code>undefined</code> if not included in the packet.</p>
     */


    /*@devdoc
     *  Reads a {@link PacketType(1)|BulkAvatarData} packet containing the details of one or more avatars, possibly including
     *  the user client's avatar.
     *  @function PacketScribe.BulkAvatarData&period;read
     *  @param {DataView} data - The BulkAvatarData message data to read.
     *  @returns {PacketScribe.BulkAvatarDataDetails[]} The information obtained from reading the packet.
     */
    read(data: DataView): BulkAvatarDataDetails[] {  /* eslint-disable-line class-methods-use-this */
        // C++  void AvatarHashMap::processAvatarDataPacket(ReceivedMessage* message, Node* sendingNode)
        //      AvatarData* AvatarHashMap::parseAvatarData(ReceivedMessage* message, node* sendingNode)
        //      int AvatarData::parseDataFromBuffer(const QByteArray& buffer)

        const BITS_IN_BYTE = 8;
        const TRANSLATION_COMPRESSION_RADIX = 14;
        const AUDIO_LOUDNESS_SCALE = 1024.0;

        const avatarDataDetailsList: BulkAvatarDataDetails[] = [];

        let dataPosition = 0;

        while (dataPosition < data.byteLength) {

            /* eslint-disable @typescript-eslint/no-magic-numbers */

            const sessionUUID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 16;

            const packetStateFlags = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            const hasAvatarGlobalPosition = (packetStateFlags & AvatarDataPacket.PACKET_HAS_AVATAR_GLOBAL_POSITION) > 0;
            const hasAvatarBoundingBox = (packetStateFlags & AvatarDataPacket.PACKET_HAS_AVATAR_BOUNDING_BOX) > 0;
            const hasAvatarOrientation = (packetStateFlags & AvatarDataPacket.PACKET_HAS_AVATAR_ORIENTATION) > 0;
            const hasAvatarScale = (packetStateFlags & AvatarDataPacket.PACKET_HAS_AVATAR_SCALE) > 0;
            const hasLookAtPosition = (packetStateFlags & AvatarDataPacket.PACKET_HAS_LOOK_AT_POSITION) > 0;
            const hasAudioLoudness = (packetStateFlags & AvatarDataPacket.PACKET_HAS_AUDIO_LOUDNESS) > 0;
            const hasSensorToWorldMatrix = (packetStateFlags & AvatarDataPacket.PACKET_HAS_SENSOR_TO_WORLD_MATRIX) > 0;
            const hasAdditionalFlags = (packetStateFlags & AvatarDataPacket.PACKET_HAS_ADDITIONAL_FLAGS) > 0;
            const hasParentInfo = (packetStateFlags & AvatarDataPacket.PACKET_HAS_PARENT_INFO) > 0;
            const hasAvatarLocalPosition = (packetStateFlags & AvatarDataPacket.PACKET_HAS_AVATAR_LOCAL_POSITION) > 0;
            const hasHandControllers = (packetStateFlags & AvatarDataPacket.PACKET_HAS_HAND_CONTROLLERS) > 0;
            const hasFaceTrackerInfo = (packetStateFlags & AvatarDataPacket.PACKET_HAS_FACE_TRACKER_INFO) > 0;
            const hasJointData = (packetStateFlags & AvatarDataPacket.PACKET_HAS_JOINT_DATA) > 0;
            const hasJointDefaultPoseFlags = (packetStateFlags & AvatarDataPacket.PACKET_HAS_JOINT_DEFAULT_POSE_FLAGS) > 0;
            const hasGrabJoints = (packetStateFlags & AvatarDataPacket.PACKET_HAS_GRAB_JOINTS) > 0;

            let globalPosition: vec3 | undefined = undefined;
            if (hasAvatarGlobalPosition) {
                globalPosition = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            if (hasAvatarBoundingBox) {
                // WEBRTC TODO: Address further code - avatar bounding box.
                dataPosition += 24;
            }

            let localOrientation: quat | undefined = undefined;
            if (hasAvatarOrientation) {
                localOrientation = GLMHelpers.unpackOrientationQuatFromSixBytes(data, dataPosition);
                dataPosition += 6;
            }

            let avatarScale: number | undefined = undefined;
            if (hasAvatarScale) {
                avatarScale = GLMHelpers.unpackFloatRatioFromTwoByte(data, dataPosition);
                dataPosition += 2;
            }

            if (hasLookAtPosition) {
                // WEBRTC TODO: Address further code - avatar look-at position.
                dataPosition += 12;
            }

            let audioLoudness: number | undefined = undefined;
            if (hasAudioLoudness) {
                audioLoudness = AudioHelpers.unpackFloatGainFromByte(data.getUint8(dataPosition)) * AUDIO_LOUDNESS_SCALE;
                dataPosition += 1;
            }

            if (hasSensorToWorldMatrix) {
                // WEBRTC TODO: Address further code - avatar sensor-to-world matrix.
                dataPosition += 20;
            }

            if (hasAdditionalFlags) {
                // WEBRTC TODO: Address further code - avatar additional flags.
                dataPosition += 2;
            }

            if (hasParentInfo) {
                // WEBRTC TODO: Address further code - avatar parent info.
                dataPosition += 18;
            }

            if (hasAvatarLocalPosition) {
                // WEBRTC TODO: Address further code - avatar local position
                dataPosition += 12;
            }

            if (hasHandControllers) {
                // WEBRTC TODO: Address further code - avatar hand controllers.
                dataPosition += 24;
            }

            if (hasFaceTrackerInfo) {
                // WEBRTC TODO: Address further code - avatar face tracker info.
                dataPosition += 16;
                const numBlendshapeCoefficients = data.getUint8(dataPosition);
                dataPosition += 1;
                dataPosition += numBlendshapeCoefficients * 4;
            }

            let jointRotationsValid: boolean[] | undefined = undefined;
            let jointRotations: quat[] | undefined = undefined;
            let jointTranslationsValid: boolean[] | undefined = undefined;
            let jointTranslations: vec3[] | undefined = undefined;
            if (hasJointData) {
                jointRotations = [];
                const numJoints = data.getUint8(dataPosition);
                dataPosition += 1;

                jointRotationsValid = new Array(numJoints) as Array<boolean>;
                let jointRotationsValidCount = 0;
                {
                    let validity = 0;
                    let validityBit = 0;
                    for (let i = 0; i < numJoints; i++) {
                        if (validityBit === 0) {
                            validity = data.getUint8(dataPosition);
                            dataPosition += 1;
                        }
                        jointRotationsValid[i] = (validity & 1 << validityBit) > 0;
                        validityBit = (validityBit + 1) % BITS_IN_BYTE;
                        if (jointRotationsValid[i]) {
                            jointRotationsValidCount += 1;
                        }
                    }
                }

                jointRotations = new Array(jointRotationsValidCount) as Array<quat>;
                let j = 0;
                for (let i = 0; i < numJoints; i++) {
                    if (jointRotationsValid[i]) {
                        jointRotations[j] = GLMHelpers.unpackOrientationQuatFromSixBytes(data, dataPosition);
                        dataPosition += 6;
                        // WEBRTC TODO: Address further C++ code - _hasNewJointData.
                        j += 1;
                    }
                }

                jointTranslationsValid = new Array(numJoints) as Array<boolean>;
                let jointTranslationsValidCount = 0;
                {
                    let validity = 0;
                    let validityBit = 0;
                    for (let i = 0; i < numJoints; i++) {
                        if (validityBit === 0) {
                            validity = data.getUint8(dataPosition);
                            dataPosition += 1;
                        }
                        jointTranslationsValid[i] = (validity & 1 << validityBit) > 0;
                        validityBit = (validityBit + 1) % BITS_IN_BYTE;
                        if (jointTranslationsValid[i]) {
                            jointTranslationsValidCount += 1;
                        }
                    }
                }

                const maxTranslationDimension = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;

                jointTranslations = new Array(jointTranslationsValidCount) as Array<vec3>;
                j = 0;
                for (let i = 0; i < numJoints; i++) {
                    if (jointTranslationsValid[i]) {
                        jointTranslations[j] = Vec3.multiply(maxTranslationDimension,
                            GLMHelpers.unpackFloatVec3FromSignedTwoByteFixed(data, dataPosition,
                                TRANSLATION_COMPRESSION_RADIX));
                        dataPosition += 6;
                        // WEBRTC TODO: Address further C++ code - _hasNewJointData.
                        j += 1;
                    }
                }

                if (hasGrabJoints) {
                    // WEBRTC TODO: Address further code - avatar grab joints.
                    dataPosition += 84;
                }

            }

            let jointRotationsUseDefault: boolean[] | undefined = undefined;
            let jointTranslationsUseDefault: boolean[] | undefined = undefined;
            if (hasJointDefaultPoseFlags) {
                const numJoints = data.getUint8(dataPosition);
                dataPosition += 1;

                jointRotationsUseDefault = new Array(numJoints) as Array<boolean>;
                {
                    let validity = 0;
                    let validityBit = 0;
                    for (let i = 0; i < numJoints; i++) {
                        if (validityBit === 0) {
                            validity = data.getUint8(dataPosition);
                            dataPosition += 1;
                        }
                        jointRotationsUseDefault[i] = (validity & 1 << validityBit) > 0;
                        validityBit = (validityBit + 1) % BITS_IN_BYTE;
                    }
                }

                jointTranslationsUseDefault = new Array(numJoints) as Array<boolean>;
                {
                    let validity = 0;
                    let validityBit = 0;
                    for (let i = 0; i < numJoints; i++) {
                        if (validityBit === 0) {
                            validity = data.getUint8(dataPosition);
                            dataPosition += 1;
                        }
                        jointTranslationsUseDefault[i] = (validity & 1 << validityBit) > 0;
                        validityBit = (validityBit + 1) % BITS_IN_BYTE;
                    }
                }
            }

            /* eslint-enable @typescript-eslint/no-magic-numbers */

            avatarDataDetailsList.push({
                sessionUUID,
                globalPosition,
                localOrientation,
                avatarScale,
                audioLoudness,
                jointRotationsValid,
                jointRotations,
                jointTranslationsValid,
                jointTranslations,
                jointRotationsUseDefault,
                jointTranslationsUseDefault
            });

        }

        assert(dataPosition === data.byteLength);

        return avatarDataDetailsList;
    }

}();

export default BulkAvatarData;
export type { BulkAvatarDataDetails, JointData };
