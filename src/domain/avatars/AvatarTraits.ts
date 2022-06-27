//
//  AvatarTrait.ts
//
//  Created by Julien Merzoug on 14 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import UDT from "../networking/udt/UDT";
import assert from "../shared/assert";
import GLMHelpers from "../shared/GLMHelpers";
import { quat } from "../shared/Quat";
import Uuid from "../shared/Uuid";
import Vec3, { vec3 } from "../shared/Vec3";
import { BoneType } from "./AvatarData";


/*@devdoc
 *  The types of avatar traits.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>NullTrait<td><code>-1</code></td><td>Null trait.</td></tr>
 *          <tr><td>SkeletonModelURL<td><code>0</code></td><td>Skeleton model URL simple trait.</td></tr>
 *          <tr><td>SkeletonData<td><code>1</code></td><td>Skeleton data simple trait.</td></tr>
 *          <tr><td>FirstInstancedTrait<td><code>2</code></td><td>The first instanced trait.</td></tr>
 *          <tr><td>AvatarEntity<td><code>2</code></td><td>Avatar entity instanced trait.</td></tr>
 *          <tr><td>Grab<td><code>3</code></td><td>Grab instanced trait.</td></tr>
 *          <tr><td>TotalTraitTypes<td><code>4</code></td><td>The number of trait types.</td></tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} AvatarTraits.TraitType
 */
enum TraitType {
    // C++  AvatarTraits::TraitType : int8_t

    // Null trait
    NullTrait = -1,

    // Simple traits
    SkeletonModelURL = 0,
    SkeletonData,

    // Instanced traits
    FirstInstancedTrait,
    AvatarEntity = FirstInstancedTrait,
    Grab,

    // Traits count
    TotalTraitTypes
}

type SkeletonJoint = {
    jointName: string,
    jointIndex: number,
    parentIndex: number,
    boneType: number,
    defaultTranslation: vec3,
    defaultRotation: quat,
    defaultScale: number
};

type TraitValue = string | SkeletonJoint[] | undefined;  // SkeletonModelURL | SkeletonJoint[] ...

type AvatarTraitValue = {
    type: TraitType,
    version: number,
    value: TraitValue
};

type AvatarTraitsValues = {
    avatarID: Uuid,
    avatarTraits: AvatarTraitValue[]
};


/*@devdoc
 *  The <code>AvatarTraits</code> namespace provides facilities for working with avatar traits.
 *  @namespace AvatarTraits
 *  @property {AvatarTraits.TraitType} NullTrait=-1 - Null trait. <em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} SkeletonModelURL=0 - Skeleton model URL simple trait.<em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} SkeletonData=1 - Skeleton data simple trait. <em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} FirstInstancedTrait=2 - The first instanced trait. <em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} AvatarEntity=2 - Avatar entity instanced trait. <em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} Grab=3 - Grab instanced trait. <em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} TotalTraitTypes=4 - The number of trait types. <em>Read-only.</em>
 *  @property {AvatarTraits.TraitType} NUM_SIMPLE_TRAITS=2 - The number of simple traits. <em>Read-only.</em>
 *  @property {number} DEFAULT_TRAIT_VERSION=0 - The default trait version sequence number. <em>Read-only.</em>
 *  @property {number} DELETED_TRAIT_SIZE=-1 - The nominal trait binary size for deleting an instanced trait.
 *      <em>Read-only.</em>
 */
const AvatarTraits = new class {
    // C++  namespace AvatarTraits

    /*@sdkdoc
     *  A skeleton bone and joint.
     *  @typedef {object} SkeletonJoint
     *  @property {string} jointName - The joint name.
     *  @property {number} jointIndex - The joint index.
     *  @property {number} parentIndex - The joint's parent, or <code>65535</code> or <code>-1</code> if there is no parent.
     *  @property {BoneType} boneType - The type of bone.
     *  @property {vec3} defaultTranslation - The default joint translation.
     *  @property {quat} defaultRotation - The default joint rotation.
     *  @property {number} defaultScale - The default bone and joint scale factor.
     */

    /*@devdoc
     *  The type of the trait value depends on the trait type:
     *  <table>
     *      <thead>
     *          <tr><th>{@link AvatarTraits.TraitType}</th><th>Value</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td><code>SkeletonModelURL</code></td><td><code>string</code></td></tr>
     *          <tr><td><code>SkeletonData</code></td><td><code>Array&lt;{@link SkeletonJoint}&gt;</code></td></tr>
     *          <tr><td>Other types</td><td><code>undefined</code></td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {string|SkeletonJoint[]|undefined} AvatarTraits.TraitValue
     */

    /*@devdoc
     *  An avatar trait.
     *  @typedef {object} AvatarTraits.AvatarTraitValue
     *  @property {AvatarTraits.TraitType} type - The type of trait.
     *  @property {number} version - The version number of the trait value for the avatar's connection to the avcatar mixer.
     *      This is incremented each time that the trait value is changed.
     *  @property {AvatarTraits.TraitValue} value - The trait value.
     */

    /*@devdoc
     *  The traits of an avatar.
     *  @typedef {object} AvatarTraits.AvatarTraitsValues
     *  @property {Uuid} avatarID - The avatar's session UUID.
     *  @property {AvatarTraits.AvatarTraitValue[]} avatarTraits - The avatar's traits.
     */


    readonly NullTrait = TraitType.NullTrait;
    readonly SkeletonModelURL = TraitType.SkeletonModelURL;
    readonly SkeletonData = TraitType.SkeletonData;
    readonly FirstInstancedTrait = TraitType.FirstInstancedTrait;
    readonly AvatarEntity = TraitType.AvatarEntity;
    readonly Grab = TraitType.Grab;
    readonly TotalTraitTypes = TraitType.TotalTraitTypes;

    readonly NUM_SIMPLE_TRAITS = TraitType.FirstInstancedTrait;

    readonly DEFAULT_TRAIT_VERSION = 0;
    readonly DELETED_TRAIT_SIZE = -1;


    /*@devdoc
     *  Checks whether a trait type value is a simple trait.
     *  @function AvatarTraits.isSimpleTrait
     *  @param {AvatarTraits.TraitType} traitType - The trait type value to check.
     *  @returns {boolean} <code>true</code> if it is a simple trait, <code>false</code> if it isn't.
     */
    isSimpleTrait(traitType: TraitType): boolean {
        return this.NullTrait < traitType && traitType < this.FirstInstancedTrait;
    }


    /*@devdoc
     *  Reads a trait value from packet data.
     *  @function AvatarTraits.processTrait
     *  @param {AvatarTraits.TraitType} traitType - The type of trait to read the value of.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The start position of the trait value.
     *  @param {number} dataLength - The number of bytes in the trait value.
     */
    processTrait(traitType: TraitType, data: DataView, dataPosition: number, dataLength: number): TraitValue {
        // C++  AvatarData::processTrait(AvatarTraits::TraitType traitType, QByteArray traitBinaryData)
        //      Reading the data but not applying it to an avatar.

        if (traitType === AvatarTraits.SkeletonModelURL) {
            return this.#unpackSkeletonModelURL(data, dataPosition, dataLength);
        }

        if (traitType === AvatarTraits.SkeletonData) {
            return this.#unpackSkeletonData(data, dataPosition /* , dataLength */);
        }

        console.error("AvatarTraits: Unexpected trait type to read.");
        return undefined;
    }


    // eslint-disable-next-line class-methods-use-this
    #unpackSkeletonModelURL(data: DataView, dataPosition: number, dataLength: number): string {
        // C++  void AvatarData::unpackSkeletonModelURL(const QByteArray& data)
        //      Reading the data but not applying it to an avatar.
        //      Applying the trait value is done in AvatarData.

        if (dataLength === 0) {
            return "";
        }

        const textDecoder = new TextDecoder();
        return textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, dataLength));
    }

    // eslint-disable-next-line class-methods-use-this
    #unpackSkeletonData(data: DataView, startPosition: number): SkeletonJoint[] {
        // C++  void AvatarData::unpackSkeletonData(const QByteArray& data)
        //      Reading the data but not applying it to an avatar.
        const TRANSLATION_COMPRESSION_RADIX = 14;

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = startPosition;

        // Header.
        // V++  AvatarSkeletonTrait::Header
        const maxTranslationDimension = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        const maxScaleDimension = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 4;
        const numJoints = data.getUint8(dataPosition);
        dataPosition += 1;
        const stringTableLength = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        const joints: SkeletonJoint[] = [];
        const stringIndexes: Array<{ stringStart: number, stringLength: number }> = [];
        for (let i = 0; i < numJoints; i++) {
            const stringStart = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            const stringLength = data.getUint8(dataPosition);
            dataPosition += 1;
            const boneType = data.getUint8(dataPosition);
            dataPosition += 1;
            let defaultTranslation = GLMHelpers.unpackFloatVec3FromSignedTwoByteFixed(data, dataPosition,
                TRANSLATION_COMPRESSION_RADIX);
            dataPosition += 6;
            const defaultRotation = GLMHelpers.unpackOrientationQuatFromSixBytes(data, dataPosition);
            dataPosition += 6;
            let defaultScale = GLMHelpers.unpackFloatRatioFromTwoByte(data, dataPosition);
            dataPosition += 2;
            let jointIndex = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;
            let parentIndex = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            jointIndex = i;
            parentIndex = boneType === BoneType.SkeletonRoot || boneType === BoneType.NonSkeletonRoot ? -1 : parentIndex;
            defaultTranslation = Vec3.multiply(maxTranslationDimension, defaultTranslation);
            defaultScale *= maxScaleDimension;

            joints.push({
                jointName: "",
                jointIndex,
                parentIndex,
                boneType,
                defaultTranslation,
                defaultRotation,
                defaultScale
            });

            stringIndexes.push({
                stringStart,
                stringLength
            });

        }

        const textDecoder = new TextDecoder();
        const table = textDecoder.decode(new Uint8Array(data.buffer, data.byteOffset + dataPosition, stringTableLength));
        dataPosition += stringTableLength;
        for (let i = 0; i < numJoints; i++) {
            const joint = joints[i];
            const stringIndex = stringIndexes[i];
            assert(joint !== undefined && stringIndex !== undefined);
            joint.jointName = table.slice(stringIndex.stringStart, stringIndex.stringStart + stringIndex.stringLength);
        }

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return joints;
    }

}();

export default AvatarTraits;
export { TraitType };
export type { TraitValue, AvatarTraitValue, AvatarTraitsValues, SkeletonJoint };
