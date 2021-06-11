//
//  PacketType.js
//
//  Created by David Rowe on 7 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The Vircadia prototol packets.
 *
 *  @namespace PacketType
 *  @property {PacketTypeValue} Unknown - <code>0</code>
 *  @property {PacketTypeValue} StunResponse - <code>1</code>
 *  @property {PacketTypeValue} DomainList - <code>2</code>
 *  @property {PacketTypeValue} Ping - <code>3</code>
 *  @property {PacketTypeValue} PingReply - <code>4</code>
 *  @property {PacketTypeValue} KillAvatar - <code>5</code>
 *  @property {PacketTypeValue} AvatarData - <code>6</code>
 *  @property {PacketTypeValue} InjectAudio - <code>7</code>
 *  @property {PacketTypeValue} MixedAudio - <code>8</code>
 *  @property {PacketTypeValue} MicrophoneAudioNoEcho - <code>9</code>
 *  @property {PacketTypeValue} MicrophoneAudioWithEcho - <code>10</code>
 *  @property {PacketTypeValue} BulkAvatarData - <code>11</code>
 *  @property {PacketTypeValue} SilentAudioFrame - <code>12</code>
 *  @property {PacketTypeValue} DomainListRequest - <code>13</code>
 *  @property {PacketTypeValue} RequestAssignment - <code>14</code>
 *  @property {PacketTypeValue} CreateAssignment - <code>15</code>
 *  @property {PacketTypeValue} DomainConnectionDenied - <code>16</code>
 *  @property {PacketTypeValue} MuteEnvironment - <code>17</code>
 *  @property {PacketTypeValue} AudioStreamStats - <code>18</code>
 *  @property {PacketTypeValue} DomainServerPathQuery - <code>19</code>
 *  @property {PacketTypeValue} DomainServerPathResponse - <code>20</code>
 *  @property {PacketTypeValue} DomainServerAddedNode - <code>21</code>
 *  @property {PacketTypeValue} ICEServerPeerInformation - <code>22</code>
 *  @property {PacketTypeValue} ICEServerQuery - <code>23</code>
 *  @property {PacketTypeValue} OctreeStats - <code>24</code>
 *  @property {PacketTypeValue} SetAvatarTraits - <code>25</code>
 *  @property {PacketTypeValue} InjectorGainSet - <code>26</code>
 *  @property {PacketTypeValue} AssignmentClientStatus - <code>27</code>
 *  @property {PacketTypeValue} NoisyMute - <code>28</code>
 *  @property {PacketTypeValue} AvatarIdentity - <code>29</code>
 *  @property {PacketTypeValue} NodeIgnoreRequest - <code>30</code>
 *  @property {PacketTypeValue} DomainConnectRequest - <code>31</code>
 *  @property {PacketTypeValue} DomainServerRequireDTLS - <code>32</code>
 *  @property {PacketTypeValue} NodeJsonStats - <code>33</code>
 *  @property {PacketTypeValue} OctreeDataNack - <code>34</code>
 *  @property {PacketTypeValue} StopNode - <code>35</code>
 *  @property {PacketTypeValue} AudioEnvironment - <code>36</code>
 *  @property {PacketTypeValue} EntityEditNack - <code>37</code>
 *  @property {PacketTypeValue} ICEServerHeartbeat - <code>38</code>
 *  @property {PacketTypeValue} ICEPing - <code>39</code>
 *  @property {PacketTypeValue} ICEPingReply - <code>40</code>
 *  @property {PacketTypeValue} EntityData - <code>41</code>
 *  @property {PacketTypeValue} EntityQuery - <code>42</code>
 *  @property {PacketTypeValue} EntityAdd - <code>43</code>
 *  @property {PacketTypeValue} EntityErase - <code>44</code>
 *  @property {PacketTypeValue} EntityEdit - <code>45</code>
 *  @property {PacketTypeValue} DomainServerConnectionToken - <code>46</code>
 *  @property {PacketTypeValue} DomainSettingsRequest - <code>47</code>
 *  @property {PacketTypeValue} DomainSettings - <code>48</code>
 *  @property {PacketTypeValue} AssetGet - <code>49</code>
 *  @property {PacketTypeValue} AssetGetReply - <code>50</code>
 *  @property {PacketTypeValue} AssetUpload - <code>51</code>
 *  @property {PacketTypeValue} AssetUploadReply - <code>52</code>
 *  @property {PacketTypeValue} AssetGetInfo - <code>53</code>
 *  @property {PacketTypeValue} AssetGetInfoReply - <code>54</code>
 *  @property {PacketTypeValue} DomainDisconnectRequest - <code>55</code>
 *  @property {PacketTypeValue} DomainServerRemovedNode - <code>56</code>
 *  @property {PacketTypeValue} MessagesData - <code>57</code>
 *  @property {PacketTypeValue} MessagesSubscribe - <code>58</code>
 *  @property {PacketTypeValue} MessagesUnsubscribe - <code>59</code>
 *  @property {PacketTypeValue} ICEServerHeartbeatDenied - <code>60</code>
 *  @property {PacketTypeValue} AssetMappingOperation - <code>61</code>
 *  @property {PacketTypeValue} AssetMappingOperationReply - <code>62</code>
 *  @property {PacketTypeValue} ICEServerHeartbeatACK - <code>63</code>
 *  @property {PacketTypeValue} NegotiateAudioFormat - <code>64</code>
 *  @property {PacketTypeValue} SelectedAudioFormat - <code>65</code>
 *  @property {PacketTypeValue} MoreEntityShapes - <code>66</code>
 *  @property {PacketTypeValue} NodeKickRequest - <code>67</code>
 *  @property {PacketTypeValue} NodeMuteRequest - <code>68</code>
 *  @property {PacketTypeValue} RadiusIgnoreRequest - <code>69</code>
 *  @property {PacketTypeValue} UsernameFromIDRequest - <code>70</code>
 *  @property {PacketTypeValue} UsernameFromIDReply - <code>71</code>
 *  @property {PacketTypeValue} AvatarQuery - <code>72</code>
 *  @property {PacketTypeValue} RequestsDomainListData - <code>73</code>
 *  @property {PacketTypeValue} PerAvatarGainSet - <code>74</code>
 *  @property {PacketTypeValue} EntityScriptGetStatus - <code>75</code>
 *  @property {PacketTypeValue} EntityScriptGetStatusReply - <code>76</code>
 *  @property {PacketTypeValue} ReloadEntityServerScript - <code>77</code>
 *  @property {PacketTypeValue} EntityPhysics - <code>78</code>
 *  @property {PacketTypeValue} EntityServerScriptLog - <code>79</code>
 *  @property {PacketTypeValue} AdjustAvatarSorting - <code>80</code>
 *  @property {PacketTypeValue} OctreeFileReplacement - <code>81</code>
 *  @property {PacketTypeValue} CollisionEventChanges - <code>82</code>
 *  @property {PacketTypeValue} ReplicatedMicrophoneAudioNoEcho - <code>83</code>
 *  @property {PacketTypeValue} ReplicatedMicrophoneAudioWithEcho - <code>84</code>
 *  @property {PacketTypeValue} ReplicatedInjectAudio - <code>85</code>
 *  @property {PacketTypeValue} ReplicatedSilentAudioFrame - <code>86</code>
 *  @property {PacketTypeValue} ReplicatedAvatarIdentity - <code>87</code>
 *  @property {PacketTypeValue} ReplicatedKillAvatar - <code>88</code>
 *  @property {PacketTypeValue} ReplicatedBulkAvatarData - <code>89</code>
 *  @property {PacketTypeValue} DomainContentReplacementFromUrl - <code>90</code>
 *  @property {PacketTypeValue} ChallengeOwnership - <code>91</code>
 *  @property {PacketTypeValue} EntityScriptCallMethod - <code>92</code>
 *  @property {PacketTypeValue} ChallengeOwnershipRequest - <code>93</code>
 *  @property {PacketTypeValue} ChallengeOwnershipReply - <code>94</code>
 *  @property {PacketTypeValue} OctreeDataFileRequest - <code>95</code>
 *  @property {PacketTypeValue} OctreeDataFileReply - <code>96</code>
 *  @property {PacketTypeValue} OctreeDataPersist - <code>97</code>
 *  @property {PacketTypeValue} EntityClone - <code>98</code>
 *  @property {PacketTypeValue} EntityQueryInitialResultsComplete - <code>99</code>
 *  @property {PacketTypeValue} BulkAvatarTraits - <code>100</code>
 *  @property {PacketTypeValue} AudioSoloRequest - <code>101</code>
 *  @property {PacketTypeValue} BulkAvatarTraitsAck - <code>102</code>
 *  @property {PacketTypeValue} StopInjector - <code>103</code>
 *  @property {PacketTypeValue} AvatarZonePresence - <code>104</code>
 */
const PacketType = new (class {
    // C++: PacketType

    /*@devdoc
     *  {@link PacketType|Packet types} are represented by an unsigned 8-bit number in the protocol packets.
     *  @typedef {number} PacketTypeValue
     */
    #_packetTypes = [
        "Unknown",                          // 0
        "StunResponse",
        "DomainList",
        "Ping",
        "PingReply",
        "KillAvatar",
        "AvatarData",
        "InjectAudio",
        "MixedAudio",
        "MicrophoneAudioNoEcho",
        "MicrophoneAudioWithEcho",          // 10
        "BulkAvatarData",
        "SilentAudioFrame",
        "DomainListRequest",
        "RequestAssignment",
        "CreateAssignment",
        "DomainConnectionDenied",
        "MuteEnvironment",
        "AudioStreamStats",
        "DomainServerPathQuery",
        "DomainServerPathResponse",         // 20
        "DomainServerAddedNode",
        "ICEServerPeerInformation",
        "ICEServerQuery",
        "OctreeStats",
        "SetAvatarTraits",
        "InjectorGainSet",
        "AssignmentClientStatus",
        "NoisyMute",
        "AvatarIdentity",
        "NodeIgnoreRequest",                // 30
        "DomainConnectRequest",
        "DomainServerRequireDTLS",
        "NodeJsonStats",
        "OctreeDataNack",
        "StopNode",
        "AudioEnvironment",
        "EntityEditNack",
        "ICEServerHeartbeat",
        "ICEPing",
        "ICEPingReply",                     // 40
        "EntityData",
        "EntityQuery",
        "EntityAdd",
        "EntityErase",
        "EntityEdit",
        "DomainServerConnectionToken",
        "DomainSettingsRequest",
        "DomainSettings",
        "AssetGet",
        "AssetGetReply",                    // 50
        "AssetUpload",
        "AssetUploadReply",
        "AssetGetInfo",
        "AssetGetInfoReply",
        "DomainDisconnectRequest",
        "DomainServerRemovedNode",
        "MessagesData",
        "MessagesSubscribe",
        "MessagesUnsubscribe",
        "ICEServerHeartbeatDenied",         // 60
        "AssetMappingOperation",
        "AssetMappingOperationReply",
        "ICEServerHeartbeatACK",
        "NegotiateAudioFormat",
        "SelectedAudioFormat",
        "MoreEntityShapes",
        "NodeKickRequest",
        "NodeMuteRequest",
        "RadiusIgnoreRequest",
        "UsernameFromIDRequest",            // 70
        "UsernameFromIDReply",
        "AvatarQuery",
        "RequestsDomainListData",
        "PerAvatarGainSet",
        "EntityScriptGetStatus",
        "EntityScriptGetStatusReply",
        "ReloadEntityServerScript",
        "EntityPhysics",
        "EntityServerScriptLog",
        "AdjustAvatarSorting",              // 80
        "OctreeFileReplacement",
        "CollisionEventChanges",
        "ReplicatedMicrophoneAudioNoEcho",
        "ReplicatedMicrophoneAudioWithEcho",
        "ReplicatedInjectAudio",
        "ReplicatedSilentAudioFrame",
        "ReplicatedAvatarIdentity",
        "ReplicatedKillAvatar",
        "ReplicatedBulkAvatarData",
        "DomainContentReplacementFromUrl",  // 90
        "ChallengeOwnership",
        "EntityScriptCallMethod",
        "ChallengeOwnershipRequest",
        "ChallengeOwnershipReply",
        "OctreeDataFileRequest",
        "OctreeDataFileReply",
        "OctreeDataPersist",
        "EntityClone",
        "EntityQueryInitialResultsComplete",
        "BulkAvatarTraits",                 // 100
        "AudioSoloRequest",
        "BulkAvatarTraitsAck",
        "StopInjector",
        "AvatarZonePresence"
    ];

    #_nonSourcedPackets = null;

    #_DomainConnectRequestVersion = {
        // C++  DomainConnectRequestVersion
        HasCompressedSystemInfo: 26
    };

    constructor() {
        for (let i = 0; i < this.#_packetTypes.length; i++) {
            this[this.#_packetTypes[i]] = i;
        }

        // Packets that don't include the local node ID of the sending node.
        this.#_nonSourcedPackets = new Set([
            this.StunResponse,
            this.CreateAssignment,
            this.RequestAssignment,
            this.DomainServerRequireDTLS,
            this.DomainConnectRequest,
            this.DomainList,
            this.DomainConnectionDenied,
            this.DomainServerPathQuery,
            this.DomainServerPathResponse,
            this.DomainServerAddedNode,
            this.DomainServerConnectionToken,
            this.DomainSettingsRequest,
            this.OctreeDataFileRequest,
            this.OctreeDataFileReply,
            this.OctreeDataPersist,
            this.DomainContentReplacementFromUrl,
            this.DomainSettings,
            this.ICEServerPeerInformation,
            this.ICEServerQuery,
            this.ICEServerHeartbeat,
            this.ICEServerHeartbeatACK,
            this.ICEPing,
            this.ICEPingReply,
            this.ICEServerHeartbeatDenied,
            this.AssignmentClientStatus,
            this.StopNode,
            this.DomainServerRemovedNode,
            this.UsernameFromIDReply,
            this.OctreeFileReplacement,
            this.ReplicatedMicrophoneAudioNoEcho,
            this.ReplicatedMicrophoneAudioWithEcho,
            this.ReplicatedInjectAudio,
            this.ReplicatedSilentAudioFrame,
            this.ReplicatedAvatarIdentity,
            this.ReplicatedKillAvatar,
            this.ReplicatedBulkAvatarData,
            this.AvatarZonePresence,
            this.WebRTCSignaling
        ]);
    }

    /*@devdoc
     *  Gets the current version number for a packet type.
     *  @function PacketType.versionForPacketType
     *  @param {PacketTypeValue} packetType The packet type to get the version number for.
     *  @returns {number} The current version number of the packet type.
     */
    versionForPacketType(packetType) {
        // C++  PacketVersion versionForPacketType(PacketType packetType)
        switch (packetType) {
            case this.DomainConnectRequest:
                return this.#_DomainConnectRequestVersion.HasCompressedSystemInfo;

            // WebRTC TODO: Add other packets.

            // C++ default for remainder of packets is 22 but we want to report packets we haven't implemented, so explicitly
            // list those packets we know about.
            default:
                console.error("ERROR - Unknown packet type in versionForPacketType()");
        }
        return 0;
    }

    /*@devdoc
     *  Gets the Set of non-sourced packets, i.e., packets which don't include the local node ID of the sending node.
     *  @function PacketType.getNonSourcedPackets
     *  @returns {Set<PacketTypeValue>} The Set of non-sourced packets.
     */
    getNonSourcedPackets() {
        // C++  PacketType::getNonSourcedPackets()
        return this.#_nonSourcedPackets;
    }

})();

export default PacketType;
