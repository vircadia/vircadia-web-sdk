//
//  PacketHeaders.ts
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "../../shared/assert";


/*@devdoc
 *  {@link PacketType(1)|Packet types}, <code>Unknown</code>, <code>DomainConnectRequestPending</code>, <code>...</code>, are
 *  represented as unsigned 8-bit numbers in the protocol packets.
 *  @typedef {number} PacketType
 */
// Could just define `type PacketTypeValue = number` however using an object improves type safety.
const enum PacketTypeValue {
    Unknown,                            // 0
    DomainConnectRequestPending,
    DomainList,
    Ping,
    PingReply,
    KillAvatar,
    AvatarData,
    InjectAudio,
    MixedAudio,
    MicrophoneAudioNoEcho,
    MicrophoneAudioWithEcho,            // 10
    BulkAvatarData,
    SilentAudioFrame,
    DomainListRequest,
    RequestAssignment,
    CreateAssignment,
    DomainConnectionDenied,
    MuteEnvironment,
    AudioStreamStats,
    DomainServerPathQuery,
    DomainServerPathResponse,           // 20
    DomainServerAddedNode,
    ICEServerPeerInformation,
    ICEServerQuery,
    OctreeStats,
    SetAvatarTraits,
    InjectorGainSet,
    AssignmentClientStatus,
    NoisyMute,
    AvatarIdentity,
    NodeIgnoreRequest,                  // 30
    DomainConnectRequest,
    DomainServerRequireDTLS,
    NodeJsonStats,
    OctreeDataNack,
    StopNode,
    AudioEnvironment,
    EntityEditNack,
    ICEServerHeartbeat,
    ICEPing,
    ICEPingReply,                       // 40
    EntityData,
    EntityQuery,
    EntityAdd,
    EntityErase,
    EntityEdit,
    DomainServerConnectionToken,
    DomainSettingsRequest,
    DomainSettings,
    AssetGet,
    AssetGetReply,                      // 50
    AssetUpload,
    AssetUploadReply,
    AssetGetInfo,
    AssetGetInfoReply,
    DomainDisconnectRequest,
    DomainServerRemovedNode,
    MessagesData,
    MessagesSubscribe,
    MessagesUnsubscribe,
    ICEServerHeartbeatDenied,           // 60
    AssetMappingOperation,
    AssetMappingOperationReply,
    ICEServerHeartbeatACK,
    NegotiateAudioFormat,
    SelectedAudioFormat,
    MoreEntityShapes,
    NodeKickRequest,
    NodeMuteRequest,
    RadiusIgnoreRequest,
    UsernameFromIDRequest,              // 70
    UsernameFromIDReply,
    AvatarQuery,
    RequestsDomainListData,
    PerAvatarGainSet,
    EntityScriptGetStatus,
    EntityScriptGetStatusReply,
    ReloadEntityServerScript,
    EntityPhysics,
    EntityServerScriptLog,
    AdjustAvatarSorting,                // 80
    OctreeFileReplacement,
    CollisionEventChanges,
    ReplicatedMicrophoneAudioNoEcho,
    ReplicatedMicrophoneAudioWithEcho,
    ReplicatedInjectAudio,
    ReplicatedSilentAudioFrame,
    ReplicatedAvatarIdentity,
    ReplicatedKillAvatar,
    ReplicatedBulkAvatarData,
    DomainContentReplacementFromUrl,    // 90
    ChallengeOwnership,
    EntityScriptCallMethod,
    ChallengeOwnershipRequest,
    ChallengeOwnershipReply,
    OctreeDataFileRequest,
    OctreeDataFileReply,
    OctreeDataPersist,
    EntityClone,
    EntityQueryInitialResultsComplete,
    BulkAvatarTraits,                   // 100
    AudioSoloRequest,
    BulkAvatarTraitsAck,
    StopInjector,
    AvatarZonePresence,
    WebRTCSignaling,

    NUM_PACKETS
}


/*@devdoc
 *  The <code>PacketType</code> namespace lists the Vircadia protocol packets.
 *  <p>C++: <code>PacketHeaders.h</code>
 *  <p><em>Reliable</em>: These packets are sent reliably: their successful receipt is verified and the packets are resent if
 *      necessary.</p>
 *
 *  @namespace PacketType
 *  @variation 1
 *  @property {PacketType} Unknown - <code>0</code>
 *  @property {PacketType} DomainConnectRequestPending - <code>1</code> - The user client may send this to the Domain Server
 *      as a synonym for sending a <code>DomainConnectRequest</code> packet. This is provided as packet <code>1</code> for a
 *      future version of the protocol so that protocol breaks can be better handled.<br />
 *      The Domain Server responds with a DomainList or DomainConnectionDenied packet.<br />
 *      {@link PacketScribe.DomainConnectRequestDetails}
 *  @property {PacketType} DomainList - <code>2</code> - The Domain Server sends this to the user client in response to a
 *      DomainConnectRequest or DomainListRequest packet, if the client is authorized to connect to the domain.<br />
 *      {@link PacketScribe.DomainListDetails}
 *  @property {PacketType} Ping - <code>3</code> - Assignment clients periodically send this to the user client to check that it
 *      is still connected.<br />
 *      {@link PacketScribe.PingDetails}
 *  @property {PacketType} PingReply - <code>4</code> - Sent in response to a Ping packet.<br />
 *      {@link PacketScribe.PingReplyDetails}
 *  @property {PacketType} KillAvatar - <code>5</code> - The avatar mixer sends this to the user client when another user client
 *      disconnects from the domain.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.KillAvatarDetails}
 *  @property {PacketType} AvatarData - <code>6</code> - The user client sends this to the avatar mixer with details of the user
 *      client's avatar.<br />
 *      {@link PacketScribe.AvatarDataDetails}
 *  @property {PacketType} InjectAudio - <code>7</code>
 *  @property {PacketType} MixedAudio - <code>8</code> - The audio mixer repeatedly sends this to the user client when there is
 *      audio to play at the user client's audio position.<br />
 *      {@link PacketScribe.MixedAudioDetails}
 *  @property {PacketType} MicrophoneAudioNoEcho - <code>9</code> - The user client sends this to the audio mixer with user
 *      audio to play at the user client's audio position. The audio mixer should not echo the audio back to the user
 *      client.<br />
 *      {@link PacketScribe.MicrophoneAudioNoEchoDetails}
 *  @property {PacketType} MicrophoneAudioWithEcho - <code>10</code> - The user client sends this to the audio mixer with user
 *      audio to play at the user client's audio position. The audio mixer should echo the audio back to the user client.
 *  @property {PacketType} BulkAvatarData - <code>11</code> - The avatar mixer sends this to the user client to keep it up to
 *      date with the details of avatars in the domain, including the user client's avatar.<br />
 *      {@link PacketScribe.BulkAvatarDataDetails}
 *  @property {PacketType} SilentAudioFrame - <code>12</code> - The user client repeatedly sends this to the audio mixer when
 *      there isn't any audio (microphone) input from the user. The user client's audio position is included. The audio mixer
 *      repeatedly sends this to the user client when there isn't any audio to play at the user client's audio position.<br />
 *      {@link PacketScribe.SilentAudioFrameDetails}.
 *  @property {PacketType} DomainListRequest - <code>13</code> - The user client periodically sends this to the Domain Server
 *      to maintain connection to the domain. The Domain Server responds with a DomainList or DomainConnectionDenied
 *      packet.<br />
 *      {@link PacketScribe.DomainListRequestDetails}
 *  @property {PacketType} RequestAssignment - <code>14</code>
 *  @property {PacketType} CreateAssignment - <code>15</code>
 *  @property {PacketType} DomainConnectionDenied - <code>16</code> - The Domain Server sends this to the user client in
 *      response to a DomainConnectRequest or DomainListRequest packet, if the client is not authorized to connect to the
 *      domain.<br />
 *      {@link PacketScribe.DomainConnectionDeniedDetails}
 *  @property {PacketType} MuteEnvironment - <code>17</code>
 *  @property {PacketType} AudioStreamStats - <code>18</code>
 *  @property {PacketType} DomainServerPathQuery - <code>19</code> - The user client sends this to the Domain Server to get the
 *      position and orientation set for a path in the domain.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.DomainServerPathQueryDetails}
 *  @property {PacketType} DomainServerPathResponse - <code>20</code> - The Domain Server sends this to the user client in
 *      response to a DomainServerPathQuery packet, to provide the position and orientation set for a path in the domain.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.DomainServerPathResponseDetails}
 *  @property {PacketType} DomainServerAddedNode - <code>21</code> - The Domain Server sends this to user clients when an
 *      assignment client starts up and the user client has registered interest in that assignment client node type, and to
 *      assignment clients when another assignment client starts up or a user connects to the domain.<br />
 *      {@link PacketScribe.DomainServerAddedNodeDetails}
 *  @property {PacketType} ICEServerPeerInformation - <code>22</code>
 *  @property {PacketType} ICEServerQuery - <code>23</code>
 *  @property {PacketType} OctreeStats - <code>24</code>
 *  @property {PacketType} SetAvatarTraits - <code>25</code> - The user client sends this to the Avatar Mixer to update it with
 *      avatar traits: skeleton model URL, skeleton data, avatar entities, or avatar grab data.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.SetAvatarTraitsDetails}
 *  @property {PacketType} InjectorGainSet - <code>26</code>
 *  @property {PacketType} AssignmentClientStatus - <code>27</code>
 *  @property {PacketType} NoisyMute - <code>28</code> - The Avatar Mixer sends this to the user client, instructing the client
 *      to mute its audio input. This may be due to the client's background audio being too loud or an admin muting the user in
 *      the domain.<br />
 *      This packet contains no content.
 *  @property {PacketType} AvatarIdentity - <code>29</code> - The user client sends this to the Avatar Mixer to update it with
 *      current user avatar identity information. The Avatar Mixer sends this to the user client to update it with identify
 *      information for avatars in the domain.<br />
 *      <em>Reliable. Ordered.</em><br />
 *      {@link PacketScribe.AvatarIdentityDetails}
 *  @property {PacketType} NodeIgnoreRequest - <code>30</code> - The user client sends this to the Audio Mixer or Avatar Mixer
 *      to mute a user or users.<br />
 *      <em>Reliable. Ordered.</em><br />
 *      {@link PacketScribe.NodeIgnoreRequestDetails}
 *  @property {PacketType} DomainConnectRequest - <code>31</code> - The user client sends this to the Domain Server to initiate
 *      connection to the domain. The Domain Server responds with a DomainList or DomainConnectionDenied packet.<br />
 *      {@link PacketScribe.DomainConnectRequestDetails}
 *  @property {PacketType} DomainServerRequireDTLS - <code>32</code>
 *  @property {PacketType} NodeJsonStats - <code>33</code>
 *  @property {PacketType} OctreeDataNack - <code>34</code>
 *  @property {PacketType} StopNode - <code>35</code>
 *  @property {PacketType} AudioEnvironment - <code>36</code>
 *  @property {PacketType} EntityEditNack - <code>37</code>
 *  @property {PacketType} ICEServerHeartbeat - <code>38</code>
 *  @property {PacketType} ICEPing - <code>39</code>
 *  @property {PacketType} ICEPingReply - <code>40</code>
 *  @property {PacketType} EntityData - <code>41</code> - The Domain Server sends this to the user client in response to an
 *      EntityQuery packet.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.EntityDataDetails}
 *  @property {PacketType} EntityQuery - <code>42</code> - The user client sends this to the Entity Server to request details of
 *      the entities in view. The Domain Server responds with EntityData packets.<br />
 *      {@link PacketScribe.EntityQueryDetails}
 *  @property {PacketType} EntityAdd - <code>43</code>
 *  @property {PacketType} EntityErase - <code>44</code>
 *  @property {PacketType} EntityEdit - <code>45</code>
 *  @property {PacketType} DomainServerConnectionToken - <code>46</code> - The Domain Server sends this to the client when the
 *      client tries to log into the domain.<br />
 *      {@link PacketScribe.DomainServerConnectionTokenDetails}
 *  @property {PacketType} DomainSettingsRequest - <code>47</code>
 *  @property {PacketType} DomainSettings - <code>48</code>
 *  @property {PacketType} AssetGet - <code>49</code>
 *  @property {PacketType} AssetGetReply - <code>50</code>
 *  @property {PacketType} AssetUpload - <code>51</code>
 *  @property {PacketType} AssetUploadReply - <code>52</code>
 *  @property {PacketType} AssetGetInfo - <code>53</code>
 *  @property {PacketType} AssetGetInfoReply - <code>54</code>
 *  @property {PacketType} DomainDisconnectRequest - <code>55</code> - The user client sends this empty packet to the Domain
 *      Server to signal that the user client is disconnecting. The Domain Server does not respond.
 *  @property {PacketType} DomainServerRemovedNode - <code>56</code> - The domain server broadcasts this to user clients when an
 *      assignment client has been removed. It is sent only to clients that have registered interest in the node type
 *      removed.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.DomainServerRemovedNodeDetails}
 *  @property {PacketType} MessagesData - <code>57</code> - The user client sends and receives this packet to and from the
 *      message mixer.<br />
 *      <em>Reliable. Ordered.</em><br />
 *      {@link PacketScribe.MessagesDataDetails}
 *  @property {PacketType} MessagesSubscribe - <code>58</code> - The user client sends this to the message mixer to subscribe to
 *      a message channel.<br />
 *      <em>Reliable. Ordered.</em><br />
 *      {@link PacketScribe.MessagesSubscribeDetails}.
 *  @property {PacketType} MessagesUnsubscribe - <code>59</code> - The user client sends this to the message mixer to
 *      unsubscribe from a message channel.<br />
 *      <em>Reliable. Ordered.</em><br />
 *      {@link PacketScribe.MessagesUnsubscribeDetails}
 *  @property {PacketType} ICEServerHeartbeatDenied - <code>60</code>
 *  @property {PacketType} AssetMappingOperation - <code>61</code>
 *  @property {PacketType} AssetMappingOperationReply - <code>62</code>
 *  @property {PacketType} ICEServerHeartbeatACK - <code>63</code>
 *  @property {PacketType} NegotiateAudioFormat - <code>64</code> - The user client sends this to the audio mixer to initiate
 *      negotiation of the audio codec to use.<br />
 *      {@link PacketScribe.NegotiateAudioFormatDetails}
 *  @property {PacketType} SelectedAudioFormat - <code>65</code> - The audio mixer sends this to the user client in response to
 *      the client sending a NegotiateAudioFormat packet. It specifies the audio codec that the audio mixer has selected to
 *      use.<br />
 *      {@link PacketScribe.SelectedAudioFormatDetails}
 *  @property {PacketType} MoreEntityShapes - <code>66</code>
 *  @property {PacketType} NodeKickRequest - <code>67</code> - The user client sends this to the domain server to kick (ban)
 *      another user from the domain.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.NodeKickRequestDetails}
 *  @property {PacketType} NodeMuteRequest - <code>68</code> - The user client sends this to the audio mixer to mute another
 *      user for everyone.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.NodeMuteRequestDetails}
 *  @property {PacketType} RadiusIgnoreRequest - <code>69</code>
 *  @property {PacketType} UsernameFromIDRequest - <code>70</code>
 *  @property {PacketType} UsernameFromIDReply - <code>71</code>
 *  @property {PacketType} AvatarQuery - <code>72</code> - The user client sends this to the avatar mixer to seek details of
 *      avatars in the client's view or views.<br />
 *      {@link PacketScribe.AvatarQueryDetails}
 *  @property {PacketType} RequestsDomainListData - <code>73</code> - The user clients sends this to the audio mixer and avatar
 *      mixer to tell them whether or not to continue sending data from ignored avatars or avatars that have ignored the
 *      client.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.RequestsDomainListDataDetails}
 *  @property {PacketType} PerAvatarGainSet - <code>74</code> - The user clients sends this to the audio mixer to set an
 *      avatar's gain (volume) or the master avatar gain, for the audio that's sent to the client.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.PerAvatarGainSetDetails}
 *  @property {PacketType} EntityScriptGetStatus - <code>75</code>
 *  @property {PacketType} EntityScriptGetStatusReply - <code>76</code>
 *  @property {PacketType} ReloadEntityServerScript - <code>77</code>
 *  @property {PacketType} EntityPhysics - <code>78</code>
 *  @property {PacketType} EntityServerScriptLog - <code>79</code>
 *  @property {PacketType} AdjustAvatarSorting - <code>80</code>
 *  @property {PacketType} OctreeFileReplacement - <code>81</code>
 *  @property {PacketType} CollisionEventChanges - <code>82</code>
 *  @property {PacketType} ReplicatedMicrophoneAudioNoEcho - <code>83</code>
 *  @property {PacketType} ReplicatedMicrophoneAudioWithEcho - <code>84</code>
 *  @property {PacketType} ReplicatedInjectAudio - <code>85</code>
 *  @property {PacketType} ReplicatedSilentAudioFrame - <code>86</code>
 *  @property {PacketType} ReplicatedAvatarIdentity - <code>87</code>
 *  @property {PacketType} ReplicatedKillAvatar - <code>88</code>
 *  @property {PacketType} ReplicatedBulkAvatarData - <code>89</code>
 *  @property {PacketType} DomainContentReplacementFromUrl - <code>90</code>
 *  @property {PacketType} ChallengeOwnership - <code>91</code>
 *  @property {PacketType} EntityScriptCallMethod - <code>92</code>
 *  @property {PacketType} ChallengeOwnershipRequest - <code>93</code>
 *  @property {PacketType} ChallengeOwnershipReply - <code>94</code>
 *  @property {PacketType} OctreeDataFileRequest - <code>95</code>
 *  @property {PacketType} OctreeDataFileReply - <code>96</code>
 *  @property {PacketType} OctreeDataPersist - <code>97</code>
 *  @property {PacketType} EntityClone - <code>98</code>
 *  @property {PacketType} EntityQueryInitialResultsComplete - <code>99</code>
 *  @property {PacketType} BulkAvatarTraits - <code>100</code> - The avatar mixer sends this to the user client to keep it up to
 *      date with the traits of other avatars in the domain.<br />
 *      <em>Reliable. Ordered.</em><br />
 *      {@link PacketScribe.BulkAvatarTraitsDetails}
 *  @property {PacketType} AudioSoloRequest - <code>101</code>
 *  @property {PacketType} BulkAvatarTraitsAck - <code>102</code> - The user client sends this to the avatar mixer to
 *      acknowledge the receipt of a BulkAvatarTraits message.<br />
 *      <em>Reliable.</em><br />
 *      {@link PacketScribe.BulkAvatarTraitsAckDetails}
 *  @property {PacketType} StopInjector - <code>103</code>
 *  @property {PacketType} AvatarZonePresence - <code>104</code>
 *  @property {PacketType} WebRTCSignaling - <code>104</code> - Used between the domain server and assignment clients to
 *      exchange user client WebRTC signaling messages relayed to assignment clients via the domain server.<br />
 *      <em>Reliable. Ordered.</em>
 */
const PacketType = new class {
    // C++: PacketType

    // Property values are manually added because doing so provides additional type safety compared to adding at runtime.
    readonly Unknown = PacketTypeValue.Unknown;
    readonly DomainConnectRequestPending = PacketTypeValue.DomainConnectRequestPending;
    readonly DomainList = PacketTypeValue.DomainList;
    readonly Ping = PacketTypeValue.Ping;
    readonly PingReply = PacketTypeValue.PingReply;
    readonly KillAvatar = PacketTypeValue.KillAvatar;
    readonly AvatarData = PacketTypeValue.AvatarData;
    readonly InjectAudio = PacketTypeValue.InjectAudio;
    readonly MixedAudio = PacketTypeValue.MixedAudio;
    readonly MicrophoneAudioNoEcho = PacketTypeValue.MicrophoneAudioNoEcho;
    readonly MicrophoneAudioWithEcho = PacketTypeValue.MicrophoneAudioWithEcho;
    readonly BulkAvatarData = PacketTypeValue.BulkAvatarData;
    readonly SilentAudioFrame = PacketTypeValue.SilentAudioFrame;
    readonly DomainListRequest = PacketTypeValue.DomainListRequest;
    readonly RequestAssignment = PacketTypeValue.RequestAssignment;
    readonly CreateAssignment = PacketTypeValue.CreateAssignment;
    readonly DomainConnectionDenied = PacketTypeValue.DomainConnectionDenied;
    readonly MuteEnvironment = PacketTypeValue.MuteEnvironment;
    readonly AudioStreamStats = PacketTypeValue.AudioStreamStats;
    readonly DomainServerPathQuery = PacketTypeValue.DomainServerPathQuery;
    readonly DomainServerPathResponse = PacketTypeValue.DomainServerPathResponse;
    readonly DomainServerAddedNode = PacketTypeValue.DomainServerAddedNode;
    readonly ICEServerPeerInformation = PacketTypeValue.ICEServerPeerInformation;
    readonly ICEServerQuery = PacketTypeValue.ICEServerQuery;
    readonly OctreeStats = PacketTypeValue.OctreeStats;
    readonly SetAvatarTraits = PacketTypeValue.SetAvatarTraits;
    readonly InjectorGainSet = PacketTypeValue.InjectorGainSet;
    readonly AssignmentClientStatus = PacketTypeValue.AssignmentClientStatus;
    readonly NoisyMute = PacketTypeValue.NoisyMute;
    readonly AvatarIdentity = PacketTypeValue.AvatarIdentity;
    readonly NodeIgnoreRequest = PacketTypeValue.NodeIgnoreRequest;
    readonly DomainConnectRequest = PacketTypeValue.DomainConnectRequest;
    readonly DomainServerRequireDTLS = PacketTypeValue.DomainServerRequireDTLS;
    readonly NodeJsonStats = PacketTypeValue.NodeJsonStats;
    readonly OctreeDataNack = PacketTypeValue.OctreeDataNack;
    readonly StopNode = PacketTypeValue.StopNode;
    readonly AudioEnvironment = PacketTypeValue.AudioEnvironment;
    readonly EntityEditNack = PacketTypeValue.EntityEditNack;
    readonly ICEServerHeartbeat = PacketTypeValue.ICEServerHeartbeat;
    readonly ICEPing = PacketTypeValue.ICEPing;
    readonly ICEPingReply = PacketTypeValue.ICEPingReply;
    readonly EntityData = PacketTypeValue.EntityData;
    readonly EntityQuery = PacketTypeValue.EntityQuery;
    readonly EntityAdd = PacketTypeValue.EntityAdd;
    readonly EntityErase = PacketTypeValue.EntityErase;
    readonly EntityEdit = PacketTypeValue.EntityEdit;
    readonly DomainServerConnectionToken = PacketTypeValue.DomainServerConnectionToken;
    readonly DomainSettingsRequest = PacketTypeValue.DomainSettingsRequest;
    readonly DomainSettings = PacketTypeValue.DomainSettings;
    readonly AssetGet = PacketTypeValue.AssetGet;
    readonly AssetGetReply = PacketTypeValue.AssetGetReply;
    readonly AssetUpload = PacketTypeValue.AssetUpload;
    readonly AssetUploadReply = PacketTypeValue.AssetUploadReply;
    readonly AssetGetInfo = PacketTypeValue.AssetGetInfo;
    readonly AssetGetInfoReply = PacketTypeValue.AssetGetInfoReply;
    readonly DomainDisconnectRequest = PacketTypeValue.DomainDisconnectRequest;
    readonly DomainServerRemovedNode = PacketTypeValue.DomainServerRemovedNode;
    readonly MessagesData = PacketTypeValue.MessagesData;
    readonly MessagesSubscribe = PacketTypeValue.MessagesSubscribe;
    readonly MessagesUnsubscribe = PacketTypeValue.MessagesUnsubscribe;
    readonly ICEServerHeartbeatDenied = PacketTypeValue.ICEServerHeartbeatDenied;
    readonly AssetMappingOperation = PacketTypeValue.AssetMappingOperation;
    readonly AssetMappingOperationReply = PacketTypeValue.AssetMappingOperationReply;
    readonly ICEServerHeartbeatACK = PacketTypeValue.ICEServerHeartbeatACK;
    readonly NegotiateAudioFormat = PacketTypeValue.NegotiateAudioFormat;
    readonly SelectedAudioFormat = PacketTypeValue.SelectedAudioFormat;
    readonly MoreEntityShapes = PacketTypeValue.MoreEntityShapes;
    readonly NodeKickRequest = PacketTypeValue.NodeKickRequest;
    readonly NodeMuteRequest = PacketTypeValue.NodeMuteRequest;
    readonly RadiusIgnoreRequest = PacketTypeValue.RadiusIgnoreRequest;
    readonly UsernameFromIDRequest = PacketTypeValue.UsernameFromIDRequest;
    readonly UsernameFromIDReply = PacketTypeValue.UsernameFromIDReply;
    readonly AvatarQuery = PacketTypeValue.AvatarQuery;
    readonly RequestsDomainListData = PacketTypeValue.RequestsDomainListData;
    readonly PerAvatarGainSet = PacketTypeValue.PerAvatarGainSet;
    readonly EntityScriptGetStatus = PacketTypeValue.EntityScriptGetStatus;
    readonly EntityScriptGetStatusReply = PacketTypeValue.EntityScriptGetStatusReply;
    readonly ReloadEntityServerScript = PacketTypeValue.ReloadEntityServerScript;
    readonly EntityPhysics = PacketTypeValue.EntityPhysics;
    readonly EntityServerScriptLog = PacketTypeValue.EntityServerScriptLog;
    readonly AdjustAvatarSorting = PacketTypeValue.AdjustAvatarSorting;
    readonly OctreeFileReplacement = PacketTypeValue.OctreeFileReplacement;
    readonly CollisionEventChanges = PacketTypeValue.CollisionEventChanges;
    readonly ReplicatedMicrophoneAudioNoEcho = PacketTypeValue.ReplicatedMicrophoneAudioNoEcho;
    readonly ReplicatedMicrophoneAudioWithEcho = PacketTypeValue.ReplicatedMicrophoneAudioWithEcho;
    readonly ReplicatedInjectAudio = PacketTypeValue.ReplicatedInjectAudio;
    readonly ReplicatedSilentAudioFrame = PacketTypeValue.ReplicatedSilentAudioFrame;
    readonly ReplicatedAvatarIdentity = PacketTypeValue.ReplicatedAvatarIdentity;
    readonly ReplicatedKillAvatar = PacketTypeValue.ReplicatedKillAvatar;
    readonly ReplicatedBulkAvatarData = PacketTypeValue.ReplicatedBulkAvatarData;
    readonly DomainContentReplacementFromUrl = PacketTypeValue.DomainContentReplacementFromUrl;
    readonly ChallengeOwnership = PacketTypeValue.ChallengeOwnership;
    readonly EntityScriptCallMethod = PacketTypeValue.EntityScriptCallMethod;
    readonly ChallengeOwnershipRequest = PacketTypeValue.ChallengeOwnershipRequest;
    readonly ChallengeOwnershipReply = PacketTypeValue.ChallengeOwnershipReply;
    readonly OctreeDataFileRequest = PacketTypeValue.OctreeDataFileRequest;
    readonly OctreeDataFileReply = PacketTypeValue.OctreeDataFileReply;
    readonly OctreeDataPersist = PacketTypeValue.OctreeDataPersist;
    readonly EntityClone = PacketTypeValue.EntityClone;
    readonly EntityQueryInitialResultsComplete = PacketTypeValue.EntityQueryInitialResultsComplete;
    readonly BulkAvatarTraits = PacketTypeValue.BulkAvatarTraits;
    readonly AudioSoloRequest = PacketTypeValue.AudioSoloRequest;
    readonly BulkAvatarTraitsAck = PacketTypeValue.BulkAvatarTraitsAck;
    readonly StopInjector = PacketTypeValue.StopInjector;
    readonly AvatarZonePresence = PacketTypeValue.AvatarZonePresence;
    readonly WebRTCSignaling = PacketTypeValue.WebRTCSignaling;

    // Packets that are sent without verifying that they are received.
    readonly #_nonVerifiedPackets = new Set([
        PacketTypeValue.NodeJsonStats,
        PacketTypeValue.EntityQuery,
        PacketTypeValue.OctreeDataNack,
        PacketTypeValue.EntityEditNack,
        PacketTypeValue.DomainListRequest,
        PacketTypeValue.StopNode,
        PacketTypeValue.DomainDisconnectRequest,
        PacketTypeValue.UsernameFromIDRequest,
        PacketTypeValue.NodeKickRequest,
        PacketTypeValue.NodeMuteRequest
    ]);

    // Packets that don't include the local node ID of the sending node.
    readonly #_nonSourcedPackets = new Set([
        PacketTypeValue.DomainConnectRequestPending,
        PacketTypeValue.CreateAssignment,
        PacketTypeValue.RequestAssignment,
        PacketTypeValue.DomainServerRequireDTLS,
        PacketTypeValue.DomainConnectRequest,
        PacketTypeValue.DomainList,
        PacketTypeValue.DomainConnectionDenied,
        PacketTypeValue.DomainServerPathQuery,
        PacketTypeValue.DomainServerPathResponse,
        PacketTypeValue.DomainServerAddedNode,
        PacketTypeValue.DomainServerConnectionToken,
        PacketTypeValue.DomainSettingsRequest,
        PacketTypeValue.OctreeDataFileRequest,
        PacketTypeValue.OctreeDataFileReply,
        PacketTypeValue.OctreeDataPersist,
        PacketTypeValue.DomainContentReplacementFromUrl,
        PacketTypeValue.DomainSettings,
        PacketTypeValue.ICEServerPeerInformation,
        PacketTypeValue.ICEServerQuery,
        PacketTypeValue.ICEServerHeartbeat,
        PacketTypeValue.ICEServerHeartbeatACK,
        PacketTypeValue.ICEPing,
        PacketTypeValue.ICEPingReply,
        PacketTypeValue.ICEServerHeartbeatDenied,
        PacketTypeValue.AssignmentClientStatus,
        PacketTypeValue.StopNode,
        PacketTypeValue.DomainServerRemovedNode,
        PacketTypeValue.UsernameFromIDReply,
        PacketTypeValue.OctreeFileReplacement,
        PacketTypeValue.ReplicatedMicrophoneAudioNoEcho,
        PacketTypeValue.ReplicatedMicrophoneAudioWithEcho,
        PacketTypeValue.ReplicatedInjectAudio,
        PacketTypeValue.ReplicatedSilentAudioFrame,
        PacketTypeValue.ReplicatedAvatarIdentity,
        PacketTypeValue.ReplicatedKillAvatar,
        PacketTypeValue.ReplicatedBulkAvatarData,
        PacketTypeValue.AvatarZonePresence,
        PacketTypeValue.WebRTCSignaling
    ]);

    readonly #_domainSourcedPackets = new Set([
        PacketTypeValue.AssetMappingOperation,
        PacketTypeValue.AssetGet,
        PacketTypeValue.AssetUpload
    ]);

    // Mapping between packets and their replicated versions.
    readonly #_replicatedPacketMapping = new Map([
        [PacketTypeValue.MicrophoneAudioNoEcho, PacketTypeValue.ReplicatedMicrophoneAudioNoEcho],
        [PacketTypeValue.MicrophoneAudioWithEcho, PacketTypeValue.ReplicatedMicrophoneAudioWithEcho],
        [PacketTypeValue.InjectAudio, PacketTypeValue.ReplicatedInjectAudio],
        [PacketTypeValue.SilentAudioFrame, PacketTypeValue.ReplicatedSilentAudioFrame],
        [PacketTypeValue.AvatarIdentity, PacketTypeValue.ReplicatedAvatarIdentity],
        [PacketTypeValue.KillAvatar, PacketTypeValue.ReplicatedKillAvatar],
        [PacketTypeValue.BulkAvatarData, PacketTypeValue.ReplicatedBulkAvatarData]
    ]);


    readonly #_DomainListVersion = {
        // C++  DomainListVersion
        HasConnectReason: 24,
        SocketTypes: 25
    };

    readonly #_PingVersion = {
        IncludeConnectionID: 18
    };

    readonly #_DomainListRequestVersion = {
        // C++  DomainListRequestVersion
        PreSocketTypes: 22,
        SocketTypes: 23
    };

    readonly #_DomainConnectionDeniedVersion = {
        // C++ DomainConnectionDeniedVersion
        IncludesExtraInfo: 19
    };

    readonly #_DomainServerAddedNodeVersion = {
        // C++  DomainServerAddedNodeVersion
        SocketTypes: 19
    };

    readonly #_DomainConnectRequestVersion = {
        // C++  DomainConnectRequestVersion
        HasCompressedSystemInfo: 26,
        SocketTypes: 27
    };

    readonly #_EntityVersion = {
        // C++ EntityVersion
        ParticleSpin: 92,
        LAST_PACKET_TYPE: 133
    };

    readonly #_EntityQueryPacketVersion = {
        // C++ EntityQueryPacketVersion
        ConicalFrustums: 23
    };

    readonly #_AudioVersion = {
        // C++  AudioVersion
        StopInjectors: 24
    };

    readonly #_MessageDataVersion = {
        // C++  MessageDataVersion
        TextOrBinaryData: 18
    };

    readonly #_AvatarQueryVersion = {
        ConicalFrustums: 22
    };

    readonly #_AvatarMixerPacketVersion = {
        // C++  AvatarMixerPacketVersion
        AvatarTraitsAck: 48,
        ARKitBlendshapes: 54
    };


    constructor() {
        assert(PacketTypeValue.NUM_PACKETS - 1 === this.WebRTCSignaling, "Inconsistent packet data in PacketHeaders!");
    }


    /*@devdoc
     *  Gets the current version number of a packet type.
     *  @function PacketType(1).versionForPacketType
     *  @param {PacketType} packetType The packet type to get the version number of.
     *  @returns {PacketVersion} The current version number of the packet type.
     */
    /*@devdoc
     *  {@link PacketType(1)|Packet} versions are represented by unsigned 8-bit numbers in the protocol packets.
     *  @typedef {number} PacketVersion
     */
    versionForPacketType(packetType: PacketTypeValue): number {
        // C++  PacketVersion versionForPacketType(PacketType packetType)
        const DEFAULT_VERSION = 22;
        switch (packetType) {
            case this.DomainConnectRequestPending:
                return DEFAULT_VERSION;
            case this.DomainList:
                return this.#_DomainListVersion.SocketTypes;
            case this.Ping:
                return this.#_PingVersion.IncludeConnectionID;
            case this.PingReply:
                return DEFAULT_VERSION;
            case this.KillAvatar:
                return this.#_AvatarMixerPacketVersion.ARKitBlendshapes;
            case this.AvatarData:
                return this.#_AvatarMixerPacketVersion.ARKitBlendshapes;
            case this.MixedAudio:
                return this.#_AudioVersion.StopInjectors;
            case this.MicrophoneAudioNoEcho:
                return this.#_AudioVersion.StopInjectors;
            case this.BulkAvatarData:
                return this.#_AvatarMixerPacketVersion.ARKitBlendshapes;
            case this.SilentAudioFrame:
                return this.#_AudioVersion.StopInjectors;
            case this.DomainListRequest:
                return this.#_DomainListRequestVersion.SocketTypes;
            case this.DomainConnectionDenied:
                return this.#_DomainConnectionDeniedVersion.IncludesExtraInfo;
            case this.AudioStreamStats:
                return this.#_AudioVersion.StopInjectors;
            case this.DomainServerPathQuery:
                return DEFAULT_VERSION;
            case this.DomainServerPathResponse:
                return DEFAULT_VERSION;
            case this.DomainServerAddedNode:
                return this.#_DomainServerAddedNodeVersion.SocketTypes;
            case this.OctreeStats:
                return DEFAULT_VERSION;
            case this.SetAvatarTraits:
                return DEFAULT_VERSION;
            case this.NoisyMute:
                return DEFAULT_VERSION;
            case this.AvatarIdentity:
                return this.#_AvatarMixerPacketVersion.ARKitBlendshapes;
            case this.NodeIgnoreRequest:
                return 18;  // eslint-disable-line @typescript-eslint/no-magic-numbers
            case this.DomainConnectRequest:
                return this.#_DomainConnectRequestVersion.SocketTypes;
            case this.AudioEnvironment:
                return DEFAULT_VERSION;
            case this.EntityEdit:
            case this.EntityAdd:
            case this.EntityData:
                return this.#_EntityVersion.LAST_PACKET_TYPE;
            case this.EntityQuery:
                return this.#_EntityQueryPacketVersion.ConicalFrustums;
            case this.EntityErase:
                return DEFAULT_VERSION;
            case this.DomainServerConnectionToken:
                return DEFAULT_VERSION;
            case this.DomainDisconnectRequest:
                return DEFAULT_VERSION;
            case this.DomainServerRemovedNode:
                return DEFAULT_VERSION;
            case this.MessagesData:
                return this.#_MessageDataVersion.TextOrBinaryData;
            case this.MessagesSubscribe:
                return DEFAULT_VERSION;
            case this.MessagesUnsubscribe:
                return DEFAULT_VERSION;
            case this.NegotiateAudioFormat:
                return DEFAULT_VERSION;
            case this.SelectedAudioFormat:
                return DEFAULT_VERSION;
            case this.NodeKickRequest:
                return DEFAULT_VERSION;
            case this.NodeMuteRequest:
                return DEFAULT_VERSION;
            case this.AvatarQuery:
                return this.#_AvatarQueryVersion.ConicalFrustums;
            case this.RequestsDomainListData:
                return DEFAULT_VERSION;
            case this.PerAvatarGainSet:
                return DEFAULT_VERSION;
            case this.EntityQueryInitialResultsComplete:
                return this.#_EntityVersion.ParticleSpin;
            case this.BulkAvatarTraits:
                return this.#_AvatarMixerPacketVersion.AvatarTraitsAck;
            case this.BulkAvatarTraitsAck:
                return this.#_AvatarMixerPacketVersion.AvatarTraitsAck;

                // WebRTC TODO: Add other packets.

            // C++ default for remainder of packets is 22 but we want to report packets we haven't implemented, so explicitly
            // list those packets we know about.
            default:
                console.error("ERROR - Unknown packet type in versionForPacketType() :", packetType);
        }
        return 0;
    }

    /*@devdoc
     *  Gets the set of non-verified packets, i.e., packets which are sent without verifying that they are received.
     *  @function PacketType(1).getNonVerifiedPackets
     *  @returns {Set<PacketType>} The set of non-verified packets.
     */
    getNonVerifiedPackets() {
        // C++  getNonSourcedPackets()
        return this.#_nonVerifiedPackets;
    }

    /*@devdoc
     *  Gets the set of non-sourced packets, i.e., packets which don't include the local node ID of the sending node.
     *  @function PacketType(1).getNonSourcedPackets
     *  @returns {Set<PacketType>} The set of non-sourced packets.
     */
    getNonSourcedPackets() {
        // C++  getNonSourcedPackets()
        return this.#_nonSourcedPackets;
    }

    /*@devdoc
     *  Gets the set of domain-sourced packets.
     *  @function PacketType(1).getDomainSourcedPackets
     *  @returns {Set<PacketType>} The set of domain-sourced packets.
     */
    getDomainSourcedPackets() {
        // C++  getDomainSourcedPackets()
        return this.#_domainSourcedPackets;
    }

    /*@devdoc
     * Gets the mapping between packets and their replicated versions.
     * @function PacketType(1).getReplicatedPacketMapping
     * @returns {Map<PacketType,PacketType>} The mapping between packets and their replicated versions.
     */
    getReplicatedPacketMapping() {
        // C++  QHash<PacketTypeEnum::Value, PacketTypeEnum::Value> getReplicatedPacketMapping()
        return this.#_replicatedPacketMapping;
    }

}();


/*@devdoc
 *  Gets the unique identifier for the Vircadia protocol version, combining all packet versions into a hash.
 *  @function protocolVersionsSignature
 *  @returns {Uint8Array} The 16-byte protocol version hash.
 */
function protocolVersionsSignature(): Uint8Array {
    // C++  QByteArray protocolVersionsSignature()

    // WEBRTC TODO: Retrieve value from a compile-time configuration file.

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const PROTOCOL_SIGNATURE_BYTES
        = [0xad, 0x15, 0xda, 0x90, 0xe0, 0x7d, 0x2c, 0x7b, 0x40, 0x83, 0x25, 0x38, 0x3a, 0xd8, 0xb7, 0x7d];
    /* eslint-enable @typescript-eslint/no-magic-numbers */
    return Uint8Array.from(PROTOCOL_SIGNATURE_BYTES);
}


export { PacketType as default, PacketTypeValue, protocolVersionsSignature };
