//
//  FingerprintUtils.ts
//
//  Created by David Rowe on 14 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Uuid from "../shared/Uuid";


/*@devdoc
 *  The <code>FingerPrintUtils</code> namespace identifies the computer running this code with an anonymous fingerprint.
 *  <p>C++: <code>FingerprintUtils</code>
 *  @namespace FingerprintUtils
 */
const FingerprintUtils = new class {
    // C++  FingerprintUtils

    // Dummy value for now.
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    readonly #_machineFingerprint = new Uuid(213897485297723222451865858523432009088n);

    // WEBRTC TODO: Address further C++ code.

    /*@devdoc
     *  Gets the machine fingerprint.
     *  @function FingerprintUtils.getMachineFingerprint
     *  @returns {Uuid} Machine fingerprint.
     */
    getMachineFingerprint() {
        // C++  QUuid getMachineFingerprint()

        // WEBRTC TODO: Address further C++ code.

        return this.#_machineFingerprint;
    }

}();

export default FingerprintUtils;
