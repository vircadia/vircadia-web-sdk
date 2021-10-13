//
//  AudioInputProcessor.ts
//
//  Created by David Rowe on 23 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioConstants from "../audio/AudioConstants";
import assert from "../shared/assert";

const InputBuffer = Float32Array;
const OutputBuffer = Int16Array;

export type AudioInputProcessorOptions = { sourceSampleRate?: number };

/*@devdoc
 *  The <code>AudioInputProcessor</code> class implements a Web Audio
 *  {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor|AudioWorkletProcessor} that takes incoming Web
 *  Audio and provides it for the SDK to use. It is used as a node in a Web Audio graph in {@link AudioInput}.
 *  <p>It runs on its own thread and buffers incoming samples as needed in order to provide the samples to the SDK in the
 *  required network frame size.</p>
 *  <p>C++: <code>N/A</code></p>
 *  @class AudioInputProcessor
 *  @param {AudioWorkletNodeOptions} options -
 *    {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor|AudioWorkletProcessor}
 *    options.
 *
 *  @property {MessagePort} port - Used to communicate between the AudioWorkletProcessor object and its internal code. See
 *    {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/port|AudioWorkletNode.port}.
 */
class AudioInputProcessor extends AudioWorkletProcessor {

    // FIXME: All these fields should be private (#s) but Firefox is handling transpiled code with them (Sep 2021).
    readonly SDK_MONO_BUFFER_SAMPLES = 240;
    readonly SDK_MONO_BUFFER_BYTES = 480;
    readonly SDK_STEREO_BUFFER_SAMPLES = 480;
    readonly SDK_STEREO_BUFFER_BYTES = 960;


    _channelCount;
    _outputSampleSize: number;
    _accumulator: AudioBuffer;
    _accumulatorIndex = 0;
    _sourceSampleRate: number;
    _bufferQeue: Promise<void> = Promise.resolve();

    constructor(options?: AudioWorkletNodeOptions) {
        super(options);  // eslint-disable-line

        this._channelCount = options?.channelCount ? options.channelCount : 1;  // Default to mono.
        this._outputSampleSize = this._channelCount === 1 ? this.SDK_MONO_BUFFER_SAMPLES : this.SDK_STEREO_BUFFER_SAMPLES;
        const outputBufferSize = this._channelCount === 1 ? this.SDK_MONO_BUFFER_BYTES : this.SDK_STEREO_BUFFER_BYTES;

        let accumulatorSize = outputBufferSize / this._channelCount / InputBuffer.BYTES_PER_ELEMENT;

        const preprocessorOptions = options?.processorOptions as AudioInputProcessorOptions ?? {};
        this._sourceSampleRate = preprocessorOptions?.sourceSampleRate || AudioConstants.SAMPLE_RATE;
        if (this._sourceSampleRate !== AudioConstants.SAMPLE_RATE) {
            const resampleRatio = AudioConstants.SAMPLE_RATE / this._sourceSampleRate;
            accumulatorSize /= resampleRatio;
        }

        this._accumulator = this._createAccumulator(accumulatorSize);

        this.port.onmessage = this.onMessage;
    }

    _createAccumulator(size: number) {
        return new window.AudioBuffer({
            numberOfChannels: this._channelCount,
            sampleRate: this._sourceSampleRate || AudioConstants.SAMPLE_RATE,
            length: size
        });
    }

    _resetAccumulator() {
        this._accumulator = this._createAccumulator(this._accumulator.length);
        this._accumulatorIndex = 0;
    }

    _resample(buffer: AudioBuffer): Promise<AudioBuffer> {
        const context = new OfflineAudioContext({
            numberOfChannels: buffer.numberOfChannels,
            sampleRate: AudioConstants.SAMPLE_RATE,
            length: this._outputSampleSize
        });
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
        return context.startRendering();
    }

    _send(buffer: AudioBuffer) {
        const output = new OutputBuffer(this._outputSampleSize);
        const view = new DataView(output);

        assert(output.length === buffer.length * buffer.numberOfChannels);

        const FLOAT_TO_INT = 32767;
        const LITTLE_ENDIAN = true;

        for (let i = 0; i < buffer.length; ++i) {
            for (let j = 0; j < buffer.numberOfChannels; ++j) {
                view.setInt16(i + j * 2, buffer.getChannelData(j)[i] as number * FLOAT_TO_INT, LITTLE_ENDIAN);
            }
        }

        this.port.postMessage(output.buffer, [output.buffer]);
    }

    /*@devdoc
     *  Acts upon commands posted to the audio worklet's message port.
     *  @function AudioInputProcessor.onMessage
     *  @param {MessageEvent} message - The message posted to the audio worklet, with <code>message.data</code> being a string
     *      signifying the command. The following command is expected:
     *      <p><code>"clear"</code>: Clear the audio sample buffer.</p>
     */
    onMessage = (message: MessageEvent) => {
        if (message.data === "clear") {
            this._resetAccumulator();
        }
    };

    /*@devdoc
     *  Called by the Web Audio pipeline to handle the next block of input audio samples.
     *  @param {Float32Array[][]} inputList - Input PCM audio samples.
     *  @param {Float32Array[][]} outputList - Output PCM audio samples. <em>Not used.</em>
     *  @param {Record<string, Float32Array>} parameters - Processing parameters. <em>Not used.</em>
     */
    // eslint-disable-next-line
    // @ts-ignore
    process(inputList: Float32Array[][] /* , outputList: Float32Array[][], parameters: Record<string, Float32Array> */) {
        if (!inputList || !inputList[0] || !inputList[0][0] || this._channelCount === 2 && !inputList[0][1]) {
            console.log("Early return!");
            return true;
        }

        const input = inputList[0];

        let inputSize = inputList[0].length;
        while (inputSize) {

            const remaining = this._accumulator.length - this._accumulatorIndex;
            const accumulated = Math.min(remaining, inputSize);
            const inputIndex = inputList[0].length - inputSize;

            for (let i = 0; i < this._accumulator.numberOfChannels; ++i) {
                const channel = input[i] as Float32Array;
                const inputView = new InputBuffer(channel.buffer, inputIndex * InputBuffer.BYTES_PER_ELEMENT);
                this._accumulator.copyToChannel(inputView, i, this._accumulatorIndex);
            }

            this._accumulatorIndex += accumulated;
            inputSize -= accumulated;

            if (this._accumulatorIndex === this._accumulator.length) {

                if (this._sourceSampleRate !== AudioConstants.SAMPLE_RATE) {
                    this._bufferQeue = this._bufferQeue
                        .then(() => this._resample(this._accumulator))
                        .then((resampled: AudioBuffer) => this._send(resampled));
                } else {
                    this._send(this._accumulator);
                }

                this._resetAccumulator();
            }
        }

        return true;
    }

}

registerProcessor("vircadia-audio-input-processor", AudioInputProcessor);
