//
//  AvatarConstants.unit.test.js
//
//  Created by David Rowe on 9 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AvatarConstants from "../../../src/domain/shared/AvatarConstants";


describe("AvataConstants - unit tests", () => {

    test("Can access avatar constants", () => {
        // Test a handful constants, just to make that constants can be accessed as intended.

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        expect(AvatarConstants.DEFAULT_AVATAR_HEIGHT).toEqual(1.755);
        expect(AvatarConstants.MIN_AVATAR_SCALE).toEqual(0.005);

        /* eslint-enable @typescript-eslint/no-magic-numbers */
    });

});
