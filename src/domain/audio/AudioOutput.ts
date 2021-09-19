//
//  AudioOutput.ts
//
//  Created by David Rowe on 19 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import assert from "../shared/assert";
import AudioConstants from "../audio/AudioConstants";

// eslint-disable-next-line
// @ts-ignore
import audioOutputProcessorUrl from "worklet-loader!../worklets/AudioOutputProcessor";


/*@devdoc
 *  The <code>AudioOutput</code> class provides an output Web Audio MediaStream generated from raw audio data received from the
 *  audio mixer.
 *  <p>C++: <code>N/A</code></p>
 *
 *  @class AudioOutput
 *
 *  @property {MediaStream} audioOuput - The audio output stream to be played in the user client.
 *      <em>Read-only.</em>
 *      <p>This should be accessed after the user has interacted with the web page in some manner, otherwise a warning will be
 *      generated in the console log because Web Audio requires user input on the page in order for audio to play. See:
 *      {@link https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide|Autoplay guide for media and Web Audio APIs}.
 */
class AudioOutput {
    //  C++ N/A - This is a Web SDK-specific class.

    #_audioContext: AudioContext | null = null;
    #_oscillatorNode: OscillatorNode | null = null;
    #_gainNode: GainNode | null = null;
    #_audioWorkletNode: AudioWorkletNode | null = null;
    #_streamDestination: MediaStreamAudioDestinationNode | null = null;


    get audioOutput(): MediaStream {
        if (!this.#_audioContext) {
            void this.#setUpAudioContext();
        }
        assert(this.#_streamDestination !== null);
        return this.#_streamDestination.stream;
    }

    /*@devdoc
     *  Starts or resumes playing audio received from the audio mixer, if it isn't already playing.
     *  <p>This must be called after the user has interacted with the web page in some manner, otherwise the audio will not
     *  play. See
     *  {@link https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide|Autoplay guide for media and Web Audio APIs}.
     *  </p>
     *  <p><em>Async</em></p>
     *  @function AudioOutput.play
     *  @async
     *  @returns {Promise<void>}
     */
    async play(): Promise<void> {
        // C++  N/A
        if (!this.#_audioContext) {
            await this.#setUpAudioContext();
        }
        assert(this.#_audioContext !== null);
        if (this.#_audioContext.state === "suspended") {
            await this.#_audioContext.resume();
        }
    }

    /*@devdoc
     *  Suspends playing audio received from the audio mixer. This halts hardware processing, reducing CPU/batter usage.
     *  <p><em>Async</em></p>
     *  @function AudioOutput.pause
     *  @async
     *  @returns {Promise<void>}
     */
    async pause(): Promise<void> {
        // C++  N/A
        if (!this.#_audioContext) {
            return;
        }
        await this.#_audioContext.suspend();
    }


    // Sets up the AudioContext etc.
    async #setUpAudioContext(): Promise<void> {
        // C++  N/A
        assert(this.#_audioContext === null);

        this.#_audioContext = new AudioContext({
            // The audio stream is at the Vircadia audio sample rate. Browsers convert this to their required hardware rate.
            sampleRate: AudioConstants.SAMPLE_RATE
        });

        // AudioStream output.
        // Create this before async operations so that audioOutput property can be retrieved via audioOuput while setting up.
        this.#_streamDestination = this.#_audioContext.createMediaStreamDestination();

        // Temporarily provide a fixed tone as the output.
        this.#_oscillatorNode = this.#_audioContext.createOscillator();
        this.#_gainNode = this.#_audioContext.createGain();
        const GAIN = 0.2;
        this.#_gainNode.gain.setValueAtTime(GAIN, this.#_audioContext.currentTime);

        // Audio worklet.
        if (!this.#_audioContext.audioWorklet) {
            console.error("Cannot set up audio output stream. App may not be being server via HTTPS or from localhost?");
            return;
        }
        await this.#_audioContext.audioWorklet.addModule(audioOutputProcessorUrl);
        this.#_audioWorkletNode = new AudioWorkletNode(this.#_audioContext, "vircadia-audio-output-processor");

        // Wire up the nodes.
        this.#_oscillatorNode.connect(this.#_gainNode);
        this.#_gainNode.connect(this.#_audioWorkletNode);
        this.#_audioWorkletNode.connect(this.#_streamDestination);
        this.#_oscillatorNode.start();
    }

}

export default AudioOutput;
