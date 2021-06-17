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
 *  The <code>NodeType</code> API provides information on networking node types. Node types are represented as single 8-bit
 *  characters in the protocol packets.
 *
 *  @namespace NodeType
 *
 *  @property {string} DomainServer - <code>"D"</code>
 *  @property {string} EntityServer - <code>"o"</code>
 *  @property {string} Agent - <code>"I"</code>
 *  @property {string} AudioMixer - <code>"M"</code>
 *  @property {string} AvatarMixer - <code>"W"</code>
 *  @property {string} AssetServer - <code>"A"</code>
 *  @property {string} MessagesMixer - <code>"m"</code>
 *  @property {string} EntityScriptServer - <code>"S"</code>
 *  @property {string} UpstreamAudioMixer - <code>"B"</code>
 *  @property {string} UpstreamAvatarMixer - <code>"C"</code>
 *  @property {string} DownstreamAudioMixer - <code>"a"</code>
 *  @property {string} DownstreamAvatarMixer - <code>"w"</code>
 *  @property {string} Unassigned - <code>String.fromCharCode(1)</code>
 */

const NodeType = new (class {
    // C++  NodeType

    // C++  NodeType_t
    DomainServer = "D";
    EntityServer = "o";
    Agent = "I";
    AudioMixer = "M";
    AvatarMixer = "W";
    AssetServer = "A";
    MessagesMixer = "m";
    EntityScriptServer = "S";
    UpstreamAudioMixer = "B";
    UpstreamAvatarMixer = "C";
    DownstreamAudioMixer = "a";
    DownstreamAvatarMixer = "w";
    Unassigned = String.fromCharCode(1);

    #_NODE_TYPE_NAMES = { };

    constructor() {
        this.#_NODE_TYPE_NAMES = {
            [this.DomainServer]: "Domain Server",
            [this.EntityServer]: "Entity Server",
            [this.Agent]: "Agent",
            [this.AudioMixer]: "Audio Mixer",
            [this.AvatarMixer]: "Avatar Mixer",
            [this.MessagesMixer]: "Messages Mixer",
            [this.AssetServer]: "Asset Server",
            [this.EntityScriptServer]: "Entity Script Server",
            [this.UpstreamAudioMixer]: "Upstream Audio Mixer",
            [this.UpstreamAvatarMixer]: "Upstream Avatar Mixer",
            [this.DownstreamAudioMixer]: "Downstream Audio Mixer",
            [this.DownstreamAvatarMixer]: "Downstream Avatar Mixer",
            [this.Unassigned]: "Unassigned"
        };
    }

    /*@devdoc
     *  Gets a user-friendly name for a node type, e.g., <code>"Domain Server"</code>.
     *  @function NodeType.getNodeTypeName
     *  @param {NodeType} nodeType - The node type.
     *  @returns {string} A user-friendly name for the node type. <code>"Unknown"</code> if the <code>nodeType</code> is invalid.
     */
    getNodeTypeName(nodeType) {
        // C++  QString & NodeType::getNodeTypeName(NodeType_t nodeType)
        let name = this.#_NODE_TYPE_NAMES[nodeType];
        if (name === undefined) {
            name = "Unknown";
        }
        return name;
    }

})();

export default NodeType;
