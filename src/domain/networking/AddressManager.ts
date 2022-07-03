//
//  AddressManager.ts
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Url from "../shared/Url";
import Uuid from "../shared/Uuid";


/*@devdoc
 *  The <code>AddressManager</code> class manages the current location in the metaverse.
 *  <p>C++: <code>AddressManager : public QObject, public Dependency</code></p>
 *
 *  @class AddressManager
 *  @property {string} contextItemType="AddressManager" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 */
class AddressManager {
    // C++  AddressManager : public QObject, public Dependency

    static readonly contextItemType = "AddressManager";


    readonly #_INDEX_PATH = "/";

    #_domainURL = new Url();
    #_possibleDomainChangeRequired = new SignalEmitter();
    #_pathChangeRequired = new SignalEmitter();


    /*@devdoc
     *  Takes you to a specified metaverse address.
     *  @function AddressManager.handleLookupString
     *  @param {string} address - The address to go to.
     *  @param {boolean} [from=false] - Set to <code>true</code> if the address is obtained from the "Explore" app. Helps ensure
     *      that the user's location history is correctly maintained.
     */
    handleLookupString(address: string): void {
        // C++  void handleLookupString(const QString& lookupString, bool fromSuggestions = false)

        // WEBRTC TODO: Address further C++ code.

        const sanitizedAddress = address.trim();
        if (sanitizedAddress.length > 0) {
            this.#handlerUrl(sanitizedAddress);
        }

        // WEBRTC TODO: Address further C++ code.
    }

    /*@devdoc
     *  Gets the domain's place name.
     *  @function AddressManager.getPlaceName
     *  @returns {string} The domain's place name if known, otherwise <code>""</code>.
     */
    getPlaceName(): string {  // eslint-disable-line class-methods-use-this
        // C++  QString getPlaceName()

        // WEBRTC TODO: Address further C++ code.

        return "";
    }

    /*@devdoc
     *  Triggered when a request is made to go to a URL or IP address.
     *  @function AddressManager.possibleDomainChangeRequired
     *  @param {Url} url - The domain address.
     *  @param {Uuid} id - The domain ID. May be {@link Uuid(1)|Uuid.NULL} if not yet known.
     *  @returns {Signal}
     */
    get possibleDomainChangeRequired(): Signal {
        // C++  void possibleDomainChangeRequired(QUrl domainURL, QUuid domainID)
        return this.#_possibleDomainChangeRequired.signal();
    }

    /*@devdoc
     *  Triggered when an attempt is made to go to a path on the domain (set in the domain server's settings).
     *  @function AddressManager.pathChangeRequired
     *  @param {string} newPath - The new path to go to, e.g., <code>"/"</code>.
     *  @returns {Signal}
     */
    get pathChangeRequired(): Signal {
        // C++   void pathChangeRequired(const QString& newPath)
        return this.#_pathChangeRequired.signal();
    }


    // Handles going to a Vircadia address - hifi:// URL, placename, etc.
    #handlerUrl(lookupUrlIn: string): boolean {
        // C++  bool handleUrl(const QUrl& lookupUrlIn, LookupTrigger trigger, const QString& lookupUrlInString)
        console.log("[networking] Trying to go to URL:", lookupUrlIn);

        const lookupUrl = new Url(lookupUrlIn);

        // WEBRTC TODO: Address further C++ code: Handle different Vircadia address types.

        // WEBRTC TODO: Use "hifi://" instead of "ws(s)://" but treat the latter as a synonym.
        //              Automatically try both "wss://" and "ws://" when connecting.

        if (lookupUrl.scheme() === "wss" || lookupUrl.scheme() === "ws") {

            if (this.#handleNetworkAddress(lookupUrl.host()
                    + (lookupUrl.port() === -1 ? "" : ":" + lookupUrl.port().toString()), lookupUrl.scheme())) {

                // WEBRTC TODO: Address further C++ code: _lastVisitedURL, _previousAPILookup, trigger.

                // If a path is not included, use the index path.
                let path = lookupUrl.path();
                if (path === "") {
                    path = this.#_INDEX_PATH;
                }

                this.#handlePath(path);

                return true;
            }

        }

        // WEBRTC TODO: Address further C++ code.

        console.warn("[AddressManager] Unable to handle address:", lookupUrlIn);

        return false;
    }

    #handleNetworkAddress(lookupString: string, scheme: string): boolean {
        // C++  bool handleNetworkAddress(const QString& lookupString, LookupTrigger trigger, bool& hostChanged)

        // The Web SDK code is simplified to remove the redundancy in the C++ code.

        /* eslint-disable max-len, prefer-named-capture-group */
        const IP_ADDRESS_REGEX = /^((?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(?::(\d{1,5}))?$/iu;
        const HOSTNAME_REGEX = /^((?:[A-Z0-9]|[A-Z0-9][A-Z0-9-]{0,61}[A-Z0-9])(?:\.(?:[A-Z0-9]|[A-Z0-9][A-Z0-9-]{0,61}[A-Z0-9]))+|localhost)(?::(\d{1,5}))?$/iu;
        /* eslint-enable max-len, prefer-named-capture-group */

        if (IP_ADDRESS_REGEX.test(lookupString) || HOSTNAME_REGEX.test(lookupString)) {

            // WEBRTC TODO: Use URL_SCHEME_VIRCADIA instead of ws(s)://.

            const domainURL = new Url(scheme + "://" + lookupString);

            this.#setDomainInfo(domainURL);

            return true;
        }

        return false;
    }

    #handlePath(path: string): void {
        // C++  void handlePath(const QString& path, LookupTrigger trigger, bool wasPathOnly)

        // WEBRTC TODO: Address further C++ code: trigger, wasPathOnly.

        // WEBRTC TODO: Address further C++ code: Handle viewpoints.

        this.#_pathChangeRequired.emit(path);
    }

    #setDomainInfo(domainURL: Url): boolean {
        // C++  bool setDomainInfo(const QUrl& domainURL, LookupTrigger trigger)

        const hostname = domainURL.host();
        const port = domainURL.port();
        let emitHostChanged = false;

        const isInErrorState = false;  // The error state is only used for interstitial mode which the Web SDK doesn't support.
        if (domainURL.toString() !== this.#_domainURL.toString() || isInErrorState) {

            // WEBRTC TOSO: Address further C++ code: Address history.

            emitHostChanged = true;
        }

        this.#_domainURL = domainURL;

        // WEBRTC TODO: Address further C++. Shareable placename. Current place.

        if (this.#_domainURL.scheme() === "ws" || this.#_domainURL.scheme() === "wss") {
            console.log(`[networking] Possible domain change required to connect to domain at ${hostname} on ${port}.`);
        } else {
            // WEBRTC TODO: Address further C++ code. Serverless domain.
        }

        // WEBRTC TODO: Address further C++ code.

        this.#_possibleDomainChangeRequired.emit(this.#_domainURL, Uuid.NULL);

        return emitHostChanged;
    }

}

export default AddressManager;
