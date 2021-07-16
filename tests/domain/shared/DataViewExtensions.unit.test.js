//
//  DataViewExtensions.unit.test.js
//
//  Created by David Rowe on 16 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import "../../../src/domain/shared/DataViewExtensions";


describe("DataView - unit tests", () => {

    test("Can write and read a Uint128 value big-endian", () => {
        const arrayBuffer = new ArrayBuffer(32);
        const dataView = new DataView(arrayBuffer);
        const offset = 4;
        const value = 2n ** 127n + 3n;  // Most-significant and 2 least-significant bits.
        dataView.setBigUint128(offset, value);
        expect(dataView.getBigUint128(offset, false)).toBe(value);
    });

    test("Can write and read a Uint128 value little-endian", () => {
        const arrayBuffer = new ArrayBuffer(32);
        const dataView = new DataView(arrayBuffer);
        const offset = 4;
        const value = 2n ** 127n + 3n;  // Most-significant and 2 least-significant bits.
        dataView.setBigUint128(offset, value, true);
        expect(dataView.getBigUint128(offset, true)).toBe(value);
    });

    test("A too-large Uint128 value overflows to 0", () => {
        const arrayBuffer = new ArrayBuffer(32);
        const dataView = new DataView(arrayBuffer);
        const MAX_U128_VALUE = 2n ** 128n - 1n;
        const offset = 4;
        dataView.setBigUint128(offset, MAX_U128_VALUE + 1n);
        expect(dataView.getBigUint128(offset)).toBe(0n);
    });

});
