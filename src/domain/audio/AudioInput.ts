//
//  AudioInput.ts
//
//  Created by David Rowe on 24 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioConstants from "../audio/AudioConstants";
import assert from "../shared/assert";
import SignalEmitter, { Signal } from "../shared/SignalEmitter";

// eslint-disable-next-line
// @ts-ignore
import audioInputProcessorURL from "worklet-loader!../worklets/AudioInputProcessor";


/*@devdoc
 *  The <code>AudioInput</code> provides PCM audio data for the audio mixer generated from an input Web Audio MediaStream. The
 *  data are provided as protocol-ready network frames comprising 240 audio sample frames, ready to be encoded and sent to the
 *  audio mixer.
 *  <p>C++: QAudioInput, QIODevice</p>
 *  @class AudioInput
 *  @property {MediaStream | null} audioInput - The user client's audio input stream.
 *      <em>Write-only.</em>
 *      <p>This must be set to a non-null value only when the audio input isn't running (hasn't been started or has been
 *      stopped). Setting to <code>null</code> stops the audio input if it is running.</p>
 */
class AudioInput {
    // C++  QAudioInput, QIODevice
    //      Adapted for the particular case of providing data for the Vircadia protocol.

    #_audioInput: MediaStream | null = null;

    #_audioContext: AudioContext | null = null;
    #_audioStreamSource: MediaStreamAudioSourceNode | null = null;
    #_audioInputProcessor: AudioWorkletNode | null = null;
    #_audioInputProcessorPort: MessagePort | null = null;

    #_isStarted = false;
    #_isSuspended = false;
    #_errorString = "";
    #_frameBuffer: Array<Int16Array> = [];

    #_readyRead = new SignalEmitter();


    set audioInput(audioInput: MediaStream | null) {
        // C++  N/A
        if (audioInput && this.#_isStarted) {
            console.error("Cannot set the audio input while it is running!");
            return;
        }

        if (audioInput === null && this.#_isStarted) {
            void this.stop();
        }

        this.#_audioInput = audioInput;
    }


    /*@devdoc
     *  Gets whether audio input processing has been started, i.e., it is running (possibly suspended) and hasn't been stopped.
     *  @function AudioInput.isStarted
     *  @returns {boolean} <code>true</code> if audio input processing has been started and hasn't been stopped,
     *      <code>false</code> if it hasn't been started or has been stopped.
     */
    isStarted(): boolean {
        // C++  N/A
        return this.#_isStarted;
    }

    /*@devdoc
     *  Gets whether audio input processing has been suspended. It may be suspended while it isn't running.
     *  @function AudioInput.isSuspended
     *  @returns {boolean} <code>true</code> if audio processing is suspended, <code>false</code> if it isn't.
     */
    isSuspended(): boolean {
        // C++  N/A
        return this.#_isSuspended;
    }

    /*@devdoc
     *  Sets up and starts audio processing.
     *  <p>If audio processing is suspended, the audio processing starts up in the suspected stat.</p>
     *  @function AudioInput.start
     *  @returns {Promise<boolean>} <code>true</code> if audio processing was successfully started, <code>false</code> if it
     *      wasn't. Information on any error is reported in {@link AudioInput.errorString};
     */
    async start(): Promise<boolean> {
        // C++  QAudioInput.start()
        assert(!this.#_isStarted);
        this.#_errorString = "";

        if (this.#_audioInput === null) {
            this.#_errorString = "Cannot start null audio input!";
            return false;
        }

        this.#_isStarted = true;

        if (!this.#_audioContext) {
            const isSetUp = await this.#setUpAudioContext();
            if (!isSetUp) {
                return false;
            }
        }
        assert(this.#_audioContext !== null);

        if (this.#_isSuspended) {
            if (this.#_audioContext.state === "running") {
                await this.#_audioContext.suspend();
            }
        } else if (this.#_audioContext.state === "suspended") {
            await this.#_audioContext.resume();
        }

        return true;
    }

    /*@devdoc
     *  Suspends audio processing. This halts hardware processing, reducing CPU/battery usage.
     *  @function AudioInput.suspend
     *  @returns {Promise<void>}
     */
    async suspend(): Promise<void> {
        // C++  QAudioInput::suspend()
        assert(!this.#_isSuspended);
        this.#_isSuspended = true;

        if (this.#_audioContext) {
            await this.#_audioContext.suspend();
        }

        this.#_audioInputProcessorPort?.postMessage("clear");
        this.#_frameBuffer = [];
    }

    /*@devdoc
     *  Resumes audio processing from a suspended state.
     *  @function AudioInput.resume
     *  @returns {Promise<void>}
     */
    async resume(): Promise<void> {
        // C++  QAudioInput::resume()
        assert(this.#_isSuspended);
        this.#_isSuspended = false;

        if (this.#_audioContext) {
            await this.#_audioContext.resume();
        }
    }

    /*@devdoc
     *  Stops audio processing and releases resources.
     *  @function AudioInput.stop
     *  @returns {Promise<void>}
     */
    async stop(): Promise<void> {
        // C++  QAudioInput::stop()
        assert(this.#_isStarted);
        this.#_isStarted = false;

        if (this.#_audioContext) {
            await this.#_audioContext.suspend();
            await this.#_audioContext.close();

            this.#_audioInputProcessorPort = null;
            this.#_audioInputProcessor = null;
            this.#_audioStreamSource = null;
            this.#_audioContext = null;
        }
    }

    /*@devdoc
     *  Gets whether there is a network frame of audio data ready to be read.
     *  @function AudioInput.hasPendingFrame
     *  @returns {boolean} <code>true</code> if there is a network frame of audio data ready to be read, <code>false</code> if
     *      there isn't.
     */
    hasPendingFrame(): boolean {
        // C++  N/A
        return this.#_frameBuffer.length > 0;
    }

    /*@devdoc
     *  Gets the next network frame of audio input data.
     *  @function AudioInput.readFrame
     *  @returns {Int16Array|null} The next network frame (240 audio sample frames) of PCM data, or <code>null</code> if there
     *      was an error getting the next frame.
     */
    readFrame(): Int16Array | null {
        // C++  QIODevice::readAll()
        let frame: Int16Array | undefined = undefined;
        if (this.#_frameBuffer.length > 0) {
            frame = this.#_frameBuffer.pop();
        }
        if (frame === undefined) {
            this.#_errorString = "Unexpected read of empty audio input buffer!";
            console.error(this.#_errorString);
            return null;
        }
        return frame;
    }

    /*@devdoc
     *  Gets a description of the last error that occurred during the current audio processing run.
     *  @function AudioInput.errorString
     *  @returns {string} The description of the last error that occurred.
     */
    errorString(): string {
        // C++  QIODevice::errorString()
        return this.#_errorString;
    }


    /*@devdoc
     *  Triggered each time a new network frame of audio input is available for reading.
     *  @function AudioInput.readyRead
     *  @returns {Signal}
     */
    get readyRead(): Signal {
        // C++  QIODevice::readyRead()
        return this.#_readyRead.signal();
    }


    /*@devdoc
     *  Receives the next network frame of data from the audio input from the {@link AudioInputProcessor} used, triggering a
     *  {@link AudioInput.readyRead} signal.
     *  @function AudioInput.processAudioInputString
     *  @param {MessageEvent<ArrayBuffer>} The PCM audio data.
     *  @returns {Slot}
     */
    processAudioInputMessage = (message: MessageEvent<ArrayBuffer>): void => {
        // C++  N/A

        const frame = new Int16Array(message.data);
        this.#_frameBuffer.push(frame);

        // WEBRTC TODO: Could perhaps throttle the #_readyRead.emit()s on the understanding that multiple packets will be
        // processed by the method connected to the signal.
        this.#_readyRead.emit();
    };


    // Sets up the AudioContext etc.
    async #setUpAudioContext(): Promise<boolean> {
        // C++  N/A
        assert(this.#_audioContext === null);
        assert(this.#_audioInput !== null);

        this.#_audioContext = new AudioContext({
            // The audio stream is at the Vircadia audio sample rate. Browsers convert to this from their hardware rate.
            sampleRate: AudioConstants.SAMPLE_RATE
        });

        try {
            // Firefox throws an exception here
            // Uncaught (in promise) DOMException: AudioContext.createMediaStreamSource:
            // Connecting AudioNodes from AudioContexts with different sample-rate is currently not supported.
            //
            // Which is likely a bug and not an actual missing implementation.
            this.#_audioStreamSource = this.#_audioContext.createMediaStreamSource(this.#_audioInput);
        } catch {
            // We work around by using a context without sample rate requirement and handling re-sampling in the input worklet.
            this.#_audioContext = new AudioContext();
            this.#_audioStreamSource = this.#_audioContext.createMediaStreamSource(this.#_audioInput);
        }

        this.#_audioStreamSource.channelInterpretation = "discrete";

        const inputDeviceAudioInfo = this.#_audioInput ? this.#_audioInput.getAudioTracks()[0] : null;
        const inputDeviceAudioSettings = inputDeviceAudioInfo ? inputDeviceAudioInfo.getSettings() : null;
        let channelCount = 0;
        if (inputDeviceAudioSettings) {
            // FIXME: Typings currently don't include channelCount doesn't exist on MediaTrackSettings (Sep 2021).
            /* eslint-disable */
            // @ts-ignore
            channelCount = inputDeviceAudioSettings.channelCount ? inputDeviceAudioSettings.channelCount : 0;
            /* eslint-enable */
        }

        channelCount = Math.min(channelCount, 2);  // Mono or stereo.
        assert(channelCount > 0);
        // The channel count has already been checked in AudioClient.#switchInputToAudioDevice().

        // Audio worklet.
        if (!this.#_audioContext.audioWorklet) {
            this.#_errorString = "Cannot set up audio input stream. App may not be being served via HTTPS or from localhost.";
            console.error(this.#_errorString);
            return false;
        }
        await this.#_audioContext.audioWorklet.addModule(audioInputProcessorURL);
        this.#_audioInputProcessor = new AudioWorkletNode(this.#_audioContext, "vircadia-audio-input-processor", {
            numberOfInputs: 1,
            numberOfOutputs: 0,
            channelCount,
            channelCountMode: "explicit"
        });
        this.#_audioInputProcessorPort = this.#_audioInputProcessor.port;
        this.#_audioInputProcessorPort.onmessage = this.processAudioInputMessage;

        // Wire up the nodes.
        this.#_audioStreamSource.connect(this.#_audioInputProcessor);

        return true;
    }

}

export default AudioInput;
