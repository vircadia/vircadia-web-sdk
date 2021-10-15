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
import Signal from "../shared/Signal";

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

    #_readyRead = new Signal();

    #_resampleQueue: Promise<void> = Promise.resolve();
    #_channelCount = 0;
    #_outputSampleSize = 0;


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
        return this.#_readyRead;
    }


    /*@devdoc
     *  Receives the next chunk of buffered audio data from the {@link AudioInputProcessor}, resamples if necessary,
     *  converts to 16bit signed integer PCM, triggering a {@link AudioInput.readyRead} signal.
     *  @function AudioInput.processAudioInputString
     *  @param {MessageEvent<Array<ArrayBuffer>>} The PCM audio data per channel.
     *  @returns {Slot}
     */
    processAudioInputMessage = (message: MessageEvent<Array<ArrayBuffer>>): void => {
        // C++  N/A

        assert(this.#_audioContext !== null);
        if (this.#_audioContext.sampleRate !== AudioConstants.SAMPLE_RATE) {
            this.#_resampleQueue = this.#_resampleQueue
                .then(() => this.#_resample(message.data))
                .then((resampled: AudioBuffer) => this.#_convertAudioBuffer(resampled));
        } else {
            this.#_convertRaw(message.data);
        }
    };

    #_resample(buffers: Array<ArrayBuffer>): Promise<AudioBuffer> {
        assert(this.#_audioContext !== null);
        const typedBuffers = buffers.map((buffer) => new Float32Array(buffer));

        assert(typedBuffers[0] !== undefined);

        const buffer = new AudioBuffer({
            numberOfChannels: typedBuffers.length,
            sampleRate: this.#_audioContext.sampleRate,
            length: typedBuffers[0].length
        });


        for (let i = 0; i < typedBuffers.length; ++i) {
            buffer.copyToChannel(typedBuffers[i] as Float32Array, i);
        }

        const resampled = new AudioBuffer({
            numberOfChannels: buffer.numberOfChannels,
            sampleRate: AudioConstants.SAMPLE_RATE,
            length: this.#_outputSampleSize
        });
        const samplingRatio = buffer.length / resampled.length;
        for (let i = 0; i < resampled.length; ++i) {
            for (let j = 0; j < resampled.numberOfChannels; ++j) {
                const sampleIndex = i * samplingRatio;
                const first = Math.floor(sampleIndex);
                const second = first + 1;
                const ratio = sampleIndex - first;
                const channel = buffer.getChannelData(j);
                resampled.getChannelData(j)[i]
                    = (channel[first] as number) * (1 - ratio)
                    + (channel[second] as number) * ratio;
            }
        }
        return Promise.resolve(resampled);

        // built-in re-sampling doesn't work well
        // const context = new OfflineAudioContext({
        //     numberOfChannels: buffer.numberOfChannels,
        //     sampleRate: AudioConstants.SAMPLE_RATE,
        //     length: this.#_outputSampleSize
        // });
        // const source = context.createBufferSource();
        // source.buffer = buffer;
        // source.connect(context.destination);
        // source.start();
        // return context.startRendering();
    }

    #_convertAudioBuffer(buffer: AudioBuffer): void {
        const typedBuffers = [];
        for (let i = 0; i < buffer.numberOfChannels; ++i) {
            typedBuffers.push(buffer.getChannelData(i));
        }
        this.#_convertTyped(typedBuffers);
    }

    #_convertRaw(buffers: Array<ArrayBuffer>): void {
        this.#_convertTyped(buffers.map((buffer) => new Float32Array(buffer)));
    }

    #_convertTyped(buffers: Array<Float32Array>): void {
        const output = new Int16Array(this.#_outputSampleSize);
        const view = new DataView(output.buffer);

        const FLOAT_TO_INT = 32767;
        const LITTLE_ENDIAN = true;

        for (let i = 0; i < output.length; ++i) {
            for (let j = 0; j < this.#_channelCount; ++j) {
                const channel = buffers[j] as Float32Array;
                const sampleIndex = i * Int16Array.BYTES_PER_ELEMENT * this.#_channelCount;
                const rightIndex = j * Int16Array.BYTES_PER_ELEMENT;
                view.setInt16(sampleIndex + rightIndex, channel[i] as number * FLOAT_TO_INT, LITTLE_ENDIAN);
            }
        }

        this.#_frameBuffer.push(output);

        // WEBRTC TODO: Could perhaps throttle the #_readyRead.emit()s on the understanding that multiple packets will be
        // processed by the method connected to the signal.
        this.#_readyRead.emit();
    }

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
            this.#_audioStreamSource = this.#_audioContext.createMediaStreamSource(this.#_audioInput);
        } catch {
            this.#_audioContext = new AudioContext();
            this.#_audioStreamSource = this.#_audioContext.createMediaStreamSource(this.#_audioInput);
        }

        this.#_audioStreamSource.channelInterpretation = "discrete";

        this.#_channelCount = Math.min(this.#_audioStreamSource.mediaStream.getAudioTracks().length, 2);  // Mono or stereo.
        assert(this.#_channelCount > 0);
        // The channel count has already been checked in AudioClient.#switchInputToAudioDevice().

        this.#_outputSampleSize = this.#_channelCount === 2
            ? AudioConstants.NETWORK_FRAME_SAMPLES_STEREO
            : AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL;

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
            channelCount: this.#_channelCount,
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
