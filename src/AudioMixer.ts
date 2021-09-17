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
import AudioConstants from "./domain/audio/AudioConstants";
import AudioClient from "./domain/audio-client/AudioClient";
import NodeType from "./domain/networking/NodeType";
import assert from "./domain/shared/assert";
import ContextManager from "./domain/shared/ContextManager";


/*@sdkdoc
 *  The <code>AudioMixer</code> class provides the interface for working with audio mixer assignment clients.
 *  <p>Prerequisite: A {@link DomainServer} object must be created first in order to create the domain context.</p>
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


    #_audioContext: AudioContext | null = null;
    #_oscillatorNode: OscillatorNode | null = null;
    #_gainNode: GainNode | null = null;
    #_streamDestination: MediaStreamAudioDestinationNode | null = null;


    constructor(contextID: number) {
        super(contextID, NodeType.AudioMixer);

        // Context
        ContextManager.set(contextID, AudioClient, contextID);
    }


    get audioOuput(): MediaStream {
        if (!this.#_audioContext) {
            this.#setUpAudioContext();
        }
        assert(this.#_streamDestination !== null);
        return this.#_streamDestination.stream;
    }


    /*@sdkdoc
     *  Starts or resumes playing audio received from the audio mixer, if it isn't already playing.
     *  <p>This must be called after the user has interacted with the web page in some manner, otherwise the audio will not
     *  play. See
     *  {@link https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide|Autoplay guide for media and Web Audio APIs}.
     *  </p>
     */
    play(): void {
        if (!this.#_audioContext) {
            this.#setUpAudioContext();
        }
        assert(this.#_audioContext !== null);
        if (this.#_audioContext.state === "suspended") {
            void this.#_audioContext.resume();
        }
    }

    /*@sdkdoc
     *  Suspends playing audio received from the audio mixer. This halts hardware processing, reducing CPU/batter usage.
     */
    pause(): void {
        if (!this.#_audioContext) {
            return;
        }
        void this.#_audioContext.suspend();
    }


    // Sets up the AudioContext etc.
    #setUpAudioContext(): void {
        assert(this.#_audioContext === null);

        this.#_audioContext = new AudioContext({
            // The audio stream is at the Vircadia audio sample rate. Browsers convert this to their required hardware rate.
            sampleRate: AudioConstants.SAMPLE_RATE
        });

        // Temporarily provide a fixed tone as the output.
        this.#_oscillatorNode = this.#_audioContext.createOscillator();
        this.#_gainNode = this.#_audioContext.createGain();
        const GAIN = 0.2;
        this.#_gainNode.gain.setValueAtTime(GAIN, this.#_audioContext.currentTime);

        // AudioStream output.
        this.#_streamDestination = this.#_audioContext.createMediaStreamDestination();

        // Wire up the nodes.
        this.#_oscillatorNode.connect(this.#_gainNode);
        this.#_gainNode.connect(this.#_streamDestination);
        this.#_oscillatorNode.start();
    }

}

export default AudioMixer;
