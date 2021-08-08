//
//  AddressManager.unit.test.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import DependencyManager from "../../../src/domain/shared/DependencyManager";

import TestConfig from "../../test.config.json";


describe("AddressManager - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Possible domain change signal emitted when URL set", (done) => {
        expect.assertions(2);

        const addressManager = new AddressManager();
        let signalsHandled = 0;

        addressManager.possibleDomainChangeRequired.connect(function (url) {
            expect(url).toBe(TestConfig.SERVER_DOMAIN_URL);
            signalsHandled += 1;
            if (signalsHandled < 2) {
                // Signal should be emitted even when no change in URL.
                addressManager.handleLookupString(TestConfig.SERVER_DOMAIN_URL);
            } else {
                done();
            }
        });

        addressManager.handleLookupString(TestConfig.SERVER_DOMAIN_URL);
    });

    test("The domain's place name can be retrieved", () => {
        const addressManager = new AddressManager();
        expect(typeof addressManager.getPlaceName()).toBe("string");
    });

    test("The AddressManager can be obtained from the DependencyManager", () => {
        const contextID = DependencyManager.createContext();
        DependencyManager.set(contextID, AddressManager);
        const addressManager = DependencyManager.get(contextID, AddressManager);
        expect(addressManager instanceof AddressManager).toBe(true);
    });

});
