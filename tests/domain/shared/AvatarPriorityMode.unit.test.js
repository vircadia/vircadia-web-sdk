//
//  AvatarPriorityMode.unit.test.js
//
//  Created by David Rowe on 13 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarPriorityMode from "../../../src/domain/shared/AvatarPriorityMode";


describe("AvatarPriorityMode - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can use AvatarPriorityMode values", () => {
        expect(AvatarPriorityMode.INHERIT).toBe(0);
        expect(AvatarPriorityMode.CROWD).toBe(1);
        expect(AvatarPriorityMode.HERO).toBe(2);
        expect(AvatarPriorityMode.ITEM_COUNT).toBe(3);
    });

});
