//
//  AvatarTraits.unit.test.js
//
//  Created by David Rowe on 30 Apr 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarTraits from "../../../src/domain/avatars/AvatarTraits";


describe("AvatarTraits - unit tests", () => {

    test("AvatarTraits values appear to be correct", () => {
        expect(AvatarTraits.NullTrait).toBe(-1);
        expect(AvatarTraits.SkeletonModelURL).toBe(0);
        expect(AvatarTraits.TotalTraitTypes).toBe(AvatarTraits.Grab + 1);
        expect(AvatarTraits.DEFAULT_TRAIT_VERSION).toBe(0);
        expect(AvatarTraits.DELETED_TRAIT_SIZE).toBe(-1);
    });

    test("Can check whether a trait is a simple trait type", () => {
        expect(AvatarTraits.isSimpleTrait(AvatarTraits.NullTrait)).toEqual(false);
        expect(AvatarTraits.isSimpleTrait(AvatarTraits.SkeletonModelURL)).toEqual(true);
        expect(AvatarTraits.isSimpleTrait(AvatarTraits.SkeletonData)).toEqual(true);
        expect(AvatarTraits.isSimpleTrait(AvatarTraits.FirstInstancedTrait)).toEqual(false);
        expect(AvatarTraits.isSimpleTrait(AvatarTraits.AvatarEntity)).toEqual(false);
        expect(AvatarTraits.isSimpleTrait(AvatarTraits.Grab)).toEqual(false);
    });

});
