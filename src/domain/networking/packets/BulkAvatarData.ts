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
import GLMHelpers from "../../shared/GLMHelpers";
import { quat } from "../../shared/Quat";
import Vec3, { vec3 } from "../../shared/Vec3";

import "../../shared/DataViewExtensions";


type BulkAvatarDataDetails = {
    sessionUUID: Uuid,
    globalPosition: vec3 | undefined,
    localOrientation: quat | undefined,
    avatarScale: number | undefined,
    jointRotations: (quat | null)[] | undefined,
    jointTranslations: (vec3 | null)[] | undefined,
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
     *      <code>undefined</code> if not included in the packet.
     *  @property {quat|undefined} localOrientation - The avatar's orientation.
     *      <code>undefined</code> if not included in the packet.
     *  @property {number|undefined} avatarScale - The avatar's scale.
     *      <code>undefined</code> if not included in the packet.
     *  @property {Array<quat|null>|undefined}} jointRotations - The joint rotations relative to avatar space (i.e., not
     *      relative to parent bones). If a rotation is <code>null</code> then the rotation of the avatar's default pose should
     *      be used.
     *      <code>undefined</code> if not included in the packet.
     *  @property {Array<vec3|null>|undefined} jointTranslations - The bone translations relative to their parent joints in
     *      model coordinates. If a translation is <code>null</code> then the translation of the avatar's default pose should be
     *      used.
     *      <code>undefined</code> if not included in the packet.<br />
     *      <strong>Warning:</strong> The coordinate system is not necessarily meters.
     *  @property {Array<boolean>|undefined} jointRotationsUseDefault - <code>true</code> if the skeleton's default joint
     *      rotation should be used instead of the value (if any) in <code>jointRotations</code>.<br />
     *      Note: Normally, a <code>true</code> value will match a <code>null</code> joint rotation value.
     *  @property {Array<boolean>|undefined} jointTranslationsUseDefault - <code>true</code> if the skeleton's default joint
     *      translation should be used instead of the value (if any) in <code>jointTranslations</code>.<br />
     *      Note: Normally, a <code>true</code> value will match a <code>null</code> joint translation value.
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

        const avatarDataDetailsList: BulkAvatarDataDetails[] = [];

        let dataPosition = 0;

        const DEBUG = true;

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
                // WEBRTC TODO: Address further code - avatar scale.
                avatarScale = GLMHelpers.unpackFloatRatioFromTwoByte(data, dataPosition);
                dataPosition += 2;
            }

            if (hasLookAtPosition) {
                // WEBRTC TODO: Address further code - avatar look-at position.
                dataPosition += 12;
            }

            if (hasAudioLoudness) {
                // WEBRTC TODO: Address further code - avatar audio loudness.
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

            let jointRotations: (quat | null)[] | undefined = undefined;
            let jointTranslations: (vec3 | null)[] | undefined = undefined;
            if (hasJointData) {
                jointRotations = [];
                const numJoints = data.getUint8(dataPosition);
                dataPosition += 1;

                const validRotations = new Array(numJoints) as Array<boolean>;
                {
                    let validity = 0;
                    let validityBit = 0;
                    for (let i = 0; i < numJoints; i++) {
                        if (validityBit === 0) {
                            validity = data.getUint8(dataPosition);
                            dataPosition += 1;
                        }
                        validRotations[i] = (validity & 1 << validityBit) > 0;
                        validityBit = (validityBit + 1) % BITS_IN_BYTE;
                    }
                }

                jointRotations = new Array(numJoints) as Array<quat | null>;
                for (let i = 0; i < numJoints; i++) {
                    jointRotations[i] = null;
                    if (validRotations[i]) {
                        jointRotations[i] = GLMHelpers.unpackOrientationQuatFromSixBytes(data, dataPosition);
                        // WEBRTC TODO: Address further C++ code - _hasNewJointData.
                        dataPosition += 6;
                    }
                }

                const validTranslations = new Array(numJoints) as Array<boolean>;
                {
                    let validity = 0;
                    let validityBit = 0;
                    for (let i = 0; i < numJoints; i++) {
                        if (validityBit === 0) {
                            validity = data.getUint8(dataPosition);
                            dataPosition += 1;
                        }
                        validTranslations[i] = (validity & 1 << validityBit) > 0;
                        validityBit = (validityBit + 1) % BITS_IN_BYTE;
                    }
                }

                const maxTranslationDimension = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;

                jointTranslations = new Array(numJoints) as Array<vec3 | null>;
                for (let i = 0; i < numJoints; i++) {
                    jointTranslations[i] = null;
                    if (validTranslations[i]) {
                        jointTranslations[i] = Vec3.multiply(maxTranslationDimension,
                            GLMHelpers.unpackFloatVec3FromSignedTwoByteFixed(data, dataPosition,
                                TRANSLATION_COMPRESSION_RADIX));
                        // WEBRTC TODO: Address further C++ code - _hasNewJointData.
                        dataPosition += 6;
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

                if (DEBUG && hasJointData) {
                    // Check that a default flag value of true matches a null data value.
                    // Code inspection of the C++ indicates that they should always match.

                    if (jointRotations === undefined || jointTranslations === undefined) {
                        console.warn("BulkAvatarData: hasJointDefaultPoseFlags without hasjointData.");
                    } else if (jointRotationsUseDefault.length !== jointRotations.length
                            || jointTranslationsUseDefault.length !== jointTranslations.length) {
                        console.warn("BulkAvatarData: jointDefaultPoseFlags length != jointData length.");
                    } else {
                        let isDataConsistent = true;
                        for (let i = 0; i < numJoints; i++) {
                            isDataConsistent = isDataConsistent
                                && (!jointRotationsUseDefault[i] || jointRotations[i] === null)
                                && (!jointTranslationsUseDefault[i] || jointTranslations[i] === null);
                            /*
                            if (!((!jointRotationsUseDefault[i] || jointRotations[i] === null)
                                && (!jointTranslationsUseDefault[i] || jointTranslations[i] === null))) {
                                console.debug("Inconsistent hasJointDefaultPoseFlags data at:", i);
                                console.debug("- Rotation flag, value:", jointRotationsUseDefault[i], jointRotations[i]);
                                console.debug("- Translation flag, value:", jointTranslationsUseDefault[i],
                                    jointTranslations[i]);
                            }
                            */
                        }
                        if (!isDataConsistent) {
                            console.warn("BulkAvatarData: jointDefaultPoseFlags data inconsistent with jointData.");
                        }
                    }
                }
            }

            /* eslint-enable @typescript-eslint/no-magic-numbers */

            avatarDataDetailsList.push({
                sessionUUID,
                globalPosition,
                localOrientation,
                avatarScale,
                jointRotations,
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
