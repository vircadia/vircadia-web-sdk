//
//  HighResolutionClock.ts
//
//  Created by David Rowe on 5 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>HighResolutionClock</code> namespace provides a timestamp service.
 *  <p>Note: In browser environments, the resolution may be limited to milliseconds.</p>
 *  <p>C++: <code>p_high_resolution_clock</code>
 *  @namespace HighResolutionClock
 */
const HighResolutionClock = new class {
    // C++  p_high_resolution_clock

    // WEBRTC TODO: Get a higher resolution clock than Date.now(), possibly using the Performance API though this may still be
    //              limited to millisecond resolution.

    // WEBRTC TODO: Regularize the use of timestamps throughout the SDK's networking code.
    //              Note: Perhaps milliseconds should be used internally.

    /*@devdoc
     *  Gets the current timestamps in microseconds.
     *  @function HighResolutionClock.now
     *  @returns {bigint} The current timestamps in microseconds.
     */
    // eslint-disable-next-line class-methods-use-this
    now(): bigint {
        // C++  QUuid now()
        const MS_TO_US = 1000n;
        return BigInt(Date.now()) * MS_TO_US;
    }

}();

export default HighResolutionClock;
