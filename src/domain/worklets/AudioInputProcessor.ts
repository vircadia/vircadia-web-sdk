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

/*@devdoc
 *  see: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope
 */
declare const sampleRate: number;

/*@devdoc
 *  The <code>AudioBufferPolyfill</code> class is a partial implementation of
 *  {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer|AudioBuffer} in context of audio worklets that don't
 *  have access to window scope.
 *  @class AudioBufferPolyfill
 */
class AudioBufferPolyfill implements AudioBuffer {
    readonly duration: number;
    readonly length: number;
    readonly numberOfChannels: number;
    readonly sampleRate: number;

    _channels: Array<Float32Array>;

    constructor(options: AudioBufferOptions) {
        this.length = Math.ceil(options.length);
        this.numberOfChannels = options.numberOfChannels || 1;
        this.sampleRate = options.sampleRate;
        this.duration = this.length / this.sampleRate;

        this._channels = [];
        for (let i = 0; i < this.numberOfChannels; ++i) {
            this._channels.push(new Float32Array(this.length));
        }
    }

    copyFromChannel(destination: Float32Array, channelNumber: number, startInChannel?: number) {
        const view = new Float32Array(this.getChannelData(channelNumber).buffer,
            (startInChannel || 0) * Float32Array.BYTES_PER_ELEMENT);
        destination.set(view);
    }

    copyToChannel(source: Float32Array, channelNumber: number, startInChannel?: number): void {
        this.getChannelData(channelNumber).set(source, startInChannel || 0);
    }

    getChannelData(channel: number): Float32Array {
        return this._channels[channel] as Float32Array;
    }
}

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

    _channelCount;
    _accumulator: AudioBufferPolyfill;
    _accumulatorIndex = 0;
    _sourceSampleRate: number;

    constructor(options?: AudioWorkletNodeOptions) {
        super(options);  // eslint-disable-line

        this._channelCount = options?.channelCount ? options.channelCount : 1;  // Default to mono.
        this._sourceSampleRate = sampleRate;

        let accumulatorSize = this._channelCount === 1
            ? AudioConstants.NETWORK_FRAME_SAMPLES_PER_CHANNEL
            : AudioConstants.NETWORK_FRAME_SAMPLES_STEREO;
        if (this._sourceSampleRate !== AudioConstants.SAMPLE_RATE) {
            const resampleRatio = AudioConstants.SAMPLE_RATE / this._sourceSampleRate;
            accumulatorSize /= resampleRatio;
        }

        this._accumulator = this._createAccumulator(accumulatorSize);

        this.port.onmessage = this.onMessage;
    }

    _createAccumulator(size: number) {
        return new AudioBufferPolyfill({
            numberOfChannels: this._channelCount,
            sampleRate: this._sourceSampleRate,
            length: size
        });
    }

    _resetAccumulator() {
        this._accumulator = this._createAccumulator(this._accumulator.length);
        this._accumulatorIndex = 0;
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
        let inputSize = (input[0] as Float32Array).length;
        while (inputSize > 0) {
            const remaining = this._accumulator.length - this._accumulatorIndex;
            const accumulation = Math.min(remaining, inputSize);
            const inputIndex = (input[0] as Float32Array).length - inputSize;

            for (let i = 0; i < this._accumulator.numberOfChannels; ++i) {
                const channel = input[i] as Float32Array;
                const rawInputIndex = inputIndex * Float32Array.BYTES_PER_ELEMENT;
                const inputView = new Float32Array(channel.buffer, rawInputIndex, accumulation);
                this._accumulator.copyToChannel(inputView, i, this._accumulatorIndex);
            }

            this._accumulatorIndex += accumulation;
            inputSize -= accumulation;

            if (this._accumulatorIndex === this._accumulator.length) {
                const output = [];
                for (let i = 0; i < this._accumulator.numberOfChannels; ++i) {
                    output.push(this._accumulator.getChannelData(i).buffer);
                }
                this.port.postMessage(output, output);
                this._resetAccumulator();
            }
        }

        return true;
    }

}

registerProcessor("vircadia-audio-input-processor", AudioInputProcessor);
