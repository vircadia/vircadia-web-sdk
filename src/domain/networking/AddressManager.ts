//
//  AddressManager.ts
//
//  Created by David Rowe on 6 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Signal from "../shared/Signal";
import Uuid from "../shared/Uuid";


/*@devdoc
 *  Manages your current location in the metaverse.
 *  <p>C++: <code>AddressManager : public QObject, public Dependency</code></p>
 *  @namespace AddressManager
 */
const AddressManager = new class {
    // C++  AddressManager : public QObject, public Dependency

    private _domainUrl = "";
    private _possibleDomainChangeRequired = new Signal();


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
            this.handlerUrl(sanitizedAddress);
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
     *  @param {string} url - The domain address.
     *  @param {Uuid} id - The domain ID. May be {@link Uuid(1)|Uuid.NULL} if not yet known.
     *  @returns {Signal}
     */
    get possibleDomainChangeRequired(): Signal {
        // C++  void possibleDomainChangeRequired(QUrl domainURL, QUuid domainID);
        return this._possibleDomainChangeRequired;
    }


    private handlerUrl(url: string): boolean {
        // C++  bool handleUrl(const QUrl& lookupUrl, LookupTrigger trigger = UserInput)

        // WEBRTC TODO: Address further C++ code.

        this._domainUrl = url;
        this._possibleDomainChangeRequired.emit(this._domainUrl, Uuid.NULL);

        // WEBRTC TODO: Address further C++ code.

        return true;
    }

}();

export default AddressManager;
