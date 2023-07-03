//
//  JSONExtensions.unit.test.js
//
//  Created by David Rowe on 3 Jul 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*
    eslint-disable
    @typescript-eslint/no-magic-numbers,
    @typescript-eslint/no-unsafe-assignment,
    @typescript-eslint/no-unsafe-member-access
*/

import { bigintReplacer, bigintReviver } from "../../../src/domain/shared/JSONExtensions";


describe("JSON extensions - unit tests", () => {

    test("Can stringify objects with bigint values", () => {
        const value = 2n ** 127n + 3n;  // Most-significant and 2 least-significant bits.
        const object = {
            value,
            other: 123
        };
        const jsonString = JSON.stringify(object, bigintReplacer);
        expect(jsonString).toBe("{\"value\":\"170141183460469231731687303715884105731n\",\"other\":123}");
    });

    test("Can parse objects with bigint values", () => {
        const jsonString = "{\"value\":\"170141183460469231731687303715884105731n\",\"other\":123}";
        const object = JSON.parse(jsonString, bigintReviver);
        expect(object.value).toBe(2n ** 127n + 3n);
        expect(object.other).toBe(123);
    });
});
