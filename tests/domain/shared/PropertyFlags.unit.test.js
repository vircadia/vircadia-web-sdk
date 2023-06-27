//
//  PropertyFlags.unit.test.js
//
//  Created by Julien Merzoug on 06 June 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import PropertyFlags from "../../../src/domain/shared/PropertyFlags";


describe("EntityData - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can create an empty property flags", () => {
        const propertyFlags = new PropertyFlags();
        expect(propertyFlags.isEmpty()).toBe(true);
    });

    test("Can set and get property flags", () => {
        const propertyFlags = new PropertyFlags();

        // Set 1st bit.
        propertyFlags.setHasProperty(0, true);
        expect(propertyFlags.getHasProperty(0)).toBe(true);
        expect(propertyFlags.isEmpty()).toBe(false);

        // Clear 1st bit.
        propertyFlags.setHasProperty(0, false);
        expect(propertyFlags.getHasProperty(0)).toBe(false);

        // Set 2nd bit.
        propertyFlags.setHasProperty(1, true);
        expect(propertyFlags.getHasProperty(1)).toBe(true);

        // Clear 2nd bit.
        propertyFlags.setHasProperty(1, false);
        expect(propertyFlags.getHasProperty(1)).toBe(false);

        // Set 1st, 2nd and 9th bits.
        propertyFlags.setHasProperty(0, true);
        propertyFlags.setHasProperty(1, true);
        propertyFlags.setHasProperty(8, true);
        expect(propertyFlags.getHasProperty(0)).toBe(true);
        expect(propertyFlags.getHasProperty(1)).toBe(true);
        expect(propertyFlags.getHasProperty(8)).toBe(true);
    });

    test("Can decode property flags", () => {
        const bufferHex = "fffe3fffcdfffffffffffff8381ffffe11000000000000000000000000000000";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();

        const bytesConsumed = propertyFlags.decode(data, 32, 0);
        expect(bytesConsumed).toBe(16);
        expect(propertyFlags.isEmpty()).toBe(false);

        expect(propertyFlags.getHasProperty(0)).toBe(false);
        expect(propertyFlags.getHasProperty(1)).toBe(false);
        expect(propertyFlags.getHasProperty(2)).toBe(true);
        expect(propertyFlags.getHasProperty(3)).toBe(true);
        expect(propertyFlags.getHasProperty(4)).toBe(true);
        expect(propertyFlags.getHasProperty(5)).toBe(true);
        expect(propertyFlags.getHasProperty(6)).toBe(true);
        expect(propertyFlags.getHasProperty(7)).toBe(true);
        expect(propertyFlags.getHasProperty(8)).toBe(true);
        expect(propertyFlags.getHasProperty(9)).toBe(true);
        expect(propertyFlags.getHasProperty(10)).toBe(true);
        expect(propertyFlags.getHasProperty(11)).toBe(true);
        expect(propertyFlags.getHasProperty(12)).toBe(true);
        expect(propertyFlags.getHasProperty(13)).toBe(true);
        expect(propertyFlags.getHasProperty(14)).toBe(true);
        expect(propertyFlags.getHasProperty(15)).toBe(true);
        expect(propertyFlags.getHasProperty(16)).toBe(true);
        expect(propertyFlags.getHasProperty(17)).toBe(true);
        expect(propertyFlags.getHasProperty(18)).toBe(false);
        expect(propertyFlags.getHasProperty(19)).toBe(false);
        expect(propertyFlags.getHasProperty(20)).toBe(true);
        expect(propertyFlags.getHasProperty(21)).toBe(true);
        expect(propertyFlags.getHasProperty(22)).toBe(false);
        expect(propertyFlags.getHasProperty(23)).toBe(true);
        expect(propertyFlags.getHasProperty(24)).toBe(true);
        expect(propertyFlags.getHasProperty(25)).toBe(true);
        expect(propertyFlags.getHasProperty(26)).toBe(true);
        expect(propertyFlags.getHasProperty(27)).toBe(true);
        expect(propertyFlags.getHasProperty(28)).toBe(true);
        expect(propertyFlags.getHasProperty(29)).toBe(true);
        expect(propertyFlags.getHasProperty(30)).toBe(true);
        expect(propertyFlags.getHasProperty(31)).toBe(true);
        expect(propertyFlags.getHasProperty(32)).toBe(true);
        expect(propertyFlags.getHasProperty(33)).toBe(true);
        expect(propertyFlags.getHasProperty(34)).toBe(true);
        expect(propertyFlags.getHasProperty(35)).toBe(true);
        expect(propertyFlags.getHasProperty(36)).toBe(true);
        expect(propertyFlags.getHasProperty(37)).toBe(true);
        expect(propertyFlags.getHasProperty(38)).toBe(true);
        expect(propertyFlags.getHasProperty(39)).toBe(true);
        expect(propertyFlags.getHasProperty(40)).toBe(true);
        expect(propertyFlags.getHasProperty(41)).toBe(true);
        expect(propertyFlags.getHasProperty(42)).toBe(true);
        expect(propertyFlags.getHasProperty(43)).toBe(true);
        expect(propertyFlags.getHasProperty(44)).toBe(true);
        expect(propertyFlags.getHasProperty(45)).toBe(true);
        expect(propertyFlags.getHasProperty(46)).toBe(true);
        expect(propertyFlags.getHasProperty(47)).toBe(true);
        expect(propertyFlags.getHasProperty(48)).toBe(true);
        expect(propertyFlags.getHasProperty(49)).toBe(true);
        expect(propertyFlags.getHasProperty(50)).toBe(true);
        expect(propertyFlags.getHasProperty(51)).toBe(true);
        expect(propertyFlags.getHasProperty(52)).toBe(true);
        expect(propertyFlags.getHasProperty(53)).toBe(true);
        expect(propertyFlags.getHasProperty(54)).toBe(true);
        expect(propertyFlags.getHasProperty(55)).toBe(true);
        expect(propertyFlags.getHasProperty(56)).toBe(true);
        expect(propertyFlags.getHasProperty(57)).toBe(true);
        expect(propertyFlags.getHasProperty(58)).toBe(true);
        expect(propertyFlags.getHasProperty(59)).toBe(true);
        expect(propertyFlags.getHasProperty(60)).toBe(true);
        expect(propertyFlags.getHasProperty(61)).toBe(true);
        expect(propertyFlags.getHasProperty(62)).toBe(true);
        expect(propertyFlags.getHasProperty(63)).toBe(true);
        expect(propertyFlags.getHasProperty(64)).toBe(true);
        expect(propertyFlags.getHasProperty(65)).toBe(true);
        expect(propertyFlags.getHasProperty(66)).toBe(true);
        expect(propertyFlags.getHasProperty(67)).toBe(true);
        expect(propertyFlags.getHasProperty(68)).toBe(true);
        expect(propertyFlags.getHasProperty(69)).toBe(true);
        expect(propertyFlags.getHasProperty(70)).toBe(true);
        expect(propertyFlags.getHasProperty(71)).toBe(true);
        expect(propertyFlags.getHasProperty(72)).toBe(true);
        expect(propertyFlags.getHasProperty(73)).toBe(true);
        expect(propertyFlags.getHasProperty(74)).toBe(true);
        expect(propertyFlags.getHasProperty(75)).toBe(true);
        expect(propertyFlags.getHasProperty(76)).toBe(true);
        expect(propertyFlags.getHasProperty(77)).toBe(false);
        expect(propertyFlags.getHasProperty(78)).toBe(false);
        expect(propertyFlags.getHasProperty(79)).toBe(false);
        expect(propertyFlags.getHasProperty(80)).toBe(false);
        expect(propertyFlags.getHasProperty(81)).toBe(false);
        expect(propertyFlags.getHasProperty(82)).toBe(true);
        expect(propertyFlags.getHasProperty(83)).toBe(true);
        expect(propertyFlags.getHasProperty(84)).toBe(true);
        expect(propertyFlags.getHasProperty(85)).toBe(false);
        expect(propertyFlags.getHasProperty(86)).toBe(false);
        expect(propertyFlags.getHasProperty(87)).toBe(false);
        expect(propertyFlags.getHasProperty(88)).toBe(false);
        expect(propertyFlags.getHasProperty(89)).toBe(false);
        expect(propertyFlags.getHasProperty(90)).toBe(false);
        expect(propertyFlags.getHasProperty(91)).toBe(true);
        expect(propertyFlags.getHasProperty(92)).toBe(true);
        expect(propertyFlags.getHasProperty(93)).toBe(true);
        expect(propertyFlags.getHasProperty(94)).toBe(true);
        expect(propertyFlags.getHasProperty(95)).toBe(true);
        expect(propertyFlags.getHasProperty(96)).toBe(true);
        expect(propertyFlags.getHasProperty(97)).toBe(true);
        expect(propertyFlags.getHasProperty(98)).toBe(true);
        expect(propertyFlags.getHasProperty(99)).toBe(true);
        expect(propertyFlags.getHasProperty(100)).toBe(true);
        expect(propertyFlags.getHasProperty(101)).toBe(true);
        expect(propertyFlags.getHasProperty(102)).toBe(true);
        expect(propertyFlags.getHasProperty(103)).toBe(true);
        expect(propertyFlags.getHasProperty(104)).toBe(true);
        expect(propertyFlags.getHasProperty(105)).toBe(true);
        expect(propertyFlags.getHasProperty(106)).toBe(true);
        expect(propertyFlags.getHasProperty(107)).toBe(true);
        expect(propertyFlags.getHasProperty(108)).toBe(true);
        expect(propertyFlags.getHasProperty(109)).toBe(true);
        expect(propertyFlags.getHasProperty(110)).toBe(true);
        expect(propertyFlags.getHasProperty(111)).toBe(false);
    });
});
