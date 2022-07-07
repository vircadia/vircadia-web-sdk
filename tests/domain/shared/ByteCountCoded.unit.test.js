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
        expect(codec.data).toBe(4);

        // 2 bytes encoded.
        bufferHex = "8bfafffe3f";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);

        expect(bytesConsumed).toBe(2);
        expect(codec.data).toBe(6132);

        // 3 bytes encoded.
        bufferHex = "d20e80ffff8fff";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);

        expect(bytesConsumed).toBe(3);
        expect(codec.data).toBe(11785);
    });

});
