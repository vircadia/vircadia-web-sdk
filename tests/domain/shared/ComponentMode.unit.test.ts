//
//  ComponentMode.unit.test.js
//
//  Created by David Rowe on 13 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ComponentMode from "../../../src/domain/shared/ComponentMode";


describe("ComponentMode - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can use ComponentMode values", () => {
        expect(ComponentMode.INHERIT).toBe(0);
        expect(ComponentMode.DISABLED).toBe(1);
        expect(ComponentMode.ENABLED).toBe(2);
        expect(ComponentMode.ITEM_COUNT).toBe(3);
    });

});
