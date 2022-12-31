//
//  AccountInterface.ts
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AccountManager from "../networking/AccountManager";
import assert from "../shared/assert";
import ContextManager from "../shared/ContextManager";


/*@sdkdoc
 *  The <code>AccountInterface</code> namespace provides facilities for working with the user's account in the domain. It is
 *  provided as the <code>account</code> property of the {@link DomainServer} class.
 *  @namespace AccountInterface
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
 *
 */
class AccountInterface {
    // C++  class AccountServicesScriptingInterface : public QObject

    #_accountManager: AccountManager;


    constructor(contextID: number) {
        this.#_accountManager = ContextManager.get(contextID, AccountManager) as AccountManager;
        assert(this.#_accountManager !== undefined);
    }

}


export default AccountInterface;
