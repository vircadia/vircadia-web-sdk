//
//  AudioHelpers.ts
//
//  Created by David Rowe on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */

// Quantize a non-negative gain value to the nearest 0.5dB, and pack to a byte.
// - Values above +30dB are clamped to +30dB
// - Values below -97dB are clamped to -inf
// - Value of 1.0 (+0dB) is reconstructed exactly
const GAIN_CONVERSION_RATIO = 2.0 * 6.02059991;  // scale log2 to 0.5dB.
const GAIN_CONVERSION_OFFSET = 255.0 - 60.0;  // Translate +30dB to max.

/* eslint-enable @typescript-eslint/no-magic-numbers */


/*@devdoc
 *  The <code>AudioHelpers</code> namespace provides helpers for working with audio data.
 *  <p>C++: <code>AudioHelpers.h</code></p>
 *
 *  @namespace AudioHelpers
 */
class AudioHelpers {
    // C++  AudioHelpers.h

    /*@devdoc
     *  Packs an audio gain value into a single byte.
     *  @param {number} gain - The gain value.
     *  @returns {number} The single byte representation of the gain value.
     */
    static packFloatGainToByte(gain: number): number {

        // WEBRTC TODO: Consider implementing fastLog2() and using instead of Math methods.
        const f = Math.log2(gain) * GAIN_CONVERSION_RATIO + GAIN_CONVERSION_OFFSET;
        const i = Math.round(f);  // Quantize.

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const byte = Math.max(0, Math.min(i, 255));  // Clamp.
        return byte;
    }

}

export default AudioHelpers;
