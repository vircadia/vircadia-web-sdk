//
//  BulkAvatarData.ts
//
//  Created by David Rowe on 9 Nov 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../../shared/Uuid";
import UDT from "../udt/UDT";
import AvatarDataPacket from "../../avatars/AvatarDataPacket";
import assert from "../../shared/assert";
import { vec3 } from "../../shared/Vec3";

import "../../shared/DataViewExtensions";


type BulkAvatarDataDetails = {
    sessionUUID: Uuid,
    globalPosition: vec3 | undefined
};
const BulkAvatarData = new class {
    // C++  N/A

    /*@devdoc
     *  Information returned for an avatar {@link PacketScribe|read} from a {@link PacketType(1)|BulkAvatarData} packet. Most
     *  properties are not necessarily included in the packet read; those not included have values set to
     *  <code>undefined</code>.
     *  @typedef {object} PacketScribe.BulkAvatarDataDetails
     *  @property {Uuid} sessionUUID - The avatar's session UUID.
     *  @property {vec3} globalPosition - The avatar's position in the domain.
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

            if (hasAvatarOrientation) {
                // WEBRTC TODO: Address further code - avatar orientation.
                dataPosition += 6;
            }

            if (hasAvatarScale) {
                // WEBRTC TODO: Address further code - avatar scale.
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

            if (hasJointData) {
                // WEBRTC TODO: Address further code - avatar joint data.
                const numJoints = data.getUint8(dataPosition);
                dataPosition += 1;

                const numRotationValidityBytes = Math.ceil(numJoints / 8);
                let numValidRotations = 0;
                for (let i = 0; i < numRotationValidityBytes; i++) {
                    const rotationBits = data.getUint8(dataPosition);
                    dataPosition += 1;
                    let bit = 128;
                    for (let j = 0; j < 8; j++) {
                        if ((bit & rotationBits) > 0) {
                            numValidRotations += 1;
                        }
                        bit = bit >>> 1;
                    }
                }
                dataPosition += numValidRotations * 6;

                const numTranslationValidityBytes = Math.ceil(numJoints / 8);
                let numValidTranslations = 0;
                for (let i = 0; i < numTranslationValidityBytes; i++) {
                    const translationBits = data.getUint8(dataPosition);
                    dataPosition += 1;
                    let bit = 128;
                    for (let j = 0; j < 8; j++) {
                        if ((bit & translationBits) > 0) {
                            numValidTranslations += 1;
                        }
                        bit = bit >>> 1;
                    }
                }
                dataPosition += 4 + numValidTranslations * 6;
            }

            if (hasJointDefaultPoseFlags) {
                // WEBRTC TODO: Address further code - avatar joint default pose flags.
                const numJoints = data.getUint8(dataPosition);
                dataPosition += 1;
                const numJointPoseBytes = Math.ceil(numJoints / 8);
                dataPosition += 2 * numJointPoseBytes;
            }

            if (hasGrabJoints) {
                // WEBRTC TODO: Address further code - avatar grab joints.
                dataPosition += 84;
            }

            /* eslint-enable @typescript-eslint/no-magic-numbers */

            avatarDataDetailsList.push({
                sessionUUID,
                globalPosition
            });

        }

        assert(dataPosition === data.byteLength);

        return avatarDataDetailsList;
    }

}();

export default BulkAvatarData;
export type { BulkAvatarDataDetails };
