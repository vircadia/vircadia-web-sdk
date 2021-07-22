//
//  PacketScribe.ts
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import DomainConnectRequest from "./DomainConnectRequest";
import DomainList from "./DomainList";


/*@devdoc
 *  The <code>PacketScribe</code> namespace provides packet reading and writing functions.
 *  <p>C++: N/A</p>
 *  @namespace PacketScribe
 *  @property {function} DomainConnectRequest.write -
 *      {@link PacketScribe.DomainConnectRequest&period;write|DomainConnectRequest&period;write}
 *  @property {function} DomainList.read -
 *      {@link PacketScribe.DomainList&period;read|DomainList&period;read}
 */

// WEBRTC TODO: Implement similar in C++ to collect all packet reading/writing into the networking library code (and revise this
// namespace's description accordingly).

// WEBRTC TODO: Add further packets to the Packets namespace as they are implemented.

const PacketScribe = {
    DomainConnectRequest,
    DomainList
};

export default PacketScribe;
