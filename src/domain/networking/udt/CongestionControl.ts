//
//  CongestionControl.ts
//
//  Created by David Rowe on 4 Oct 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 * The <code>CongestionControl</code> class helps control network congestion.
 * <p>C++: <code>CongestionControl</code></pc>
 * @class CongestionControl
 */
class CongestionControl {
    // C++  CongestionControl
    //      In the C++, this is a base class which TCPVegaCC derives.
    //      In the SDK, there is no congestion control at present.

    /* eslint-disable @typescript-eslint/no-magic-numbers */

    #_packetSendPeriod = 1n;  // Packet sending period, in microseconds.
    #_congestionWindowSize = 16;  // Congestion window size, in packets.

    #_estimatedTimeout = 0n;  // Estimated timeout, in microseconds.

    // WEBRTC TODO: Address further C++ code.

    /* eslint-enable @typescript-eslint/no-magic-numbers */


    /*@devdoc
     *  Initializes congestion control.
     */
    init(): void {  // eslint-disable-line class-methods-use-this
        // C++  void init()
        // No-op;
    }

    /*@devdoc
     *  Gets the packet send period.
     *  @returns {bigint} The packet send period, in microseconds.
     */
    packetSendPeriod(): bigint {
        // C++  double _packetSendPeriod
        return this.#_packetSendPeriod;
    }

    /*@devdoc
     *  Gets the congestion window size, i.e., the number of packets that should be permitted to be in-flight without ACKs.
     *  @returns {number} The congestion window size, in packets.
     */
    congestionWindowSize(): number {
        // C++  int _congestionWindowSize
        return this.#_congestionWindowSize;
    }

    /*@devdoc
     *  Gets the estimated timeout.
     *  @returns {number} The estimated timeout, in microseconds.
     */
    estimatedTimeout(): bigint {
        // C++  int estimatedTimeout()
        return this.#_estimatedTimeout;
    }

}

export default CongestionControl;
