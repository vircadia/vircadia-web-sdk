//
//  ShapeType.unit.test.js
//
//  Created by David Rowe on 12 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ShapeType from "../../../src/domain/shared/ShapeType";


describe("ShapeType - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can use ShapeType values", () => {
        expect(ShapeType.NONE).toBe(0);
        expect(ShapeType.MULTISPHERE).toBe(17);
    });

});
