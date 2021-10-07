//
//  Vec3.unit.test.js
//
//  Created by David Rowe on 12 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Vec3 from "../../../src/domain/shared/Vec3";


describe("Vec3 - unit tests", () => {

    test("Vec3 static can be accessed", () => {
        expect(Vec3.ZERO).toStrictEqual({ x: 0, y: 0, z: 0 });
    });

});
