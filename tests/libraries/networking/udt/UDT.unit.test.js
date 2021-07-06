//
//  UDT.unit.test.js
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable no-magic-numbers */

import UDT from "../../../../src/libraries/networking/udt/UDT.js";


describe("UDT - unit tests", () => {

    test("UDT values can be accessed", () => {
        expect(UDT.MAX_PACKET_SIZE).toBe(1464);
        expect(UDT.LITTLE_ENDIAN).toBe(true);
        expect(UDT.BIG_ENDIAN).toBe(false);
    });

});
