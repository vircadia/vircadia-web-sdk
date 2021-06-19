//
//  PacketData.js
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainConnectRequest from "./DomainConnectRequest.js";
import DomainList from "./DomainList.js";


/*@devdoc
 *  Packet reading and writing functions.
 *  <p>C++: <em>There is no C++ equivalent of this namespace.</em></p>
 *  @namespace PacketData
 *  @property {function} DomainConnectRequest.write -
 *      {@link PacketData.DomainConnectRequest&period;write|DomainConnectRequest&period;write}
 *  @property {function} DomainList.read -
 *      {@link PacketData.DomainList&period;read|DomainList&period;read}
 */

// WEBRTC TODO: Implement similar in C++ to collect all packet reading/writing into the networking library code (and revise this
// namespace's description accordingly).

// WEBRTC TODO: Add further packets to the Packets namespace as they are implemented.

const PacketData = {
    DomainConnectRequest,
    DomainList
};

export default PacketData;
