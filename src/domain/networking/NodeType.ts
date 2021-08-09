//
//  NodeType.ts
//
//  Created by David Rowe on 18 May 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  {@link NodeType(1)|Node types},  <code>DomainServer</code> &ndash; <code>Unassigned</code>, are the types of network nodes
 *  operating in a domain. They are represented as single 8-bit characters in the protocol packets.
 *  @typedef {string} NodeType
 */
const enum NodeTypeValue {
    // C++  NodeType_t
    DomainServer = "D",
    EntityServer = "o",
    Agent = "I",
    AudioMixer = "M",
    AvatarMixer = "W",
    AssetServer = "A",
    MessagesMixer = "m",
    EntityScriptServer = "S",
    UpstreamAudioMixer = "B",
    UpstreamAvatarMixer = "C",
    DownstreamAudioMixer = "a",
    DownstreamAvatarMixer = "w",
    Unassigned = "\x01"
}


/*@devdoc
 *  The <code>NodeType</code> namespace provides information on a network node's type. Node type values are represented as
 *  single 8-bit characters in the protocol packets.
 *  <p>C++: <code>NodeType</code></p>
 *
 *  @namespace NodeType
 *  @variation 1
 *
 *  @property {NodeType} DomainServer - <code>"D"</code> - Domain server.
 *  @property {NodeType} EntityServer - <code>"o"</code> - Entity server.
 *  @property {NodeType} Agent - <code>"I"</code> - A web client or an assignment client emulating an avatar.
 *  @property {NodeType} AudioMixer - <code>"M"</code> - Audio mixer.
 *  @property {NodeType} AvatarMixer - <code>"W"</code> - Avatar mixer.
 *  @property {NodeType} AssetServer - <code>"A"</code> - Asset server.
 *  @property {NodeType} MessagesMixer - <code>"m"</code> - Messages mixer.
 *  @property {NodeType} EntityScriptServer - <code>"S"</code> - Entity script server.
 *  @property {NodeType} UpstreamAudioMixer - <code>"B"</code> - Upstream audio mixer.
 *  @property {NodeType} UpstreamAvatarMixer - <code>"C"</code> - Upstream avatar mixer.
 *  @property {NodeType} DownstreamAudioMixer - <code>"a"</code> - Downstream audio mixer.
 *  @property {NodeType} DownstreamAvatarMixer - <code>"w"</code> - Downstream avatar mixer.
 *  @property {NodeType} Unassigned - <code>String.fromCharCode(1)</code> - Unassigned.
 */
const NodeType = new class {
    // C++  NodeType

    DomainServer = NodeTypeValue.DomainServer;
    EntityServer = NodeTypeValue.EntityServer;
    Agent = NodeTypeValue.Agent;
    AudioMixer = NodeTypeValue.AudioMixer;
    AvatarMixer = NodeTypeValue.AvatarMixer;
    AssetServer = NodeTypeValue.AssetServer;
    MessagesMixer = NodeTypeValue.MessagesMixer;
    EntityScriptServer = NodeTypeValue.EntityScriptServer;
    UpstreamAudioMixer = NodeTypeValue.UpstreamAudioMixer;
    UpstreamAvatarMixer = NodeTypeValue.UpstreamAvatarMixer;
    DownstreamAudioMixer = NodeTypeValue.DownstreamAudioMixer;
    DownstreamAvatarMixer = NodeTypeValue.DownstreamAvatarMixer;
    Unassigned = NodeTypeValue.Unassigned;


    private _NODE_TYPE_NAMES = {
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


    /*@devdoc
     *  Gets the name of a NodeType value, e.g., <code>"Domain Server"</code>.
     *  @function NodeType(1).getNodeTypeName
     *  @param {NodeType} nodeType - The node type value.
     *  @returns {string} The name of the node type. <code>"Unknown"</code> if the <code>nodeType</code> is invalid.
     */
    getNodeTypeName(nodeType: NodeTypeValue): string {
        // C++  QString& getNodeTypeName(NodeType_t nodeType)
        let name = this._NODE_TYPE_NAMES[nodeType];
        if (name === undefined) {
            name = "Unknown";
        }
        return name;
    }

}();

export { NodeType as default, NodeTypeValue };
