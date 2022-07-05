//
//  AddressManager.unit.test.js
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AddressManager from "../../../src/domain/networking/AddressManager";
import ContextManager from "../../../src/domain/shared/ContextManager";

import TestConfig from "../../test.config.js";


describe("AddressManager - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Possible domain change signal emitted when URL set", (done) => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        expect.assertions(2);

        const addressManager = new AddressManager();
        let signalsHandled = 0;

        addressManager.possibleDomainChangeRequired.connect(function (url) {
            expect(url.toString()).toBe(TestConfig.SERVER_DOMAIN_URL);  // eslint-disable-line
            signalsHandled += 1;
            if (signalsHandled < 2) {
                // Signal should be emitted even when no change in URL.
                addressManager.handleLookupString(TestConfig.SERVER_DOMAIN_URL);
            } else {
                done();
            }
        });

        addressManager.handleLookupString(TestConfig.SERVER_DOMAIN_URL);

        log.mockReset();
    });

    test("Path change required signal emitted when URL set", (done) => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { /* no-op */ });

        expect.assertions(1);

        const addressManager = new AddressManager();
        addressManager.pathChangeRequired.connect(function (path) {
            expect(path).toBe("/");
            done();
        });

        addressManager.handleLookupString(TestConfig.SERVER_DOMAIN_URL);

        log.mockReset();
    });

    test("The domain's place name can be retrieved", () => {
        const addressManager = new AddressManager();
        expect(typeof addressManager.getPlaceName()).toBe("string");
    });

    test("The AddressManager can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AddressManager);
        const addressManager = ContextManager.get(contextID, AddressManager);
        expect(addressManager instanceof AddressManager).toBe(true);
    });

    test("Location change required signal is emitted when a valid viewpoint is handled", (done) => {
        const addressManager = new AddressManager();
        addressManager.locationChangeRequired.connect((newPosition, hasOrientationChange, newOrientation, shouldFace) => {
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            expect(newPosition.x).toBeCloseTo(9.96095, 4);
            expect(newPosition.y).toBeCloseTo(1.00000, 4);
            expect(newPosition.z).toBeCloseTo(6.05810, 4);
            expect(hasOrientationChange).toBe(true);
            expect(newOrientation.x).toBeCloseTo(0.000000, 5);
            expect(newOrientation.y).toBeCloseTo(0.461158, 5);
            expect(newOrientation.z).toBeCloseTo(0.000000, 5);
            expect(newOrientation.w).toBeCloseTo(0.887318, 5);
            expect(shouldFace).toBe(false);
            /* eslint-enable @typescript-eslint/no-unsafe-member-access */
            done();
        });

        addressManager.goToViewpointForPath("/9.96095,1,6.0581/0,0.461158,0,0.887318", "/somewhere");
    });

});
