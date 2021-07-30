//
//  assert.unit.test.js
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "../../../src/domain/shared/assert";


describe("assert - unit tests", () => {

    // Suppress console.assert messages from being displayed.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleAssert = jest.spyOn(console, "assert").mockImplementation(() => { });

    test("An assertion doesn't fire if the assertion value is true", () => {
        let asserted = false;
        try {
            assert(true, "Asserted when true");
        } catch (e) {
            asserted = true;
        }
        expect(asserted).toBe(false);
    });

    test("An assertion fires if the assertion value is false", () => {
        let asserted = false;
        try {
            assert(false, "Asserted when false");
        } catch (e) {
            asserted = true;
        }
        expect(asserted).toBe(true);
    });

    consoleAssert.mockReset();

});
