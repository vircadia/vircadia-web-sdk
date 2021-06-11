//
//  HifiSockAddr.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import HifiSockAddr from "../../../src/libraries/networking/HifiSockAddr.js";


describe("HifiSockAddr - unit tests", () => {

    test("Default address values are correct", () => {
        const hifiSockAddr = new HifiSockAddr();
        expect(hifiSockAddr.getPort()).toBe(0);
    });

    test("Can set and get the port number", () => {
        const hifiSockAddr = new HifiSockAddr();
        hifiSockAddr.setPort(3);
        expect(hifiSockAddr.getPort()).toBe(3);
    });

});
