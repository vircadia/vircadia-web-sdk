//
//  AudioConstants.ts
//
//  Created by David Rowe on 11 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>AudioConstants</code> namespace provides the values of audio constants used in the SDK.
 *  <p>C++: <code>AudioConstants</code></p>
 *
 *  @namespace AudioConstants
 *
 *  @property {number} SAMPLE_RATE - <code>24000</code> - The audio sample rate, in Hz.
 *
 *  @property {number} STEREO - <code>2</code> - The number of audio channels for stereo.
 *
 *  @property {number} NETWORK_FRAME_SAMPLES_STEREO - <code>480</code> - The number of samples in a network packet for a stereo
 *      channel.
 *  @property {number} NETWORK_FRAME_SAMPLES_PER_CHANNEL - <code>240</code> - The number of samples in a network packet per
 *      channel.
 *
 *  @property {number} NETWORK_FRAME_SECS - <code>0.01</code> - The interval between audio network packets, in seconds.
 *  @property {number} NETWORK_FRAME_MSECS - <code>10</code> - The interval between audio network packets, in milliseconds.
 */
const AudioConstants = new class {
    // C++  AudioConstants

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    readonly SAMPLE_RATE = 24000;

    readonly STEREO = 2;

    readonly NETWORK_FRAME_SAMPLES_STEREO = 480;
    readonly NETWORK_FRAME_SAMPLES_PER_CHANNEL = 240;

    readonly NETWORK_FRAME_SECS = this.NETWORK_FRAME_SAMPLES_PER_CHANNEL / this.SAMPLE_RATE;
    readonly NETWORK_FRAME_MSECS = this.NETWORK_FRAME_SECS * 1000;

}();

export { AudioConstants as default };
