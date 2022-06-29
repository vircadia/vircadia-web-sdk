//
//  BitVectorHelpers.unit.test.js
//
//  Created by David Rowe on 24 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import BitVectorHelpers from "../../../src/domain/shared/BitVectorHelpers";
import { buffer2hex } from "../../testUtils";


describe("BitVectorHelpers - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("Can calculate the number of bytes needed for a number of bits", () => {
        expect(BitVectorHelpers.calcBitVectorSize(0)).toBe(0);
        expect(BitVectorHelpers.calcBitVectorSize(1)).toBe(1);
        expect(BitVectorHelpers.calcBitVectorSize(7)).toBe(1);
        expect(BitVectorHelpers.calcBitVectorSize(8)).toBe(1);
        expect(BitVectorHelpers.calcBitVectorSize(9)).toBe(2);
        expect(BitVectorHelpers.calcBitVectorSize(31)).toBe(4);
        expect(BitVectorHelpers.calcBitVectorSize(32)).toBe(4);
        expect(BitVectorHelpers.calcBitVectorSize(33)).toBe(5);
    });

    test("Can write a bit vector for an array and an evaluation function", () => {
        const buffer = new ArrayBuffer(4);
        const data = new DataView(buffer);
        const bytesWritten = BitVectorHelpers.writeBitVector(data, 1,
            [null, 1, {}, 1, "", null, null, 1, null, 2, 2],
            (value) => {
                return value !== null;
            }
        );
        const bytes = buffer2hex(buffer);
        expect(bytesWritten).toBe(2);
        expect(bytes).toBe("009e0600");
    });

    /* eslint-enable @typescript-eslint/no-magic-numbers */

});
