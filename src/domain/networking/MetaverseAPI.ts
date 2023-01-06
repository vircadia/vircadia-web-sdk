//
//  MetaverseAPI.ts
//
//  Created by David Rowe on 6 Jan 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Url from "../shared/Url";
import NetworkingConstants from "./NetworkingConstants";


/*@devdoc
 *  The <code>MetaverseAPI</code> class manages the metaverse that the {@link DomainServer} context is using.
 *  <p>The default metaverse server URL is {@link NetworkingConstants|NetworkingConstants.METAVERSE_SERVER_URL_STABLE}.</p>
 *  <p>C++: <code>namespace MetaverseAPI</code></p>
 *  @class MetaverseAPI
 */
class MetaverseAPI {
    // C++  namespace MetaverseAPI

    // This is a context item because each DomainServer instance may use a different metaverse server.
    // Settings are not used to store the metaverse server URL because that is a separate concern with a client may want to
    // implement itself.

    static readonly contextItemType = "MetaverseAPI";


    #_baseURL = new Url(NetworkingConstants.METAVERSE_SERVER_URL_STABLE);


    /*@devdoc
     *  Gets the metaverse server URL.
     *  @returns {Url} The metaverse server URL.
     */
    getBaseUrl(): Url {
        // C++  QUrl Settings::getBaseUrl()

        return this.#_baseURL;
    }

    /*@devdoc
     *  Sets the metaverse server URL if valid. Clears the metaverse server URL if invalid.
     *  @param {Url} url - The metaverse server URL.
     */
    setBaseUrl(url: Url): void {
        // C++  void Settings::setBaseUrl(const QUrl& value)

        if (url.isValid() && !url.isEmpty()) {
            this.#_baseURL = url;
        } else {
            this.#_baseURL = new Url();
        }
    }

    /*@devdoc
     *  Gets the metaverse server URL.
     *  @returns {Url} The metaverse server URL.
     */
    getCurrentMetaverseServerURL(): Url {
        return this.getBaseUrl();
    }

    /*@devdoc
     *  Gets the metaverse server URL's path.
     *  @param {boolean} [appendForwardSlash=false] <code>true</code> to include a trailing forward slash, <code>false</code> to
     *      not.
     *  @returns {string} The metaverse server URL's path.
     */
    getCurrentMetaverseServerURLPath(appendForwardSlash = false): string {
        let path = this.getCurrentMetaverseServerURL().path();

        if (path.length !== 0 && appendForwardSlash) {
            path += "/";
        }

        return path;
    }

}

export default MetaverseAPI;
