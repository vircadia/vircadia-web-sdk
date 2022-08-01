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
    _lastInput: Array<number>;
    _inputRange: { begin: number, end: number };
    _output: Int16Array;
    _outputView: DataView;
    _outputSize: number;
    _outputSampleSize: number;
    _outputIndex = 0;
    _outputTotalIndex = 0;
    _sourceSampleRate: number;
    _resampleRatio = 1;

    constructor(options?: AudioWorkletNodeOptions) {
        super(options);  // eslint-disable-line

        this._channelCount = options?.channelCount ? options.channelCount : 1;  // Default to mono.
        this._sourceSampleRate = sampleRate;

        if (this._sourceSampleRate !== AudioConstants.SAMPLE_RATE) {
            this._resampleRatio = AudioConstants.SAMPLE_RATE / this._sourceSampleRate;
        }

        this._outputSize = this._channelCount === 1
            ? AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL
            : AudioConstants.NETWORK_FRAME_SAMPLES_STEREO;
        this._outputSampleSize = this._outputSize / this._channelCount;
        this._output = new Int16Array(this._outputSize);
        this._outputView = new DataView(this._output.buffer);

        this._lastInput = [0, 0];
        this._inputRange = { begin: 0, end: 0 };

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
            this._resetInput(0);
            this._resetOutput();
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
            return true;
        }

        if (this._sourceSampleRate !== AudioConstants.SAMPLE_RATE) {
            this._resample(inputList[0]);
        } else {
            this._convert(inputList[0]);
        }

        return true;
    }

    _resetOutput() {
        this._output = new Int16Array(this._outputSize);
        this._outputView = new DataView(this._output.buffer);
        this._outputIndex = 0;
    }

    _resetInput(end: number) {
        this._lastInput = [0, 0];
        this._inputRange = { begin: 0, end };
    }

    _getResampled(channelIndex: number, inputPosition: number, input: Array<Float32Array>): number {
        const channel = input[channelIndex] as Float32Array;
        const localPosition = inputPosition - this._inputRange.begin;

        let first = 0;
        let second = 0;
        let ratio = 0;
        if (localPosition < 0) {
            ratio = 1 - localPosition;
            first = this._lastInput[channelIndex] as number;
            second = channel[0] as number;
        } else {
            const firstIndex = Math.floor(localPosition);
            const secondIndex = Math.ceil(localPosition);
            ratio = localPosition - firstIndex;
            first = channel[firstIndex] as number;
            second = channel[secondIndex] as number;
        }

        return first + (second - first) * ratio;
    }

    _resample(input: Array<Float32Array>) {
        const inputSize = (input[0] as Float32Array).length;

        if (inputSize === 0) {
            return;
        }

        this._inputRange.end += inputSize;

        let inputPosition = this._outputTotalIndex / this._resampleRatio;
        while (Math.ceil(inputPosition) < this._inputRange.end) {

            const rawIndex = this._outputIndex * Int16Array.BYTES_PER_ELEMENT * this._channelCount;
            for (let channel = 0; channel < this._channelCount; ++channel) {
                const resampled = this._getResampled(channel, inputPosition, input);
                const rawChannel = channel * Int16Array.BYTES_PER_ELEMENT;
                this._outputView.setInt16(rawIndex + rawChannel, resampled * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
            }

            this._outputTotalIndex += 1;
            this._outputIndex += 1;

            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }

            if (this._outputTotalIndex === AudioConstants.SAMPLE_RATE) {
                this._outputTotalIndex = 0;
                this._resetInput(inputSize);
            }

            inputPosition = this._outputTotalIndex / this._resampleRatio;
        }

        for (let i = 0; i < this._channelCount; ++i) {
            const channel = input[i] as Float32Array;
            this._lastInput[i] = channel[channel.length - 1] as number;
        }
        this._inputRange.begin += inputSize;
    }

    _convert(input: Array<Float32Array>) {
        const inputSize = (input[0] as Float32Array).length;
        for (let i = 0; i < inputSize; ++i) {

            const rawIndex = this._outputIndex * Int16Array.BYTES_PER_ELEMENT * this._channelCount;
            for (let channel = 0; channel < this._channelCount; ++channel) {
                const inputSample = (input[channel] as Float32Array)[i] as number;
                const rawChannel = channel * Int16Array.BYTES_PER_ELEMENT;
                this._outputView.setInt16(rawIndex + rawChannel, inputSample * this.FLOAT_TO_INT, this.LITTLE_ENDIAN);
            }

            this._outputIndex += 1;
            if (this._outputIndex === this._outputSampleSize) {
                this.port.postMessage(this._output.buffer, [this._output.buffer]);
                this._resetOutput();
            }

        }

    }

}

registerProcessor("vircadia-audio-input-processor", AudioInputProcessor);
