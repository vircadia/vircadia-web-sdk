//
//  AddressManager.integration.test.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/libraries/networking/AddressManager.js";


describe("AddressManager - integration tests", () => {

    /* eslint-disable no-magic-numbers */

    test("Possible domain change signal emitted when URL set", (done) => {
        expect.assertions(2);
        let signalsHandled = 0;
        const LOCALHOST = "localhost";

        AddressManager.possibleDomainChangeRequired.connect(function (url) {
            expect(url).toBe(LOCALHOST);
            signalsHandled += 1;
            if (signalsHandled < 2) {
                // Signal should be emitted even when no change in URL.
                AddressManager.handleLookupString(LOCALHOST);
            } else {
                done();
            }
        });

        AddressManager.handleLookupString(LOCALHOST);
    });

    test("The domain's place name can be retrieved", () => {
        expect(typeof AddressManager.getPlaceName()).toBe("string");
    });

});
