//
//  AudioInputProcessor.ts
//
//  Created by David Rowe on 23 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Log from "../shared/Log";

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
    _samplesSize;
    _bufferSize;
    _buffer: Int16Array;
    _bufferView: DataView;
    _bufferIndex = 0;  // The next write position.

    constructor(options?: AudioWorkletNodeOptions) {
        super(options);  // eslint-disable-line

        this._channelCount = options?.channelCount ? options.channelCount : 1;  // Default to mono.
        this._samplesSize = this._channelCount === 1 ? this.SDK_MONO_BUFFER_SAMPLES : this.SDK_STEREO_BUFFER_SAMPLES;
        this._buffer = new Int16Array(this._samplesSize);
        this._bufferView = new DataView(this._buffer.buffer);
        this._bufferSize = this._channelCount === 1 ? this.SDK_MONO_BUFFER_BYTES : this.SDK_STEREO_BUFFER_BYTES;

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
            this._buffer = new Int16Array(this._samplesSize);
            this._bufferView = new DataView(this._buffer.buffer);
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
            Log.message("Early return!", "audioworklet");
            return true;
        }

        const FLOAT_TO_INT = 32767;
        const LITTLE_ENDIAN = true;

        let index = this._bufferIndex;

        const inputSamplesCount = inputList[0][0].length;
        const bufferSize = this._bufferSize;

        if (this._channelCount === 2) {
            // Stereo.
            const leftInput = inputList[0][0];
            const rightInput = inputList[0][1] as Float32Array;
            let bufferView = this._bufferView;
            for (let i = 0; i < inputSamplesCount; i++) {
                bufferView.setInt16(index, leftInput[i] as number * FLOAT_TO_INT, LITTLE_ENDIAN);
                bufferView.setInt16(index + 2, rightInput[i] as number * FLOAT_TO_INT, LITTLE_ENDIAN);
                index += 4;  // eslint-disable-line @typescript-eslint/no-magic-numbers
                if (index === this._bufferSize) {
                    // The output buffer is full; send it off.
                    this.port.postMessage(this._buffer.buffer, [this._buffer.buffer]);
                    this._buffer = new Int16Array(this._samplesSize);
                    this._bufferView = new DataView(this._buffer.buffer);
                    bufferView = this._bufferView;
                    index = 0;
                }
            }
        } else {
            // Mono.
            const monoInput = inputList[0][0];
            let bufferView = this._bufferView;
            for (let i = 0; i < inputSamplesCount; i++) {
                bufferView.setInt16(index, monoInput[i] as number * FLOAT_TO_INT, LITTLE_ENDIAN);
                index += 2;
                if (index === bufferSize) {
                    // The output buffer is full; send it off.
                    this.port.postMessage(this._buffer.buffer, [this._buffer.buffer]);
                    this._buffer = new Int16Array(this._samplesSize);
                    this._bufferView = new DataView(this._buffer.buffer);
                    bufferView = this._bufferView;
                    index = 0;
                }
            }

        }

        this._bufferIndex = index;

        return true;
    }

}

registerProcessor("vircadia-audio-input-processor", AudioInputProcessor);
