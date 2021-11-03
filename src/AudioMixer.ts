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
import AudioOutput from "./domain/audio/AudioOutput";
import AudioClient from "./domain/audio-client/AudioClient";
import NodeType from "./domain/networking/NodeType";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  The <code>AudioMixer</code> class provides the interface for working with audio mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created in order to set up the domain context.</p>
 *  <p>Environment: A web app using the <code>AudioMixer</code> must be served via HTTPS or from <code<localhost</code> in order
 *  for the audio to work.</p>
 *
 *  @class AudioMixer
 *  @extends AssignmentClient
 *  @param {number} contextID - The domain context to use. See {@link DomainServer|DomainServer.contextID}.
 *
 *  @property {AudioMixer.State} UNAVAILABLE - There is no audio mixer available - you're not connected to a domain or the
 *      domain doesn't have an audio mixer running.
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
 *
 *  @property {MediaStream} audioOuput - The audio output stream to be played in the user client.
 *      <em>Read-only.</em>
 *      <p>This should be accessed after the user has interacted with the web page in some manner, otherwise a warning will be
 *      generated in the console log because Web Audio requires user input on the page in order for audio to play. See:
 *      {@link https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide|Autoplay guide for media and Web Audio APIs}.
 *  @property {MediaStream|null} audioInput - The audio input stream from the user client to be sent to the audio mixer and
 *      played in-world. If <code>null</code> then no audio is played.
 *      <em>Write-only.</em>
 *  @property {boolean} inputMuted=false - <code>true</code> to mute the <code>audioInput</code> so that it is not sent to the
 *      audio mixer, <code>false</code> to let it be sent.
 *      <p>When muted, processing of audio input is suspended. This halts hardware processing, reducing CPU/battery usage.</p>
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


    #_audioClient;
    #_audioOutput;


    constructor(contextID: number) {
        super(contextID, NodeType.AudioMixer);

        // Context
        ContextManager.set(contextID, AudioOutput);
        ContextManager.set(contextID, AudioClient, contextID);
        this.#_audioClient = ContextManager.get(contextID, AudioClient) as AudioClient;
        this.#_audioOutput = ContextManager.get(contextID, AudioOutput) as AudioOutput;
    }


    get audioOuput(): MediaStream {
        return this.#_audioOutput.audioOutput;
    }

    set audioInput(audioInput: MediaStream | null) {
        if (audioInput !== null && !(audioInput instanceof MediaStream)) {
            console.error("Tried to set an invalid AudioMixer.audioInput value!");
            return;
        }

        void this.#_audioClient.switchInputDevice(audioInput).then((success) => {
            if (!success) {
                console.warn("Could not set the audio input.");
            }
        });
    }

    get inputMuted(): boolean {
        return this.#_audioClient.isMuted();
    }

    set inputMuted(inputMuted: boolean) {
        if (typeof inputMuted !== "boolean") {
            console.error("Tried to set an invalid AudioMixer.inputMuted value!");
            return;
        }
        this.#_audioClient.setMuted(inputMuted);
    }


    /*@sdkdoc
     *  Starts or resumes playing audio received from the audio mixer, if it isn't already playing.
     *  <p>This must be called after the user has interacted with the web page in some manner, otherwise the audio will not
     *  play. See
     *  {@link https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide|Autoplay guide for media and Web Audio APIs}.
     *  </p>
     *  <p><em>Async</em></p>
     *  @async
     *  @returns {Promise<void>}
     */
    async play(): Promise<void> {
        return this.#_audioOutput.play();
    }

    /*@sdkdoc
     *  Suspends playing audio received from the audio mixer. This halts hardware processing, reducing CPU/battery usage.
     *  <p><em>Async</em></p>
     *  @async
     *  @returns {Promise<void>}
     */
    async pause(): Promise<void> {
        return this.#_audioOutput.pause();
    }

}

export default AudioMixer;
