//
//  PingType.unit.test.js
//
//  Created by David Rowe on 6 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PingType from "../../../src/domain/networking/PingType";


describe("PingType - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("PingType values are correct", () => {
        expect(PingType.Agnostic).toBe(0);
        expect(PingType.Local).toBe(1);
        expect(PingType.Public).toBe(2);
        expect(PingType.Symmetric).toBe(3);
    });

});
