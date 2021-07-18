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
 *  The types of network nodes operating in a domain. Node types are represented as single 8-bit characters in the protocol
 *  packets.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>DomainServer</td><td><code>"D"</code></td><td>Domain server.</td></tr>
 *          <tr><td>EntityServer</td><td><code>"o"</code></td><td>Entity server.</td></tr>
 *          <tr><td>Agent</td><td><code>"I"</code></td><td>Agent: An Interface client or an assignment client emulating an
 *              avatar.</td></tr>
 *          <tr><td>AudioMixer</td><td><code>"M"</code></td><td>Audio mixer.</td></tr>
 *          <tr><td>AvatarMixer</td><td><code>"W"</code></td><td>Avatar mixer.</td></tr>
 *          <tr><td>AssetServer</td><td><code>"A"</code></td><td>Asset server.</td></tr>
 *          <tr><td>MessagesMixer</td><td><code>"m"</code></td><td>Message mixer.</td></tr>
 *          <tr><td>EntityScriptServer</td><td><code>"S"</code></td><td>Entity script server.</td></tr>
 *          <tr><td>UpstreamAudioMixer</td><td><code>"B"</code></td><td>Upstream audio mixer.</td></tr>
 *          <tr><td>UpstreamAvatarMixer</td><td><code>"C"</code></td><td>Upstream avatar mixer.</td></tr>
 *          <tr><td>DownstreamAudioMixer</td><td><code>"a"</code></td><td>Downstream audio mixer.</td></tr>
 *          <tr><td>DownstreamAvatarMixer</td><td><code>"w"</code></td><td>Downstream avatar mixer.</td></tr>
 *          <tr><td>Unassigned</td><td><code>String.fromCharCode(1)</code></td><td>Unassigned.</td></tr>
 *      </tbody>
 *  </table>
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
 *  Information on the network node types operating in a domain. Node types are represented as single 8-bit characters in the
 *  protocol packets.
 *  <p>C++: <code>NodeType</code></p>
 *
 *  @namespace NodeType
 *  @variation 1
 *
 *  @property {NodeType} DomainServer - <code>"D"</code> - Domain server.
 *  @property {NodeType} EntityServer - <code>"o"</code> - Entity server.
 *  @property {NodeType} Agent - <code>"I"</code> - An Interface client or an assignment client emulating an avatar.
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
        [NodeTypeValue.DomainServer]: "Domain Server",
        [NodeTypeValue.EntityServer]: "Entity Server",
        [NodeTypeValue.Agent]: "Agent",
        [NodeTypeValue.AudioMixer]: "Audio Mixer",
        [NodeTypeValue.AvatarMixer]: "Avatar Mixer",
        [NodeTypeValue.MessagesMixer]: "Messages Mixer",
        [NodeTypeValue.AssetServer]: "Asset Server",
        [NodeTypeValue.EntityScriptServer]: "Entity Script Server",
        [NodeTypeValue.UpstreamAudioMixer]: "Upstream Audio Mixer",
        [NodeTypeValue.UpstreamAvatarMixer]: "Upstream Avatar Mixer",
        [NodeTypeValue.DownstreamAudioMixer]: "Downstream Audio Mixer",
        [NodeTypeValue.DownstreamAvatarMixer]: "Downstream Avatar Mixer",
        [NodeTypeValue.Unassigned]: "Unassigned"
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
