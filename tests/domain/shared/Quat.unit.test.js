//
//  Quat.unit.test.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Quat from "../../../src/domain/shared/Quat";


describe("Quat - unit tests", () => {

    test("Quat static can be accessed", () => {
        expect(Quat.IDENTITY).toStrictEqual({ x: 0, y: 0, z: 0, w: 1 });
    });

});
