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

    readonly #_MACHINE_FINGERPRINT_KEY = "mfp";

    readonly #_machineFingerprint;

    constructor() {
        if (typeof localStorage !== "undefined") {
            // Browser.
            // JavaScript security prevents the creation of (doesn't provide the means to) unique machine IDs.
            // We store and retrieve a Uuid to local storage.
            const machineFingerprint = localStorage.getItem(this.#_MACHINE_FINGERPRINT_KEY);
            if (machineFingerprint === null) {
                this.#_machineFingerprint = Uuid.createUuid();
                localStorage.setItem(this.#_MACHINE_FINGERPRINT_KEY, this.#_machineFingerprint.stringify());
            } else {
                this.#_machineFingerprint = new Uuid(machineFingerprint);
            }
        } else {
            // Node.

            // TODO.

            this.#_machineFingerprint = Uuid.createUuid();
        }
    }


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
