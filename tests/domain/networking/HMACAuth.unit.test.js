//
//  HMACAuth..unit.test.js
//
//  Created by David Rowe on 27 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../../../src/domain/shared/Uuid";
import HMACAuth from "../../../src/domain/networking/HMACAuth";
import "../../../src/domain/shared/DataViewExtensions";


describe("HNACAuth - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    // Data captured from C++.
    // eslint-disable-next-line max-len
    const dataHex = "000000004016502c000000000000000000000000000000000406000000686966694143040000006f7075730300000070636d040000007a6c6962";
    const DATA_OFFSET = 24;
    const keyHex = "8a7660882a6940bda7d8b678fe8cee81";
    const hashHex = "176f5ea71473ea9d8592060ddf38337f";
    const dataUint8Array = new Uint8Array(dataHex.match(/[\da-f]{2}/giu).map(function (hex) {
        return parseInt(hex, 16);
    }));
    const keyUuid = new Uuid(BigInt("0x" + keyHex));
    const hashValue = BigInt("0x" + hashHex);


    test("Can get but not set HMACAuth values", () => {
        expect(HMACAuth.MD5).toBe(0);
        expect(HMACAuth.RIPEMD160).toBe(4);
        let caughtError = false;
        try {
            HMACAuth.MD5 = 1;  // Shouldn't succeed;
        } catch (e) {
            caughtError = true;
        }
        expect(caughtError).toBe(true);
        expect(HMACAuth.MD5).toBe(0);
    });

    test("Setting the key failure and success", () => {
        const hmacAuth = new HMACAuth();
        expect(hmacAuth.setKey(new Uuid())).toBe(false);
        expect(hmacAuth.setKey(new Uuid(BigInt("0x176f5ea71473ea9d8592060ddf38337f")))).toBe(true);
    });

    test("Hashing before setting the key fails", () => {
        const hmacAuth = new HMACAuth();
        const resultUint8Array = new Uint8Array(16);
        const hashSet = hmacAuth.calculateHash(resultUint8Array, dataUint8Array, DATA_OFFSET);
        expect(hashSet).toBe(false);
    });

    test("An example hash produces the expected result", () => {
        const hmacAuth = new HMACAuth();
        const keySet = hmacAuth.setKey(keyUuid);
        expect(keySet).toBe(true);

        const resultUint8Array = new Uint8Array(16);
        const hashSet = hmacAuth.calculateHash(resultUint8Array, dataUint8Array, DATA_OFFSET);
        expect(hashSet).toBe(true);
        const resultValue = new DataView(resultUint8Array.buffer).getBigUint128(0);
        expect(resultValue).toEqual(hashValue);
    });


});
