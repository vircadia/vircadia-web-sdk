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


type OAuthJSON = {
    /* eslint-disable camelcase */
    access_token?: string,
    token_type?: string,
    expires_in?: number,
    refresh_token?: string,
    error?: unknown,
    error_description?: string
    /* eslint-enable camelcase */
};


/*@sdkdoc
 *  The <code>AccountInterface</code> namespace provides facilities for working with the user's account in the domain. It is
 *  provided as the <code>account</code> property of the {@link DomainServer} class.
 *  @namespace AccountInterface
 *  @comment Don't document the constructor because it shouldn't be used in the SDK.
 *
 */
class AccountInterface {
    // C++  class AccountServicesScriptingInterface : public QObject

    /*@sdkdoc
     *  Metaverse OAuth login details.
     *  @typedef {object} OAuthJSON
     *  @property {string} [access_token] - Access token.
     *  @property {string} [token_type] - Token type.
     *  @property {number} [expires_in] - How long the access token is valid for, in seconds.
     *  @property {string} [refresh_token] - Refresh token.
     *  @property {unknown} [error] - Present if an error has occurred trying to log in.
     *  @property {string} [error_description] - A description of the error.
     */


    #_accountManager: AccountManager;


    constructor(contextID: number) {
        this.#_accountManager = ContextManager.get(contextID, AccountManager) as AccountManager;
        assert(this.#_accountManager !== undefined);
    }


    /*@sdkdoc
     *  Logs the user into the domain server with a username and OAuth received from the metaverse server.
     *  @param {string} username - The user's username.
     *  @param {OAuthJSON} oAuthJSON - The metaverse OAuth login details.
     */
    login(username: string, oAuthJSON: OAuthJSON): void {
        // C++  bool AccountServicesScriptingInterface::checkAndSignalForAccessToken()
        // C++  void AccountManager::requestAccessTokenFinished()
        if (typeof username !== "string" || username.length === 0) {
            console.error("[AccountInterface] Tried to set login for invalid username.");
            return;
        }
        if (oAuthJSON.error !== undefined) {
            console.error("[AccountInterface] Error in OAuth response for password grant:", oAuthJSON.error_description);
            return;
        }

        if (typeof oAuthJSON.access_token !== "string" || typeof oAuthJSON.token_type !== "string"
            || typeof oAuthJSON.expires_in !== "number" || typeof oAuthJSON.refresh_token !== "string") {
            console.error("[AccountInterface] Received an invalid OAuth response for password grant.");
            return;
        }

        this.#_accountManager.setUsername(username);
        this.#_accountManager.setAccessTokenFromJSON(oAuthJSON);
    }

    /*@sdkdoc
     *  Logs the user out of the domain server.
     */
    logout(): void {
        // C++  AccountServicesScriptingInterface::logOut()
        this.#_accountManager.logout();
    }

    /*@sdkdoc
     *  Gets whether the user is logged into the domain server.
     *  @returns {boolean} <code>true</code> if the user is logged into the domain server, <code>false</code> if they're not.
     */
    isLoggedIn(): boolean {
        // C++  bool AccountServicesScriptingInterface::isLoggedIn() {
        return this.#_accountManager.isLoggedIn();
    }

}

export default AccountInterface;
export type { OAuthJSON };
