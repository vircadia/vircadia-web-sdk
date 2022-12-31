//
//  AccountManager.unit.test.js
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManager from "../../../src/domain/networking/AccountManager";
import ContextManager from "../../../src/domain/shared/ContextManager";


describe("AccountManager - unit tests", () => {

    test("The AccountManager can be obtained from the ContextManager", () => {
        const contextID = ContextManager.createContext();
        ContextManager.set(contextID, AccountManager);
        const accountManager = ContextManager.get(contextID, AccountManager);
        expect(accountManager instanceof AccountManager).toBe(true);
    });

});
