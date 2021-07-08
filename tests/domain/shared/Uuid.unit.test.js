//
//  Uuid.unit.test.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import Uuid from "../../../src/domain/shared/Uuid.js";


describe("Uuid - unit tests", () => {

    test("The default UUID value is Uuid.NULL", () => {
        expect((new Uuid()).valueOf()).toBe(Uuid.NULL);
    });

    test("Can initialize with a specified value", () => {
        // eslint-disable-next-line newline-per-chained-call
        expect(new Uuid(217897985291723272451165858623432009288n).valueOf().toString(16))
            .toBe("a3eda01ec4de456dbf07858a26c5a648");
    });

});
