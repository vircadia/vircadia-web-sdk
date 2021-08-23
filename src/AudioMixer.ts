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
import NodeType from "./domain/networking/NodeType";


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
     *          <tr><td>UNAVAILABLE</td><td>0</td><td>There is no audio mixer available - you're not connected to a domain or
     *              the domain doesn't have a audio mixer running.</td></tr>
     *          <tr><td>DISCONNECTED</td><td>1</td><td>Not connected to the audio mixer.</td></tr>
     *          <tr><td>CONNECTED</td><td>2</td><td>Connected to the audio mixer.</td></tr>
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

    constructor(contextID: number) {
        super(contextID, NodeType.AudioMixer);
    }

}

export default AudioMixer;
