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
import { buffer2hex } from "../../testUtils";


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
        expect(propertyFlags.length()).toBe(1);

        // Clear 1st bit.
        propertyFlags.setHasProperty(0, false);
        expect(propertyFlags.getHasProperty(0)).toBe(false);
        expect(propertyFlags.isEmpty()).toBe(true);
        expect(propertyFlags.length()).toBe(0);

        // Set 2nd bit.
        propertyFlags.setHasProperty(1, true);
        expect(propertyFlags.getHasProperty(1)).toBe(true);
        expect(propertyFlags.isEmpty()).toBe(false);
        expect(propertyFlags.length()).toBe(2);

        // Clear 2nd bit.
        propertyFlags.setHasProperty(1, false);
        expect(propertyFlags.getHasProperty(1)).toBe(false);
        expect(propertyFlags.isEmpty()).toBe(true);
        expect(propertyFlags.length()).toBe(0);

        // Set 1st, 2nd and 9th bits.
        propertyFlags.setHasProperty(0, true);
        propertyFlags.setHasProperty(1, true);
        propertyFlags.setHasProperty(8, true);
        expect(propertyFlags.getHasProperty(0)).toBe(true);
        expect(propertyFlags.getHasProperty(1)).toBe(true);
        expect(propertyFlags.getHasProperty(8)).toBe(true);
        expect(propertyFlags.isEmpty()).toBe(false);
        expect(propertyFlags.length()).toBe(9);
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
        expect(propertyFlags.getEncodedLength()).toBe(16);

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

        expect(propertyFlags.length()).toBe(111);
    });

    test("Can encode property flags", () => {
        const bufferHex = "fffe3fffcdfffffffffffff8381ffffe";

        const propertyFlags = new PropertyFlags();
        propertyFlags.setHasProperty(2, true);
        propertyFlags.setHasProperty(3, true);
        propertyFlags.setHasProperty(4, true);
        propertyFlags.setHasProperty(5, true);
        propertyFlags.setHasProperty(6, true);
        propertyFlags.setHasProperty(7, true);
        propertyFlags.setHasProperty(8, true);
        propertyFlags.setHasProperty(9, true);
        propertyFlags.setHasProperty(10, true);
        propertyFlags.setHasProperty(11, true);
        propertyFlags.setHasProperty(12, true);
        propertyFlags.setHasProperty(13, true);
        propertyFlags.setHasProperty(14, true);
        propertyFlags.setHasProperty(15, true);
        propertyFlags.setHasProperty(16, true);
        propertyFlags.setHasProperty(17, true);
        propertyFlags.setHasProperty(20, true);
        propertyFlags.setHasProperty(21, true);
        propertyFlags.setHasProperty(23, true);
        propertyFlags.setHasProperty(24, true);
        propertyFlags.setHasProperty(25, true);
        propertyFlags.setHasProperty(26, true);
        propertyFlags.setHasProperty(27, true);
        propertyFlags.setHasProperty(28, true);
        propertyFlags.setHasProperty(29, true);
        propertyFlags.setHasProperty(30, true);
        propertyFlags.setHasProperty(31, true);
        propertyFlags.setHasProperty(32, true);
        propertyFlags.setHasProperty(33, true);
        propertyFlags.setHasProperty(34, true);
        propertyFlags.setHasProperty(35, true);
        propertyFlags.setHasProperty(36, true);
        propertyFlags.setHasProperty(37, true);
        propertyFlags.setHasProperty(38, true);
        propertyFlags.setHasProperty(39, true);
        propertyFlags.setHasProperty(40, true);
        propertyFlags.setHasProperty(41, true);
        propertyFlags.setHasProperty(42, true);
        propertyFlags.setHasProperty(43, true);
        propertyFlags.setHasProperty(44, true);
        propertyFlags.setHasProperty(45, true);
        propertyFlags.setHasProperty(46, true);
        propertyFlags.setHasProperty(47, true);
        propertyFlags.setHasProperty(48, true);
        propertyFlags.setHasProperty(49, true);
        propertyFlags.setHasProperty(50, true);
        propertyFlags.setHasProperty(51, true);
        propertyFlags.setHasProperty(52, true);
        propertyFlags.setHasProperty(53, true);
        propertyFlags.setHasProperty(54, true);
        propertyFlags.setHasProperty(55, true);
        propertyFlags.setHasProperty(56, true);
        propertyFlags.setHasProperty(57, true);
        propertyFlags.setHasProperty(58, true);
        propertyFlags.setHasProperty(59, true);
        propertyFlags.setHasProperty(60, true);
        propertyFlags.setHasProperty(61, true);
        propertyFlags.setHasProperty(62, true);
        propertyFlags.setHasProperty(63, true);
        propertyFlags.setHasProperty(64, true);
        propertyFlags.setHasProperty(65, true);
        propertyFlags.setHasProperty(66, true);
        propertyFlags.setHasProperty(67, true);
        propertyFlags.setHasProperty(68, true);
        propertyFlags.setHasProperty(69, true);
        propertyFlags.setHasProperty(70, true);
        propertyFlags.setHasProperty(71, true);
        propertyFlags.setHasProperty(72, true);
        propertyFlags.setHasProperty(73, true);
        propertyFlags.setHasProperty(74, true);
        propertyFlags.setHasProperty(75, true);
        propertyFlags.setHasProperty(76, true);
        propertyFlags.setHasProperty(82, true);
        propertyFlags.setHasProperty(83, true);
        propertyFlags.setHasProperty(84, true);
        propertyFlags.setHasProperty(91, true);
        propertyFlags.setHasProperty(92, true);
        propertyFlags.setHasProperty(93, true);
        propertyFlags.setHasProperty(94, true);
        propertyFlags.setHasProperty(95, true);
        propertyFlags.setHasProperty(96, true);
        propertyFlags.setHasProperty(97, true);
        propertyFlags.setHasProperty(98, true);
        propertyFlags.setHasProperty(99, true);
        propertyFlags.setHasProperty(100, true);
        propertyFlags.setHasProperty(101, true);
        propertyFlags.setHasProperty(102, true);
        propertyFlags.setHasProperty(103, true);
        propertyFlags.setHasProperty(104, true);
        propertyFlags.setHasProperty(105, true);
        propertyFlags.setHasProperty(106, true);
        propertyFlags.setHasProperty(107, true);
        propertyFlags.setHasProperty(108, true);
        propertyFlags.setHasProperty(109, true);
        propertyFlags.setHasProperty(110, true);

        expect(propertyFlags.length()).toBe(111);

        const bufferArray = new Uint8Array(16);
        const data = new DataView(bufferArray.buffer);

        const bytesWritten = propertyFlags.encode(data, 0);
        expect(bytesWritten).toBe(16);
        expect(propertyFlags.getEncodedLength()).toBe(16);

        const bytes = buffer2hex(bufferArray);
        expect(bytes).toBe(bufferHex);
    });

    test("Can construct from another PropertyFlags object", () => {
        const bufferHex = "fffe3fffcdfffffffffffff8381ffffe";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();

        const bytesConsumed = propertyFlags.decode(data, 16, 0);
        expect(bytesConsumed).toBe(16);
        expect(propertyFlags.length()).toBe(111);
        const propertyFlagsCopy = new PropertyFlags(propertyFlags);
        expect(propertyFlagsCopy.length()).toBe(111);

        const originalArray = new Uint8Array(16);
        const originalData = new DataView(originalArray.buffer);
        propertyFlags.encode(originalData, 0);
        const originalBytes = buffer2hex(bufferArray);
        expect(originalBytes).toBe(bufferHex);

        const copyArray = new Uint8Array(16);
        const copyData = new DataView(copyArray.buffer);
        propertyFlags.encode(copyData, 0);
        const copyBytes = buffer2hex(bufferArray);
        expect(copyBytes).toBe(bufferHex);
    });

    test("Can copy from another PropertyFlags object", () => {
        const bufferHex = "fffe3fffcdfffffffffffff8381ffffe";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const propertyFlags = new PropertyFlags();

        const bytesConsumed = propertyFlags.decode(data, 16, 0);
        expect(bytesConsumed).toBe(16);
        expect(propertyFlags.length()).toBe(111);
        const propertyFlagsCopy = new PropertyFlags();
        propertyFlagsCopy.copy(propertyFlags);
        expect(propertyFlagsCopy.length()).toBe(111);

        const originalArray = new Uint8Array(16);
        const originalData = new DataView(originalArray.buffer);
        propertyFlags.encode(originalData, 0);
        const originalBytes = buffer2hex(bufferArray);
        expect(originalBytes).toBe(bufferHex);

        const copyArray = new Uint8Array(16);
        const copyData = new DataView(copyArray.buffer);
        propertyFlags.encode(copyData, 0);
        const copyBytes = buffer2hex(bufferArray);
        expect(copyBytes).toBe(bufferHex);
    });

    test("Can \"or()\" two PropertyFlags objects", () => {
        const propertyFlagsA = new PropertyFlags();
        propertyFlagsA.setHasProperty(0, true);
        propertyFlagsA.setHasProperty(1, true);
        propertyFlagsA.setHasProperty(2, false);
        propertyFlagsA.setHasProperty(3, false);
        propertyFlagsA.setHasProperty(8, true);

        const propertyFlagsB = new PropertyFlags();
        propertyFlagsB.setHasProperty(1, false);
        propertyFlagsB.setHasProperty(2, true);
        propertyFlagsB.setHasProperty(11, true);

        propertyFlagsA.or(propertyFlagsB);

        expect(propertyFlagsA.getHasProperty(0)).toBe(true);
        expect(propertyFlagsA.getHasProperty(1)).toBe(true);
        expect(propertyFlagsA.getHasProperty(2)).toBe(true);
        expect(propertyFlagsA.getHasProperty(3)).toBe(false);
        expect(propertyFlagsA.getHasProperty(8)).toBe(true);
        expect(propertyFlagsA.getHasProperty(11)).toBe(true);
    });

    test("Can output debug information", () => {
        let debugMessage = "";
        const debug = jest.spyOn(console, "debug").mockImplementation((...message) => {
            debugMessage = message.join(" ");
        });

        const propertyFlags = new PropertyFlags();
        propertyFlags.setHasProperty(0, true);
        propertyFlags.setHasProperty(1, true);
        propertyFlags.setHasProperty(8, true);
        expect(propertyFlags.getHasProperty(0)).toBe(true);
        expect(propertyFlags.getHasProperty(1)).toBe(true);
        expect(propertyFlags.getHasProperty(8)).toBe(true);

        propertyFlags.debugDumpBits();
        expect(debugMessage).toBe("bits: 110000001");

        propertyFlags.debugDumpBits("Test");
        expect(debugMessage).toBe("Test bits: 110000001");

        debug.mockReset();
    });

});
