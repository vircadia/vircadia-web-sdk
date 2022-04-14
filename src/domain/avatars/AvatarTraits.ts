export enum TraitVersion {
    NullTraitVersion = -1,
    DefaultTraitVersion
}

export enum TraitType {
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
