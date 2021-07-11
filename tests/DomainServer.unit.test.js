//
//  DomainServer.unit.test.js
//
//  Created by David Rowe on 8 Jul 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainServer from "../src/DomainServer.js";


describe("DomainServer - unit tests", () => {

    test("Is connected", () => {
        expect(DomainServer.isConnected).toBe(false);
    });

});
