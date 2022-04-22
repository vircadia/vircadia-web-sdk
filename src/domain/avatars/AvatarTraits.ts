//
//  AvatarTrait.ts
//
//  Created by Julien Merzoug on 14 Apr 2022.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

export enum TraitVersion {
    NullTraitVersion = -1,
    DefaultTraitVersion
}

export enum TraitType {
    // Null trait
    NullTrait = -1,

    // Simple traits
    SkeletonModelURL = 0,
    // Instanced traits
    FirstInstancedTrait

    // WEBRTC TODO: Address further C++ code.
}

export enum ClientTraitStatus {
    Unchanged,
    Updated,
    Deleted
}

export const NUM_SIMPLE_TRAITS = TraitType.FirstInstancedTrait;
