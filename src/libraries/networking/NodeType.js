//
//  NodeType.js
//
//  Created by David Rowe on 18 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 * The <code>NodeType</code> API provides information on networking node types.
 *
 * @namespace NodeType
 *
 * @property {string} DomainServer - <code>"D"</code>
 * @property {string} EntityServer - <code>"o"</code>
 * @property {string} Agent - <code>"I"</code>
 * @property {string} AudioMixer - <code>"M"</code>
 * @property {string} AvatarMixer - <code>"W"</code>
 * @property {string} AssetServer - <code>"A"</code>
 * @property {string} MessagesMixer - <code>"m"</code>
 * @property {string} EntityScriptServer - <code>"S"</code>
 * @property {string} UpstreamAudioMixer - <code>"B"</code>
 * @property {string} UpstreamAvatarMixer - <code>"C"</code>
 * @property {string} DownstreamAudioMixer - <code>"a"</code>
 * @property {string} DownstreamAvatarMixer - <code>"w"</code>
 * @property {string} Unassigned - <code>String.fromCharCode(1)</code>
 */
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
    const Unassigned = String.fromCharCode(1);

    const NODE_TYPE_NAMES = {
        [DomainServer]: "Domain Server",
        [EntityServer]: "Entity Server",
        [Agent]: "Agent",
        [AudioMixer]: "Audio Mixer",
        [AvatarMixer]: "Avatar Mixer",
        [MessagesMixer]: "Messages Mixer",
        [AssetServer]: "Asset Server",
        [EntityScriptServer]: "Entity Script Server",
        [UpstreamAudioMixer]: "Upstream Audio Mixer",
        [UpstreamAvatarMixer]: "Upstream Avatar Mixer",
        [DownstreamAudioMixer]: "Downstream Audio Mixer",
        [DownstreamAvatarMixer]: "Downstream Avatar Mixer",
        [Unassigned]: "Unassigned"
    };

    /*@devdoc
     * Gets a user-friendly name for a node type, e.g., <code>"Domain Server"</code>.
     * @function NodeType.getNodeTypeName
     * @param {NodeType} nodeType - The node type.
     * @returns {string} A user-friendly name for the node type.
     */
    function getNodeTypeName(nodeType) {
        // C++  QString & NodeType::getNodeTypeName(NodeType_t nodeType)
        let name = NODE_TYPE_NAMES[nodeType];
        if (name === undefined) {
            name = "Unknown";
        }
        return name;
    }

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
        Unassigned,

        getNodeTypeName
    };

}());

export default NodeType;
