//
//  ByteCountCoded.unit.test.js
//
//  Created by Julien Merzoug on 01 June 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ByteCountCoded from "../../../src/domain/shared/ByteCountCoded";
import { buffer2hex } from "../../testUtils";


describe("ByteCountCoded - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can decode byte count encoded data", () => {

        // 1 byte encoded.
        let bufferHex = "10dc";
        let bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        let data = new DataView(bufferArray.buffer);
        let codec = new ByteCountCoded();
        let bytesConsumed = codec.decode(data, bufferArray.length);
        expect(bytesConsumed).toBe(1);
        expect(codec.data).toBe(4n);

        // 2 bytes encoded.
        bufferHex = "8bfafffe3f";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);
        expect(bytesConsumed).toBe(2);
        expect(codec.data).toBe(6132n);

        // 3 bytes encoded.
        bufferHex = "d20e80ffff8fff";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);
        expect(bytesConsumed).toBe(3);
        expect(codec.data).toBe(11785n);

        // 0 encoding.
        bufferHex = "00dc";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);
        expect(bytesConsumed).toBe(1);
        expect(codec.data).toBe(0n);
    });

    test("Can byte count encode data", () => {
        const codec = new ByteCountCoded();

        // 1 byte encoded.
        let bufferHex = "1000";
        codec.data = 4n;
        let bufferArray = new Uint8Array(2);
        let bytesWritten = codec.encode(new DataView(bufferArray.buffer, 0));
        expect(bytesWritten).toBe(1);
        expect(buffer2hex(bufferArray)).toBe(bufferHex);

        // 2 bytes encoded.
        bufferHex = "8bfa0000";
        codec.data = 6132n;
        bufferArray = new Uint8Array(4);
        bytesWritten = codec.encode(new DataView(bufferArray.buffer, 0));
        expect(bytesWritten).toBe(2);
        expect(buffer2hex(bufferArray)).toBe(bufferHex);

        // 3 bytes encoded.
        bufferHex = "d20e80000000";
        codec.data = 11785n;
        bufferArray = new Uint8Array(6);
        bytesWritten = codec.encode(new DataView(bufferArray.buffer, 0));
        expect(bytesWritten).toBe(3);
        expect(buffer2hex(bufferArray)).toBe(bufferHex);

        // 0 encoding.
        bufferHex = "0000";
        codec.data = 0n;
        bufferArray = new Uint8Array(2);
        bytesWritten = codec.encode(new DataView(bufferArray.buffer, 0));
        expect(bytesWritten).toBe(1);
        expect(buffer2hex(bufferArray)).toBe(bufferHex);
    });

});
