//
//  PacketScribe.ts
//
//  Created by David Rowe on 13 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// In packet number order.
import DomainList from "./DomainList";
import DomainConnectionDenied from "./DomainConnectionDenied";
import DomainListRequest from "./DomainListRequest";
import DomainConnectRequest from "./DomainConnectRequest";
import DomainDisconnectRequest from "./DomainDisconnectRequest";
import DomainServerRemovedNode from "./DomainServerRemovedNode";
import NegotiateAudioFormat from "./NegotiateAudioFormat";


/*@devdoc
 *  The <code>PacketScribe</code> namespace provides packet reading and writing functions.
 *  <p>C++: N/A</p>
 *  @namespace PacketScribe
 *  @property {function} DomainList.read -
 *      {@link PacketScribe.DomainList&period;read|DomainList&period;read}
 *  @property {function} DomainListRequest.write -
 *      {@link PacketScribe.DomainListRequest&period;write|DomainListRequest&period;write}
 *  @property {function} DomainConnectionDenied.read -
 *      {@link PacketScribe.DomainConnectionDenied&period;read|DomainConnectionDenied&period;read}
 *  @property {function} DomainConnectRequest.write -
 *      {@link PacketScribe.DomainConnectRequest&period;write|DomainConnectRequest&period;write}
 *  @property {function} DomainDisconnectRequest.write -
 *      {@link PacketScribe.DomainDisconnectRequest&period;write|DomainDisconnectRequest&period;write}
 *  @property {function} DomainServerRemovedNode.read -
 *      {@link PacketScribe.DomainServerRemovedNode&period;read|DomainServerRemovedNode&period;read}
 *  @property {function} NegotiateAudioFormat.write -
 *      {@link PacketScribe.NegotiateAudioFormat&period;write|NegotiateAudioFormat&period;write}
 */

// WEBRTC TODO: Implement similar in C++ to collect all packet reading/writing into the networking library code (and revise this
// namespace's description accordingly).

// WEBRTC TODO: Add further packets to the Packets namespace as they are implemented.

const PacketScribe = {
    // In packet number order.
    DomainList,
    DomainListRequest,
    DomainConnectionDenied,
    DomainConnectRequest,
    DomainDisconnectRequest,
    DomainServerRemovedNode,
    NegotiateAudioFormat
};

export default PacketScribe;
