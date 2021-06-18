//
//  HifiSockAddr.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  IPv4 network address and port number. The port number may be a UDP port number or an internally-assigned WebRTC data channel
 *  ID. Internally, the IP address is handled as a 4-byte number value and the port as a 2-byte number value.
 *  <p>C++: <code>HifiSockAddr : public QObject</code></p>
 *  @class HifiSockAddr
 */
class HifiSockAddr {

    // WEBRTC TODO: Add address type (UDP | WebRTC | unknown)?

    #_address = 0;
    #_port = 0;

    /*@devdoc
     *  Sets the IP address.
     *  @param {number} address - The IPv4 network address as a 4-byte number.
     */
    setAddress(address) {
        this.#_address = address;
    }

    /*@devdoc
     *  Gets the IP address.
     *  @returns {number} The IPv4 network address as a 4-byte number.
     */
    getAddress() {
        return this.#_address;
    }

    /*@devdoc
     *  Sets the port number.
     *  @param {number} port The port number.
     */
    setPort(port) {
        this.#_port = port;
    }

    /*@devdoc
     *  Gets the port number.
     *  @returns {number} The port number.
     */
    getPort() {
        return this.#_port;
    }

}

export default HifiSockAddr;
