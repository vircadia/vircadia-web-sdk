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

import Uuid from "../shared/Uuid";


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


type TraitValue = string | undefined;  // SkeletonModelURL | ...

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
 */
const AvatarTraits = new class {
    // C++  namespace AvatarTraits

    /*@devdoc
     *  The traits of an avatar.
     *  @typedef {object} AvatarTraits.AvatarTraitsValues
     *  @property {Uuid} avatarID - The avatar's session UUID.
     *  @property {AvatarTraits.AvatarTraitValue[]} avatarTraits - The avatar's traits.
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
     *  The type of the trait value depends on the trait type:
     *  <table>
     *      <thead>
     *          <tr><th>TraitType</th><th>Value</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td><code>SkeletonModelURL</code></td><td><code>string</code></td></tr>
     *          <tr><td>Other types</td><td><code>undefined</code></td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {string|undefined} AvatarTraits.TraitValue
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


    #_haveWarnedSkeletonData = false;


    /*@devdoc
     *  Checks whether a trait type value is a simple trait.
     *  @param {TraitType> traitType - The trait type value to check.
     *  @returns {boolean} <code>true</code> if it is a simple trait, <code>false</code> if it isn't.
     */
    isSimpleTrait(traitType: TraitType): boolean {
        return this.NullTrait < traitType && traitType < this.FirstInstancedTrait;
    }


    /*@devdoc
     *  Reads a trait value from packet data.
     *  @param {AvatarTraits.TraitType} traitType - The type of trait to read the value of.
     *  @param {DataView} data - The packet data.
     *  @param {number} dataPosition - The start position of the trait value.
     *  @param {number} dataLength - The number of bytes of the trait value.
     */
    processTrait(traitType: TraitType, data: DataView, dataPosition: number, dataLength: number): TraitValue {
        // C++  AvatarData::processTrait(AvatarTraits::TraitType traitType, QByteArray traitBinaryData)
        //      Reading the data but not applying it to an avatar.

        if (traitType === AvatarTraits.SkeletonModelURL) {
            return this.#unpackSkeletonModelURL(data, dataPosition, dataLength);
        }

        if (traitType === AvatarTraits.SkeletonData) {
            if (!this.#_haveWarnedSkeletonData) {
                console.error("AvatarTraits: Reading avatar skeleton data not handled.");
                this.#_haveWarnedSkeletonData = true;
            }
            return undefined;
        }

        console.error("AvatarTraits: Unexpected trait type to read.");
        return undefined;
    }


    // eslint-disable-next-line class-methods-use-this
    #unpackSkeletonModelURL(data: DataView, dataPosition: number, dataLength: number): string {
        // C++  void AvatarData::unpackSkeletonModelURL(const QByteArray& data)
        //      Reading the data but not applying it to an avatar.

        if (dataLength === 0) {
            return "";
        }

        const textDecoder = new TextDecoder();
        return textDecoder.decode(new DataView(data.buffer, data.byteOffset + dataPosition, dataLength));
    }

}();

export default AvatarTraits;
export { TraitType };
export type { TraitValue, AvatarTraitValue, AvatarTraitsValues };
