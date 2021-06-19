//
//  FingerprintUtils.js
//
//  Created by David Rowe on 14 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../shared/Uuid.js";


/*@devdoc
 *  Identifies the computer running this code with an anonymous fingerprint.
 *  <p>C++: <code>FingerprintUtils</code>
 *  @namespace FingerprintUtils
 */
const FingerprintUtils = new (class {
    // C++  FingerprintUtils

    // Dummy value for now.
    #_machineFingerprint = new Uuid(213897485297723222451865858523432009088n); /* eslint-disable-line no-magic-numbers */

    // WEBRTC TODO: Address further C++ code.

    /*@devdoc
     *  Gets the machine fingerprint.
     *  @function FingerprintUtils.getMachineFingerprint
     *  @returns {Uuid} Machine fingerprint.
     */
    getMachineFingerprint() {
        // C++  QUuid FingerprintUtils::getMachineFingerprint()

        // WEBRTC TODO: Address further C++ code.

        return this.#_machineFingerprint;
    }

})();

export default FingerprintUtils;
