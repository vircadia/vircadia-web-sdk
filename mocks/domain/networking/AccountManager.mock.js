//
//  AccountManager.mock.js
//
//  Created by David Rowe on 7 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManager from "../../../src/domain/networking/AccountManager";


const AccountManagerMock = new class {

    /* eslint-disable class-methods-use-this */

    mock() {
        jest
            .spyOn(AccountManager.prototype, "generateNewUserKeypair")
            .mockImplementation(() => {
                /* No-op. */
            });
        jest
            .spyOn(AccountManager.prototype, "refreshAccessToken")
            .mockImplementation(() => {
                /* No-op. */
            });
    }

}();

export default AccountManagerMock;
