//
//  AudioOutput.ts
//
//  Created by David Rowe on 19 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorklets from "./AudioWorklets";
import AudioConstants from "../audio/AudioConstants";
import assert from "../shared/assert";


/*@devdoc
 *  The <code>AudioOutput</code> class provides an output Web Audio MediaStream generated from raw audio data received from the
 *  audio mixer.
 *  <p>C++: <code>N/A</code></p>
 *
 *  @class AudioOutput
 *  @property {string} contextItemType="AudioOutput" - The type name for use with the {@link ContextManager}.
 *      <p><em>Static. Read-only.</em></p>
 *
 *  @property {MediaStream} audioOutput - The audio output stream to be played in the user client.
 *      <em>Read-only.</em>
 *      <p>This should be accessed after the user has interacted with the web page in some manner, otherwise a warning will be
 *      generated in the console log because Web Audio requires user input on the page in order for audio to play. See:
 *      {@link https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide|Autoplay guide for media and Web Audio APIs}.
 *  @property {string} audioWorkletRelativePath="" - The relative path to the SDK's audio worklet JavaScript files,
 *      <code>vircadia-audio-input.js</code> and <code>vircadia-audio-output.js</code>.
 *      <p>The URLs used to load these files are reported in the log. Depending on where these files are deployed, their URLs
 *      may need to be adjusted.  If used, must start with a <code>"."</code> and end with a <code>"/"</code>.</p>
 *      <p><em>Write-only.</em></p>
 */
class AudioOutput {
    //  C++ N/A - This is a Web SDK-specific class.

    static readonly contextItemType = "AudioOutput";


    #_audioContext: AudioContext | null = null;
    #_oscillatorNode: OscillatorNode | null = null;
    #_audioWorkletNode: AudioWorkletNode | null = null;
    #_audioWorkletPort: MessagePort | null = null;
    #_streamDestination: MediaStreamAudioDestinationNode | null = null;

    #_isPlaying = false;

    // FIXME: The AudioWorkletProcessor data blocks size may change and even be variable in the future.
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process
    readonly #AUDIOWORKLETPROCESSOR_DATA_BLOCKS_SIZE = 256;  // 128 samples for each of two channels.
    #_outputArray = new Int16Array(this.#AUDIOWORKLETPROCESSOR_DATA_BLOCKS_SIZE);
    #_outputArrayLength = this.#AUDIOWORKLETPROCESSOR_DATA_BLOCKS_SIZE;
    #_outputOffset = 0;  // The next write position.

    #_audioWorkletRelativePath = "";


    get audioOutput(): MediaStream {
        // C++  N/A
        if (!this.#_audioContext) {
            void this.#setUpAudioContext();
        }
        assert(this.#_streamDestination !== null);
        return this.#_streamDestination.stream;
    }

    set audioWorkletRelativePath(relativePath: string) {
        this.#_audioWorkletRelativePath = relativePath;
    }


    /*@devdoc
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
        // C++  N/A
        if (!this.#_audioContext) {
            await this.#setUpAudioContext();
        }
        assert(this.#_audioContext !== null);
        if (this.#_audioContext.state === "suspended") {
            await this.#_audioContext.resume();
        }
        this.#_isPlaying = true;
    }

    /*@devdoc
     *  Suspends playing audio received from the audio mixer. This halts hardware processing, reducing CPU/battery usage.
     *  <p><em>Async</em></p>
     *  @async
     *  @returns {Promise<void>}
     */
    async pause(): Promise<void> {
        // C++  N/A
        if (!this.#_audioContext) {
            return;
        }
        await this.#_audioContext.suspend();
        this.#_isPlaying = false;
    }

    /*@devdoc
     *  Writes PCM audio data to the audio output stream via an {@link AudioOutputProcessor} Web Audio worklet.
     *  The number of frames received each packet from the audio mixer
     *  ({@link AudioConstants|AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL}) is different to the number of frames needed
     *  in each data block that the audio worklet processes. This method buffers frames as necessary and writes correctly sized
     *  data blocks to the audio worklet.
     *  @param {Int16Array} pcmData - The PCM audio data to output.
     */
    writeData(pcmData: Int16Array): void {
        // C++  N/A
        if (!this.#_audioWorkletPort || !this.#_isPlaying) {
            return;
        }

        let outputArray = this.#_outputArray;
        const outputLength = this.#_outputArrayLength;
        let index = this.#_outputOffset;

        for (const value of pcmData) {
            outputArray[index] = value;
            index += 1;  // Next index.

            if (index === outputLength) {
                // The current output array is full. Send it off.

                // Could use a SharedArrayBuffer which may be more efficient but this isn't well-supported on mobile devices at
                // present (Sep 2021).
                this.#_audioWorkletPort.postMessage(outputArray.buffer, [this.#_outputArray.buffer]);

                this.#_outputArray = new Int16Array(this.#AUDIOWORKLETPROCESSOR_DATA_BLOCKS_SIZE);
                outputArray = this.#_outputArray;
                index = 0;
            }
        }

        this.#_outputOffset = index;  // Starting point for next packet of audio.
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
        // Create this before async operations so that audioOutput property can be retrieved via audioOutput while setting up.
        this.#_streamDestination = this.#_audioContext.createMediaStreamDestination();

        // Use an oscillator node to trigger output generation.
        // FIXME: An oscillator node shouldn't be necessary. Chrome/Edge doesn't require this but Firefox does (Sep 2021).
        this.#_oscillatorNode = this.#_audioContext.createOscillator();

        // Audio worklet.
        if (!this.#_audioContext.audioWorklet) {
            console.error("Cannot set up audio output stream. App may not be being served via HTTPS or from localhost.");
            return;
        }
        await AudioWorklets.loadOutputProcessor(this.#_audioWorkletRelativePath, this.#_audioContext);
        this.#_audioWorkletNode = new AudioWorkletNode(this.#_audioContext, "vircadia-audio-output-processor", {
            // FIXME: Chrome/Edge requires number of inputs > 0 in order for the worklet to generate output (Sep 2021).
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCount: 2,
            channelCountMode: "explicit"
        });
        this.#_audioWorkletPort = this.#_audioWorkletNode.port;

        // Wire up the nodes.
        this.#_oscillatorNode.connect(this.#_audioWorkletNode);
        this.#_audioWorkletNode.connect(this.#_streamDestination);
        this.#_oscillatorNode.start();
    }

}

export default AudioOutput;
