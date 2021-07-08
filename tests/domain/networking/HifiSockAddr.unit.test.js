//
//  HifiSockAddr.unit.test.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import HifiSockAddr from "../../../src/domain/networking/HifiSockAddr.js";


describe("HifiSockAddr - unit tests", () => {

    test("Default address values are correct", () => {
        const hifiSockAddr = new HifiSockAddr();
        expect(hifiSockAddr.getAddress()).toBe(0);
        expect(hifiSockAddr.getPort()).toBe(0);
    });

    test("Can set and get the IPv4 address", () => {
        const IP_127_0_0_1 = 127 * 2 ** 24 + 1;  // 127.0.0.1
        const IP_255_255_255_255 = 2 ** 32 - 1;  // 255.255.255.255
        const hifiSockAddr = new HifiSockAddr();
        hifiSockAddr.setAddress(IP_127_0_0_1);
        expect(hifiSockAddr.getAddress()).toBe(IP_127_0_0_1);
        hifiSockAddr.setAddress(IP_255_255_255_255);
        expect(hifiSockAddr.getAddress()).toBe(IP_255_255_255_255);
    });

    test("Can set and get the port number", () => {
        const hifiSockAddr = new HifiSockAddr();
        hifiSockAddr.setPort(3);
        expect(hifiSockAddr.getPort()).toBe(3);
    });

});
