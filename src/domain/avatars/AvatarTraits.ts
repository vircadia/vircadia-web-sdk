//
//  AvatarTrait.ts
//
//  Created by Julien Merzoug on 14 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


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
    // C++  AvatarTraits::TraitType

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

    readonly NullTrait = TraitType.NullTrait;
    readonly SkeletonModelURL = TraitType.SkeletonModelURL;
    readonly SkeletonData = TraitType.SkeletonData;
    readonly FirstInstancedTrait = TraitType.FirstInstancedTrait;
    readonly AvatarEntity = TraitType.AvatarEntity;
    readonly Grab = TraitType.Grab;
    readonly TotalTraitTypes = TraitType.TotalTraitTypes;

    readonly NUM_SIMPLE_TRAITS = TraitType.FirstInstancedTrait;

    readonly DEFAULT_TRAIT_VERSION = 0;
}();

export default AvatarTraits;
export type { TraitType };
