//
//  SetAvatarTraits.ts
//
//  Created by Julien Merzoug on 6 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarTraits, { SkeletonJoint } from "../../avatars/AvatarTraits";
import { ClientTraitStatus } from "../../avatars/ClientTraitsHandler";
import GLMHelpers from "../../shared/GLMHelpers";
import Vec3 from "../../shared/Vec3";
import PacketTypeValue from "../udt/PacketHeaders";
import NLPacketList from "../NLPacketList";
import assert from "../../shared/assert";


type SetAvatarTraitsDetails = {
    currentTraitVersion: number;
    skeletonModelURL: string;
    skeletonData: SkeletonJoint[];
    traitStatuses: Array<ClientTraitStatus>;
    initialSend: boolean;
};


const SetAvatarTraits = new class {
    // C++ N/A

    /*@devdoc
     *  Information needed for {@link PacketScribe|writing} a {@link PacketType(1)|SetAvatarTraits} packet list.
     *  @typedef {object} PacketScribe.SetAvatarTraitsDetails
     *  @property {number} currentTraitVersion - Trait sending sequence number. This should be incremented for each
     *      <code>SetAvatarTraits</code> packet written.
     *  @property {string} skeletonModelURL - The URL of the avatar's FST, glTF, or FBX model file.
     *  @property {SkeletonJoint[]} skeletonData - The avatar's skeleton.
     *  @property {ClientTraitStatus[]} traitStatuses - The status of each avatar trait.
     *  @property {boolean} initialSend - <code>true</code> to send all traits, <code>false</code> to send only those that have
     *      been updated.
     */


    /*@devdoc
     *  Writes a {@link PacketType(1)|SetAvatarTraits} packet list, ready for sending.
     *  @function PacketScribe.SetAvatarTraits&period;write
     *  @param {PacketScribe.SetAvatarTraitsDetails} info - The information needed for writing the packet list.
     *  @returns {NLPacketList} The packet list, ready for sending.
     */
    write(info: SetAvatarTraitsDetails): NLPacketList {  /* eslint-disable-line class-methods-use-this */
        // C++  ClientTraitsHandler::sendChangedTraitsToMixer()
        //      qint64 AvatarTraits::packTrait(TraitType traitType, ExtendedIODevice& destination, const AvatarData& avatar)
        //      QByteArray AvatarData::packTrait(AvatarTraits::TraitType traitType)

        const packetList = NLPacketList.create(PacketTypeValue.SetAvatarTraits, null, true, true);

        packetList.writePrimitive(info.currentTraitVersion, 4);  // eslint-disable-line @typescript-eslint/no-magic-numbers

        for (const [index, traitStatus] of info.traitStatuses.entries()) {
            if (info.initialSend || traitStatus === ClientTraitStatus.Updated) {
                const traitType = index;
                if (traitType === AvatarTraits.SkeletonModelURL) {
                    this.#packSkeletonModelURL(info.skeletonModelURL, packetList);
                } else if (traitType === AvatarTraits.SkeletonData) {
                    this.#packSkeletonData(info.skeletonData, packetList);
                }
            }
        }

        return packetList;
    }


    // eslint-disable-next-line class-methods-use-this
    #packSkeletonModelURL(skeletonModelURL: string, packetList: NLPacketList) {
        // C++  QByteArray AvatarData::packSkeletonModelURL()
        const textEncoder = new TextEncoder();

        packetList.writePrimitive(AvatarTraits.SkeletonModelURL, 1);
        const encodedURL = textEncoder.encode(skeletonModelURL);
        packetList.writePrimitive(encodedURL.length, 2);
        packetList.write(encodedURL);
    }

    // eslint-disable-next-line class-methods-use-this
    #packSkeletonData(skeletonData: SkeletonJoint[], packetList: NLPacketList) {
        // C++  QByteArray AvatarData::packSkeletonData()
        const TRANSLATION_COMPRESSION_RADIX = 14;

        // Calculate header.
        let maxScaleDimension = 0.0;
        let maxTranslationDimension = 0.0;
        const numJoints = skeletonData.length;
        let stringTableLength = 0;
        const defaultScales = [];
        for (let i = 0, length = skeletonData.length; i < length; i++) {
            const skeletonJoint = skeletonData[i];
            assert(skeletonJoint !== undefined);
            stringTableLength += skeletonJoint.jointName.length;
            const translation = skeletonJoint.defaultTranslation;
            maxTranslationDimension = Math.max(maxTranslationDimension, translation.x, translation.y, translation.z);
            maxScaleDimension = Math.max(maxScaleDimension, skeletonJoint.defaultScale);
            defaultScales.push(skeletonJoint.defaultScale);
        }

        // Write trait info.
        const HEADER_DATA_SIZE = 11;
        const JOINT_DATA_SIZE = 22;
        packetList.writePrimitive(AvatarTraits.SkeletonData, 1);
        packetList.writePrimitive(HEADER_DATA_SIZE + numJoints * JOINT_DATA_SIZE + stringTableLength, 2);

        // Write header.
        packetList.writeFloat(maxTranslationDimension);
        packetList.writeFloat(maxScaleDimension);
        packetList.writePrimitive(numJoints, 1);
        packetList.writePrimitive(stringTableLength, 2);

        // Write joint data.
        let stringTable = "";
        const twoByteArray = new Uint8Array(2);
        const twoByteDataView = new DataView(twoByteArray.buffer);
        const sixByteArray = new Uint8Array(6);  // eslint-disable-line @typescript-eslint/no-magic-numbers
        const sixByteDataView = new DataView(sixByteArray.buffer);
        const invMaxTranslationDimension = 1.0 / maxTranslationDimension;
        for (let i = 0, length = skeletonData.length; i < length; i++) {
            const skeletonJoint = skeletonData[i]!;  // eslint-disable-line @typescript-eslint/no-non-null-assertion
            packetList.writePrimitive(stringTable.length, 2);
            packetList.writePrimitive(skeletonJoint.jointName.length, 1);
            stringTable += skeletonJoint.jointName;
            packetList.writePrimitive(skeletonJoint.boneType, 1);
            GLMHelpers.packFloatVec3ToSignedTwoByteFixed(sixByteDataView, 0,
                Vec3.multiply(invMaxTranslationDimension, skeletonJoint.defaultTranslation), TRANSLATION_COMPRESSION_RADIX);
            packetList.write(sixByteArray);
            GLMHelpers.packOrientationQuatToSixBytes(sixByteDataView, 0, skeletonJoint.defaultRotation);
            packetList.write(sixByteArray);
            GLMHelpers.packFloatRatioToTwoByte(twoByteDataView, 0, skeletonJoint.defaultScale / maxScaleDimension);
            packetList.write(twoByteArray);
            packetList.writePrimitive(i, 2);
            packetList.writePrimitive(skeletonJoint.parentIndex, 2);
        }

        // Write string table.
        const textEncoder = new TextEncoder();
        const encodedMessage = textEncoder.encode(stringTable);
        packetList.write(encodedMessage);
    }

}();

export default SetAvatarTraits;
export type { SetAvatarTraitsDetails };
