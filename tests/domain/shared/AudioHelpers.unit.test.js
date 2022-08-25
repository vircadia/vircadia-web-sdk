//
//  AudioHelpers.unit.test.js
//
//  Created by David Rowe on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioHelpers from "../../../src/domain/shared/AudioHelpers";


describe("AudioHelpers - unit tests", () => {

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    test("packFloatGainToByte() output is correct", () => {
        expect(AudioHelpers.packFloatGainToByte(0)).toBe(0);
        expect(AudioHelpers.packFloatGainToByte(0.604)).toBe(186);
        expect(AudioHelpers.packFloatGainToByte(1000)).toBe(255);
    });

    test("unpackFloatGainFromByte - unit tests", () => {
        expect(AudioHelpers.unpackFloatGainFromByte(164)).toBeCloseTo(0.167881, 5);
        expect(AudioHelpers.unpackFloatGainFromByte(16)).toBeCloseTo(3.34964e-05, 5);
        expect(AudioHelpers.unpackFloatGainFromByte(0)).toBe(0);
    });

});
