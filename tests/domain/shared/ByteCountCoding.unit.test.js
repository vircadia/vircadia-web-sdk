//
//  ByteCountCoding.unit.test.js
//
//  Created by Julien Merzoug on 01 June 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import ByteCountCoded from "../../../src/domain/shared/ByteCountCoding";


describe("ByteCountCoding - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */


    test("Can decode an encoded byte", () => {

        // 2 bytes buffer.
        const bufferHex = "10dc";
        const bufferArray = new Uint8Array(bufferHex.match(/[\da-f]{2}/giu).map(function (hex) {
            return parseInt(hex, 16);
        }));
        const data = new DataView(bufferArray.buffer);
        const codec = new ByteCountCoded();
        const bytesConsumed = codec.decode(data, 2, 0);

        expect(bytesConsumed).toBe(1);
        expect(codec.data).toBe(4);

    });

});
