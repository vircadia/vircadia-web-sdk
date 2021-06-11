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
 *  IPv4 network address and port number.
 *  <p>C++: <code>HifiSockAddr</code></p>
 *  @class HifiSockAddr
 */
class HifiSockAddr {

    #_port = 0;

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
