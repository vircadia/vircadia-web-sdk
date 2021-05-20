//
//  NodeType.js
//
//  Created by David Rowe on 18 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

const NodeType = (function () {
    // C++  NodeType

    // C++  NodeType_t
    const DomainServer = "D";
    const EntityServer = "o";
    const Agent = "I";
    const AudioMixer = "M";
    const AvatarMixer = "W";
    const AssetServer = "A";
    const MessagesMixer = "m";
    const EntityScriptServer = "S";
    const UpstreamAudioMixer = "B";
    const UpstreamAvatarMixer = "C";
    const DownstreamAudioMixer = "a";
    const DownstreamAvatarMixer = "w";
    const Unassigned = 1;

    return {
        DomainServer,
        EntityServer,
        Agent,
        AudioMixer,
        AvatarMixer,
        AssetServer,
        MessagesMixer,
        EntityScriptServer,
        UpstreamAudioMixer,
        UpstreamAvatarMixer,
        DownstreamAudioMixer,
        DownstreamAvatarMixer,
        Unassigned
    };

}());

export default NodeType;
