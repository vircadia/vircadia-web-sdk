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
import Ping from "./Ping";
import PingReply from "./PingReply";
import KillAvatar from "./KillAvatar";
import AvatarData from "./AvatarData";
import MixedAudio from "./MixedAudio";
import MicrophoneAudioNoEcho from "./MicrophoneAudioNoEcho";
import BulkAvatarData from "./BulkAvatarData";
import SilentAudioFrame from "./SilentAudioFrame";
import DomainListRequest from "./DomainListRequest";
import DomainConnectionDenied from "./DomainConnectionDenied";
import AvatarIdentity from "./AvatarIdentity";
import DomainConnectRequest from "./DomainConnectRequest";
import DomainDisconnectRequest from "./DomainDisconnectRequest";
import DomainServerRemovedNode from "./DomainServerRemovedNode";
import MessagesData from "./MessagesData";
import MessagesSubscribe from "../packets/MessagesSubscribe";
import MessagesUnsubscribe from "../packets/MessagesUnsubscribe";
import NegotiateAudioFormat from "./NegotiateAudioFormat";
import SelectedAudioFormat from "./SelectedAudioFormat";
import BulkAvatarTraits from "./BulkAvatarTraits";
import BulkAvatarTraitsAck from "./BulkAvatarTraitsAck";


/*@devdoc
 *  The <code>PacketScribe</code> namespace provides packet reading and writing functions.
 *  <p>C++: N/A</p>
 *  @namespace PacketScribe
 *  @property {function} DomainList.read -
 *      {@link PacketScribe.DomainList&period;read|DomainList&period;read}
 *  @property {function} Ping.read -
 *      {@link PacketScribe.Ping&period;read|Ping&period;read}
 *  @property {function} PingReply.write -
 *      {@link PacketScribe.PingReply&period;write|PingReply&period;write}
 *  @property {function} KillAvatar.read -
 *      {@link PacketScribe.KillAvatar&period;read|KillAvatar&period;read}
 *  @property {function} AvatarData.write -
 *      {@link PacketScribe.AvatarData&period;write|AvatarData&period;write}
 *  @property {function} MixedAudio.read -
 *      {@link PacketScribe.MixedAudio&period;read|MixedAudio&period;read}
 *  @property {function} MicrophoneAudioNoEcho.write -
 *      {@link PacketScribe.MicrophoneAudioNoEcho&period;write|MixedAudio&period;write}
 *  @property {function} BulkAvatarData.read -
 *      {@link PacketScribe.BulkAvatarData&period;read|BulkAvatarData&period;read}
 *  @property {function} SilentAudioFrame.read -
 *      {@link PacketScribe.SilentAudioFrame&period;read|SilentAudioFrame&period;read}
 *  @property {function} SilentAudioFrame.write -
 *      {@link PacketScribe.SilentAudioFrame&period;write|SilentAudioFrame&period;write}
 *  @property {function} DomainListRequest.write -
 *      {@link PacketScribe.DomainListRequest&period;write|DomainListRequest&period;write}
 *  @property {function} DomainConnectionDenied.read -
 *      {@link PacketScribe.DomainConnectionDenied&period;read|DomainConnectionDenied&period;read}
 *  @property {function} AvatarIdentity.read -
 *      {@link PacketScribe.AvatarIdentity&period;read|AvatarIdentity&period;read}
 *  @property {function} AvatarIdentity.write -
 *      {@link PacketScribe.AvatarIdentity&period;write|AvatarIdentity&period;write}
 *  @property {function} DomainConnectRequest.write -
 *      {@link PacketScribe.DomainConnectRequest&period;write|DomainConnectRequest&period;write}
 *  @property {function} DomainDisconnectRequest.write -
 *      {@link PacketScribe.DomainDisconnectRequest&period;write|DomainDisconnectRequest&period;write}
 *  @property {function} DomainServerRemovedNode.read -
 *      {@link PacketScribe.DomainServerRemovedNode&period;read|DomainServerRemovedNode&period;read}
 *  @property {function} MessagesData.read -
 *      {@link PacketScribe.MessagesData&period;read|MessagesData&period;read}
 *  @property {function} MessagesData.write -
 *      {@link PacketScribe.MessagesData&period;write|MessagesData&period;write}
 *  @property {function} MessagesSubscribe.write -
 *      {@link PacketScribe.MessagesSubscribe&period;write|MessagesSubscribe&period;write}
 *  @property {function} MessagesUnsubscribe.write -
 *      {@link PacketScribe.MessagesUnsubscribe&period;write|MessagesUnsubscribe&period;write}
 *  @property {function} NegotiateAudioFormat.write -
 *      {@link PacketScribe.NegotiateAudioFormat&period;write|NegotiateAudioFormat&period;write}
 *  @property {function} SelectedAudioFormat.read -
 *      {@link PacketScribe.SelectedAudioFormat&period;read|SelectedAudioFormat&period;read}
 *  @property {function} BulkAvatarTraits.read -
 *      {@link PacketScribe.BulkAvatarTraits&period;read|BulkAvatarTraits&period;read}
 *  @property {function} BulkAvatarTraitsAck.write  -
 *      {@link PacketScribe.BulkAvatarTraitsAck&period;write|BulkAvatarTraitsAck&period;write}
 */

// WEBRTC TODO: Implement similar in C++ to collect all packet reading/writing into the networking library code (and revise this
// namespace's description accordingly).

// WEBRTC TODO: Add further packets to the Packets namespace as they are implemented.

const PacketScribe = {
    // In packet number order.
    DomainList,
    Ping,
    PingReply,
    KillAvatar,
    AvatarData,
    MixedAudio,
    MicrophoneAudioNoEcho,
    BulkAvatarData,
    SilentAudioFrame,
    DomainListRequest,
    DomainConnectionDenied,
    AvatarIdentity,
    DomainConnectRequest,
    DomainDisconnectRequest,
    DomainServerRemovedNode,
    MessagesData,
    MessagesSubscribe,
    MessagesUnsubscribe,
    NegotiateAudioFormat,
    SelectedAudioFormat,
    BulkAvatarTraits,
    BulkAvatarTraitsAck
};

export default PacketScribe;
