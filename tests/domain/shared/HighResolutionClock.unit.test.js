//
//  HighResolutionClock.unit.test.js
//
//  Created by David Rowe on 5 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import HighResolutionClock from "../../../src/domain/shared/HighResolutionClock";


describe("HighResolutionClock - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can get the current timestamp value", () => {
        const timestamp = HighResolutionClock.now();
        expect(typeof timestamp).toBe("bigint");
        expect(timestamp > 0n).toBe(true);
    });

});
