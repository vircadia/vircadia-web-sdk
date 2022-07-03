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

import Quat from "../shared/Quat";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";
import Url from "../shared/Url";
import Uuid from "../shared/Uuid";
import Vec3 from "../shared/Vec3";


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
    #_locationChangeRequired = new SignalEmitter();


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
     * Takes you to a position and orientation resulting from a lookup for a path in the domain (set in the domain server's
     * settings).
     * @function AddressManager.goToViewpointForPath
     * @param {string} viewpoint - The position and orientation for the domain path.
     * @param {string} path - The domain path that was looked up on the domain server.
     */
    // eslint-disable-next-line
    goToViewpointForPath(viewpointString: string,  // @ts-ignore
        pathString: string): boolean {  // eslint-disable-line @typescript-eslint/no-unused-vars
        // C++  bool goToViewpointForPath(const QString& viewpointString, const QString& pathString)
        return this.#handleViewpoint(viewpointString, false);
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
        // C++  void pathChangeRequired(const QString& newPath)
        return this.#_pathChangeRequired.signal();
    }

    /*@devdoc
     *  Triggered when the user avatar location should change to that of a path looked up on the domain (set in the domain
     *  server's settings).
     *  @function AddressManager.locationChangeRequired
     *  @param {vec3} newPosition - The position that the user avatar should go to.
     *  @param {boolean} hasNewOrientation - <code>true</code> if the avatar should also change orientation,
     *      <code>false</code> if it shouldn't.
     *  @param {quat} newOrientation - The new orientation to use if <code>hasNewOrientation == true</code>.
     *  @param {boolean} shouldFaceLoation - <code>true</code> if the avatar should be positioned a short distance away from the
     *      <code>newPosition</code> and be orientated to face the position.
     *  @returns {Signal}
     */
    get locationChangeRequired(): Signal {
        // C++  void locationChangeRequired(const glm::vec3& newPosition, bool hasOrientationChange,
        //          const glm:: quat& newOrientation, bool shouldFaceLocation);
        return this.#_locationChangeRequired.signal();
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

    // Handles the IP or DNS network address part of an address.
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

    // Handles the path part of an address.
    #handlePath(path: string): void {
        // C++  void handlePath(const QString& path, LookupTrigger trigger, bool wasPathOnly)

        // WEBRTC TODO: Address further C++ code: trigger, wasPathOnly.

        // WEBRTC TODO: Address further C++ code: Handle viewpoints.

        this.#_pathChangeRequired.emit(path);
    }

    // Handles a viewpoint received from the domain server in response to a path query.
    #handleViewpoint(viewpointString: string, shouldFace: boolean): boolean {
        // C++  bool AddressManager:: handleViewpoint(const QString& viewpointString, bool shouldFace, LookupTrigger trigger,
        //          bool definitelyPathOnly, const QString& pathString)

        const FLOAT_REGEX_STRING = "([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)";
        const SPACED_COMMA_REGEX_STRING = "\\s*,\\s*";
        const POSITION_REGEX_STRING = "\\/" + FLOAT_REGEX_STRING + SPACED_COMMA_REGEX_STRING
            + FLOAT_REGEX_STRING + SPACED_COMMA_REGEX_STRING + FLOAT_REGEX_STRING + "\\s*(?:$|\\/)";
        const QUAT_REGEX_STRING = "\\/" + FLOAT_REGEX_STRING + SPACED_COMMA_REGEX_STRING
            + FLOAT_REGEX_STRING + SPACED_COMMA_REGEX_STRING + FLOAT_REGEX_STRING + SPACED_COMMA_REGEX_STRING
            + FLOAT_REGEX_STRING + "\\s*$";

        const positionRegex = new RegExp(POSITION_REGEX_STRING, "u");
        const positionMatch = positionRegex.exec(viewpointString);
        const EXPECTED_POSITION_MATCH_LENGTH = 4;  // [0] is the string matched, other indices are the ordinates.

        if (positionMatch !== null && positionMatch.length === EXPECTED_POSITION_MATCH_LENGTH) {

            // We have at least a position, so emit our signal to say we need to change position.
            /* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-magic-numbers */
            const newPosition = {
                x: parseFloat(positionMatch[1]!),
                y: parseFloat(positionMatch[2]!),
                z: parseFloat(positionMatch[3]!)
            };
            /* eslint-enable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-magic-numbers */

            // Web SDK: History is not handled.

            if (Vec3.valid(newPosition)) {
                let newOrientation = Quat.IDENTITY;

                const orientationRegex = new RegExp(QUAT_REGEX_STRING, "u");
                const orientationMatch = orientationRegex.exec(viewpointString.slice(positionRegex.lastIndex));
                const EXPECTED_ORIENTATION_MATCH_LENGTH = 5;  // [0] is the string matched, other indices are the ordinates.

                let orientationChanged = false;

                // We may also have an orientation.
                if (viewpointString[positionRegex.lastIndex] === "/"
                    && orientationMatch !== null && orientationMatch.length === EXPECTED_ORIENTATION_MATCH_LENGTH) {

                    /* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-magic-numbers */
                    newOrientation = {
                        x: parseFloat(orientationMatch[1]!),
                        y: parseFloat(orientationMatch[2]!),
                        z: parseFloat(orientationMatch[3]!),
                        w: parseFloat(orientationMatch[4]!)
                    };
                    /* eslint-enable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-magic-numbers */

                    if (Quat.valid(newOrientation)) {
                        newOrientation = Quat.normalize(newOrientation);
                        orientationChanged = true;
                    } else {
                        console.log("[networking] Orientation from viewpoint string not used because it is invalid.");
                    }
                }

                // WebRTC TODO: Address further C++ code. Trigger.

                this.#_locationChangeRequired.emit(newPosition, orientationChanged, newOrientation, shouldFace);

            } else {
                console.log("[networking] Could not jump to new position in viewpoint string because it is invalid.");
            }

            return true;
        }

        return false;
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
