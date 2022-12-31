//
//  AccountInterface.unit.test.js
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountInterface from "../../../src/domain/interfaces/AccountInterface";
import DomainServer from "../../../src/DomainServer";


describe("AccountInterface - unit tests", () => {

    test("Can access the account interface", () => {
        const domainServer = new DomainServer();
        expect(domainServer.account instanceof AccountInterface).toBe(true);
    });

});
