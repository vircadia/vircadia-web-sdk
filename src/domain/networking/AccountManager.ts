//
//  AccountManager.ts
//
//  Created by David Rowe on 31 Dec 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { OAuthJSON } from "../interfaces/AccountInterface";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import DataServerAccountInfo from "./DataServerAccountInfo";

/*@devdoc
 *  The <code>AccountManager</code> class manages the user's account on the domain.
 *  @class AccountManager
 *  @param {number} contextID - The {@link ContextManager} context ID.
 *
 *  @property {Signal<AccountManager~UsernameChanged>} usernameChanged - Triggered when the username changes.
 *      <em>Read-only.</em>
 *  @property {Signal<AccountManager~LoginComplete>} loginComplete - Triggered when the user completes their login.
 *      <em>Read-only.</em>
 */
class AccountManager {
    // C++  class AccountManager : public QObject, public Dependency

    static readonly contextItemType = "AccountManager";


    #_accountInfo = new DataServerAccountInfo();
    #_usernameChanged = new SignalEmitter();
    #_loginComplete = new SignalEmitter();


    /*@sdkdoc
     *  Called when the username changes.
     *  @callback AccountManager~UsernameChanged
     *  @param {string} username - The new username.
     */
    get usernameChanged(): Signal {
        return this.#_usernameChanged.signal();
    }

    /*@sdkdoc
     *  Called when the user completes their login.
     *  @callback AccountManager~LoginComplete
     */
    get loginComplete(): Signal {
        return this.#_loginComplete.signal();
    }


    /*@devdoc
     *  Sets the user's username.
     *  @param {string} username - The user's username.
     */
    setUsername(username: string): void {
        // C++  void AccountManager::requestProfileFinished()

        // WEBRTC TODO: Address further C++ code.

        this.#_accountInfo.setUsername(username);

        // WEBRTC TODO: Address further C++ code.

        this.#_usernameChanged.emit(this.#_accountInfo.getUsername());

        // WEBRTC TODO: Address further C++ code.

    }

    /*@devdoc
     *  Gets the user's username.
     *  @returns {string} The user's username.
     */
    getUsername(): string {
        // C++  N/A
        return this.#_accountInfo.getUsername();
    }

    /*@devdoc
     *  Sets the access token from a JSON object.
     *  @param {OAuthJSON} json - The JSON object containing the access token details.
     */
    setAccessTokenFromJSON(json: OAuthJSON): void {
        // void AccountManager::requestAccessTokenFinished()

        // WEBRTC TODO: Address further C++ code.

        this.#_accountInfo.setAccessTokenFromJSON(json);

        this.#_loginComplete.emit();

        // WEBRTC TODO: Address further C++ code.

    }
}

export default AccountManager;
