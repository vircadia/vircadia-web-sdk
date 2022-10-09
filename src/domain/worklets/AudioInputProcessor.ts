//
//  AudioInputProcessor.ts
//
//  Created by David Rowe on 23 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioConstants from "../audio/AudioConstants";

// see: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope
declare const sampleRate: number;

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
    readonly FLOAT_TO_INT = 32767;
    readonly LITTLE_ENDIAN = true;

    _channelCount;

    _output: Int16Array;
    _outputView: DataView;
    _outputSize: number;
    _outputSampleSize: number;
    _outputIndex = 0;

    _inputSampleRate: number;
    _inputFraction = 0.0;
    _inputSampleCount = 0;

    // Downsampling.
    _downsampleRatio = 1.0;
    _inputAccumulator = [0.0, 0.0];

    // Upsampling.
    _upsampleRatio = 1.0;
    _lastInputValues = [0.0, 0.0];

    _processor: ((input: Array<Float32Array>) => void);
    _haveReportedUpSampleError = false;


    constructor(options?: AudioWorkletNodeOptions) {
        super(options);  // eslint-disable-line

        this._channelCount = options?.channelCount ? options.channelCount : 1;  // Default to mono.
        this._channelCount = Math.min(this._channelCount, 2);  // Mono or stereo output, only.
        this._inputSampleRate = sampleRate;

        if (this._inputSampleRate === AudioConstants.SAMPLE_RATE) {
            this._processor = this._convert;
        } else if (this._inputSampleRate > AudioConstants.SAMPLE_RATE) {
            this._processor = this._downsample;
            this._downsampleRatio = AudioConstants.SAMPLE_RATE / this._inputSampleRate;  // < 1.0
            this._inputFraction = 0.0;
        } else {
            this._processor = this._upsample;
            this._upsampleRatio = this._inputSampleRate / AudioConstants.SAMPLE_RATE;  // < 1.0
            this._inputFraction = this._upsampleRatio;
        }

        this._outputSize = this._channelCount === 1
            ? AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL
            : AudioConstants.NETWORK_FRAME_SAMPLES_STEREO;
        this._outputSampleSize = this._outputSize / this._channelCount;
        this._output = new Int16Array(this._outputSize);
        this._outputView = new DataView(this._output.buffer);

        this.port.onmessage = this.onMessage;
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
            this._resetInput();
            this._resetOutput();
        }
    };

    /*@devdoc
     *  Called by the Web Audio pipeline to handle the next block of input audio samples, converting them to int16 samples at a
     *  24000Hz sample rate and outputting them 240 frames at a time by posting a message on the AudioWorkletProcessor port.
     *  @param {Float32Array[][]} inputList - Input PCM audio samples. An array of inputs, each of which is an array of
     *      channels, each of which has 128 float32 samples in the range <code>-1.0</code> &ndash; <code>1.0</code>.
     *  @param {Float32Array[][]} outputList - Output PCM audio samples. <em>Not used.</em>
     *  @param {Record<string, Float32Array>} parameters - Processing parameters. <em>Not used.</em>
     *  @returns {boolean} <code>true</code> to keep the processor node alive.
     */
    // eslint-disable-next-line
    // @ts-ignore
    process(inputList: Float32Array[][] /* , outputList: Float32Array[][], parameters: Record<string, Float32Array> */) {
        if (!inputList || !inputList[0] || !inputList[0][0] || this._channelCount === 2 && !inputList[0][1]) {
            return true;
        }

        this._processor(inputList[0]);

        return true;
    }

    _resetOutput() {
        this._output = new Int16Array(this._outputSize);
        this._outputView = new DataView(this._output.buffer);
        this._outputIndex = 0;
    }

    _resetInput() {
        this._inputSampleCount = 0;
        this._inputFraction = 0.0;
        this._inputAccumulator = [0.0, 0.0];
        // Do not reset this._lastInputValue.
    }

    _convert = (input: Array<Float32Array>) => {
        // A straight conversion from float32 to int16 values, posting the output buffer when full.
        const BYTES_PER_INT16_SAMPLE = 2;
        const BYTES_PER_INT16_FRAME = this._channelCount * BYTES_PER_INT16_SAMPLE;

        for (let i = 0, inputSize = (input[0] as Float32Array).length; i < inputSize; i++) {

            const rawIndex = this._outputIndex * BYTES_PER_INT16_FRAME;
            for (let channel = 0; channel < this._channelCount; channel++) {
                const inputSample = (input[channel] as Float32Array)[i] as number;
                const rawChannel = channel * BYTES_PER_INT16_SAMPLE;
                this._outputView.setInt16(rawIndex + rawChannel, inputSample * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
            }

            this._outputIndex += 1;
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }

        }

    };

    _downsample = (input: Array<Float32Array>) => {
        // A simple low-pass filter that assigns proportions of each input sample to output samples, posting the output buffer
        // when full. Values are resynchronized every second to avoid error accumulation.
        const BYTES_PER_INT16_SAMPLE = 2;
        const BYTES_PER_INT16_FRAME = this._channelCount * BYTES_PER_INT16_SAMPLE;

        /* eslint-disable @typescript-eslint/no-non-null-assertion */

        for (let i = 0, inputSize = (input[0] as Float32Array).length; i < inputSize; i++) {
            this._inputSampleCount += 1;

            if (this._inputFraction + this._downsampleRatio < 1.0 && this._inputSampleCount !== this._inputSampleRate) {
                // End of input sample < end of output sample, provided that it's not the final sample in a second (avoid
                // possible accumulated error condition).

                for (let channel = 0; channel < this._channelCount; channel++) {
                    // Add whole of input to input accumulator.
                    this._inputAccumulator[channel] += (input[channel] as Float32Array)[i] as number;
                    this._inputFraction += this._downsampleRatio;
                }

            } else {
                // End of input sample >= end of output sample, or final sample of a second.

                const rawIndex = this._outputIndex * BYTES_PER_INT16_FRAME;
                for (let channel = 0; channel < this._channelCount; channel++) {
                    // Add proportion of input to input accumulator.
                    const proportion = (1 - this._inputFraction) / this._downsampleRatio;
                    const value = (input[channel] as Float32Array)[i] as number;
                    this._inputAccumulator[channel] += proportion * value;

                    // Convert and write output.
                    const rawChannel = channel * BYTES_PER_INT16_SAMPLE;
                    this._outputView.setInt16(rawIndex + rawChannel,
                        this._inputAccumulator[channel]! * this._downsampleRatio * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);

                    // Set input accumulator to remainder of input.
                    const remainder = 1.0 - proportion;
                    this._inputFraction = remainder * this._downsampleRatio;
                    this._inputAccumulator[channel] = remainder * value;
                }

                this._outputIndex += 1;
            }

            // Post output if buffer full.
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }

            // Reset input each second to avoid accumulated errors.
            if (this._inputSampleCount === this._inputSampleRate) {
                this._resetInput();
            }

            /* eslint-enable @typescript-eslint/no-non-null-assertion */
        }
    };

    _upsample = (input: Array<Float32Array>) => {
        // A simple linear interpolation resampler, posting the output buffer when full. Values are resynchronized every second
        // to avoid error accumulation.
        const BYTES_PER_INT16_SAMPLE = 2;
        const BYTES_PER_INT16_FRAME = this._channelCount * BYTES_PER_INT16_SAMPLE;

        /* eslint-disable @typescript-eslint/no-non-null-assertion */

        const inputSize = (input[0] as Float32Array).length;
        let inputIndex = 0;
        let inputValues = [];
        for (let channel = 0; channel < this._channelCount; channel++) {
            inputValues.push((input[channel] as Float32Array)[0] as number);
        }

        // Process input into output.
        while (inputIndex < inputSize) {

            // Calculate output value = last-input-value + fraction * (this-input-value - last-input-value).
            const rawIndex = this._outputIndex * BYTES_PER_INT16_FRAME;
            for (let channel = 0; channel < this._channelCount; channel++) {
                const rawChannel = channel * BYTES_PER_INT16_SAMPLE;
                const lastValue = this._lastInputValues[channel]!;
                const nextValue = inputValues[channel]!;
                this._outputView.setInt16(rawIndex + rawChannel,
                    lastValue + this._inputFraction * (nextValue - lastValue) * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
            }
            this._outputIndex += 1;

            // Post output if buffer full.
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }

            this._inputFraction += this._upsampleRatio;
            if (this._inputFraction > 1.0) {

                // Advance to the next pair of inputs.
                this._lastInputValues = inputValues;
                inputIndex += 1;
                if (inputIndex < inputSize) {
                    this._inputSampleCount += 1;
                    inputValues = [];
                    for (let channel = 0; channel < this._channelCount; channel++) {
                        inputValues.push((input[channel] as Float32Array)[inputIndex] as number);
                    }
                }

                this._inputFraction -= 1.0;
            }

            // Reset input each second to avoid accumulated errors.
            if (this._inputSampleCount === this._inputSampleRate) {
                this._resetInput();
            }
        }

        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    };

}

registerProcessor("vircadia-audio-input-processor", AudioInputProcessor);
