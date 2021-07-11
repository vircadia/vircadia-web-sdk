//
//  Vircadia.integration.test.js
//
//  Created by David Rowe on 11 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Vircadia, DomainServer } from "../src/Vircadia.js";


describe("Vircadia - integration tests", () => {

    test("Multiple API import", () => {
        expect(Vircadia).toBeDefined();
        expect(DomainServer).toBeDefined();
    });

});
