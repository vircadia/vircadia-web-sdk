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

        // 1 byte decoding.
        let bufferHex = "10dc";
        let bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        let data = new DataView(bufferArray.buffer);
        let codec = new ByteCountCoded();
        let bytesConsumed = codec.decode(data, bufferArray.length);

        expect(bytesConsumed).toBe(1);
        expect(codec.data).toBe(4n);

        // 1 byte encoding.
        let bufferHexExact = "10";
        let reEncodedArray = new Uint8Array(bufferHexExact.length / 2);
        let bytesWritten = codec.encode(new DataView(reEncodedArray.buffer));
        let reEncodedHex = Buffer.from(reEncodedArray).toString('hex');

        expect(bytesWritten).toBe(1);
        expect(reEncodedHex).toBe(bufferHexExact);

        // 2 bytes decoding.
        bufferHex = "8bfafffe3f";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);

        expect(bytesConsumed).toBe(2);
        expect(codec.data).toBe(6132n);

        // 2 byte encoding.
        bufferHexExact = "8bfa";
        reEncodedArray = new Uint8Array(bufferHexExact.length / 2);
        bytesWritten = codec.encode(new DataView(reEncodedArray.buffer));
        reEncodedHex = Buffer.from(reEncodedArray).toString('hex');

        expect(bytesWritten).toBe(2);
        expect(reEncodedHex).toBe(bufferHexExact);

        // 3 bytes decoding.
        bufferHex = "d20e80ffff8fff";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);

        expect(bytesConsumed).toBe(3);
        expect(codec.data).toBe(11785n);

        // 3 byte encoding.
        bufferHexExact = "d20e80";
        reEncodedArray = new Uint8Array(bufferHexExact.length / 2);
        bytesWritten = codec.encode(new DataView(reEncodedArray.buffer));
        reEncodedHex = Buffer.from(reEncodedArray).toString('hex');

        expect(bytesWritten).toBe(3);
        expect(reEncodedHex).toBe(bufferHexExact);

        // Zero decoding.
        bufferHex = "000e80ffff8fff";
        bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        data = new DataView(bufferArray.buffer);
        codec = new ByteCountCoded();
        bytesConsumed = codec.decode(data, bufferArray.length);

        expect(bytesConsumed).toBe(1);
        expect(codec.data).toBe(0n);

        // Zero encoding.
        bufferHexExact = "00";
        codec.data = 0n;
        reEncodedArray = new Uint8Array(bufferHexExact.length / 2);
        bytesWritten = codec.encode(new DataView(reEncodedArray.buffer));
        reEncodedHex = Buffer.from(reEncodedArray).toString('hex');

        expect(bytesWritten).toBe(1);
        expect(reEncodedHex).toBe(bufferHexExact);
    });

});
