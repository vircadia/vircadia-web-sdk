//
//  AudioMixer.ts
//
//  Vircadia Web SDK's Audio Mixer API.
//
//  Created by David Rowe on 24 Aug 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AssignmentClient from "./domain/AssignmentClient";
import Node from "./domain/networking/Node";
import NodeList from "./domain/networking/NodeList";
import NodeType from "./domain/networking/NodeType";
import PacketScribe from "./domain/networking/packets/PacketScribe";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  The <code>AudioMixer</code> class provides the interface for working with audio mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created first in order to create the domain context.</p>
 *  @class AudioMixer
 *  @extends AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {AudioMixer.State} UNAVAILABLE - There is no audio mixer available - you're not connected to a domain or the
 *      domain doesn't have a audio mixer running.
 *      <em>Static. Read-only.</em>
 *  @property {AudioMixer.State} DISCONNECTED - Not connected to the audio mixer.
 *      <em>Static. Read-only.</em>
 *  @property {AudioMixer.State} CONNECTED - Connected to the audio mixer.
 *      <em>Static. Read-only.</em>
 *  @property {AudioMixer.State} state - The current state of the connection to the audio mixer.
 *      <em>Read-only.</em>
 *  @property {AudioMixer~onStateChanged|null} onStateChanged - Sets a single function to be called when the state of the
 *      audio mixer changes. Set to <code>null</code> to remove the callback.
 *      <em>Write-only.</em>
 */
class AudioMixer extends AssignmentClient {
    // C++  Application.cpp

    // Base class developer documentation is copied here and updated for the SDK documentation.

    /*@sdkdoc
     *  <table>
     *      <thead>
     *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
     *      </thead>
     *      <tbody>
     *          <tr><td>UNAVAILABLE</td><td><code><code>0</code></td><td>There is no audio mixer available - you're not
     *              connected to a domain or the domain doesn't have a audio mixer running.</td></tr>
     *          <tr><td>DISCONNECTED</td><td><code>1</code></td><td>Not connected to the audio mixer.</td></tr>
     *          <tr><td>CONNECTED</td><td><code>2</code></td><td>Connected to the audio mixer.</td></tr>
     *      </tbody>
     *  </table>
     *  @typedef {number} AudioMixer.State
     */

    /*@sdkdoc
     *  Called when the state of the audio mixer changes.
     *  @callback AudioMixer~onStateChanged
     *  @param {AudioMixer.State} state - The state of the audio mixer.
     */

    /*@sdkdoc
     *  Gets the string representing a audio mixer state.
     *  <p><em>Static</em></p>
     *  @function AudioMixer.stateToString
     *  @param {AudioMixer.State} state - The state to get the string representation of.
     *  @returns {string} The string representing the audio mixer state if a valid state, <code>""</code> if not a valid
     *      state.
     */


    // Context.
    #_nodeList: NodeList;  // Need own reference rather than using AssignmentClient's because need to keep private from API.


    constructor(contextID: number) {
        super(contextID, NodeType.AudioMixer);

        this.#_nodeList = ContextManager.get(contextID, NodeList) as NodeList;  // Throws error if invalid context.


        // C++  AudioClient::AudioClient()

        // WEBRTC TODO: Address further C++ code.


        // C++  Application::Application()
        this.#_nodeList.nodeActivated.connect(this.#nodeActivated);
        this.#_nodeList.nodeKilled.connect(this.#nodeKilled);
    }


    #negotiateAudioFormat(): void {
        // C++  void AudioClient::negotiateAudioFormat()

        // WEBRTC TODO: Get list of codecs that Web supports.
        const codecs = [
            "opus",
            "pcm",
            "zlib"
        ];

        const negotiateFormatPacket = PacketScribe.NegotiateAudioFormat.write({
            codecs
        });

        const audioMixer = this.#_nodeList.soloNodeOfType(NodeType.AudioMixer);
        if (audioMixer) {
            this.#_nodeList.sendPacket(negotiateFormatPacket, audioMixer);
        }
    }

    #audioMixerKilled(): void {
        // C++  void AudioClient::audioMixerKilled()

        // WEBRTC TODO: Address further C++ code.

    }


    // Slot
    #nodeActivated = (node: Node): void => {
        const nodeType = node.getType();
        if (nodeType !== NodeType.AudioMixer) {
            return;
        }

        // C++  void Application::nodeActivated(Node* node)
        this.#negotiateAudioFormat();
    };

    // Slot
    #nodeKilled = (node: Node): void => {
        const nodeType = node.getType();
        if (nodeType !== NodeType.AudioMixer) {
            return;
        }

        // C++  void Application::nodeKilled(Node* node)
        this.#audioMixerKilled();
    };

}

export default AudioMixer;
