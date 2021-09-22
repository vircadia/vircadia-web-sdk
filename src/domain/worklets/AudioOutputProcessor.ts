//
//  AudioOutputProcessor.ts
//
//  Created by David Rowe on 14 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>AudioOutputProcessor</code> class implements a Web Audio
 *  {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor|AudioWorkletProcessor} that outputs audio
 *  posted to it in messages. It doesn't have any SDK API; it is used as a node in the Web Audio graph that {@link AudioOutput}
 *  uses to provide an output MediaStream.
 *  <p>It runs on its own thread and buffers an amount of data received to play, in order to maintain a smooth output
 *  stream.</p>
 *  <p>C++: <code>N/A</code></p>
 *  @class AudioOutputProcessor
 *  @param {AudioWorkletNodeOptions} options -
 *    {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor|AudioWorkletProcessor}
 *    options.
 *
 *  @property {MessagePort} port - Used to communicate between the AudioWorkletProcessor object and its internal code. See
 *    {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/port|AudioWorkletNode.port}.
 */
class AudioOutputProcessor extends AudioWorkletProcessor {

    // Buffer blocks of audio data so that they can be played back smoothly.
    // FIXME: All these fields should be private (#s) but Firefox doesn't currently support this (Sep 2021).
    _audioBuffer: Float32Array[] = [];
    readonly MAX_AUDIO_BUFFER_LENGTH = 12;  // The maximum number of audio blocks to buffer.
    readonly MIN_AUDIO_BUFFER_LENGTH = 2;  // The minimum number of audio blocks to have before starting to play them.
    _isPlaying = false;  // Is playing audio blocks from the buffer.


    // The typings aren't complete for the Web Audio API (Sep 2021), hence the ESlint and TypesScript disablings.

    constructor(options?: AudioWorkletNodeOptions) {
        super(options);  // eslint-disable-line

        // eslint-disable-next-line
        // @ts-ignore
        this.port.onmessage = (message) => {  // eslint-disable-line

            // Buffer the new block of audio samples.
            const audioBlock = new Float32Array(message.data);  // eslint-disable-line
            this._audioBuffer.push(audioBlock);

            // If we've reached the maximum buffer size, skip some of audio blocks.
            if (this._audioBuffer.length > this.MAX_AUDIO_BUFFER_LENGTH) {
                // console.log("AudioOutputProcessor: Discard", this.#_audioBuffer.length - this.#MIN_AUDIO_BUFFER_LENGTH,
                //     "blocks");
                while (this._audioBuffer.length > this.MIN_AUDIO_BUFFER_LENGTH) {
                    this._audioBuffer.shift();
                }
            }

            // Start playing if not playing and we now have enough audio blocks.
            if (!this._isPlaying) {
                if (this._audioBuffer.length >= this.MIN_AUDIO_BUFFER_LENGTH) {
                    // console.log("AudioOutputProcessor: Start playing");
                    this._isPlaying = true;
                }
            }

        };
    }

    /*@devdoc
     *  Called by the Web Audio pipeline to provide the next block of audio samples.
     */
    // eslint-disable-next-line
    // @ts-ignore
    process(inputList: Float32Array[][], outputList: Float32Array[][] /* , parameters: Record<string, Float32Array> */) {

        // Grab the next block of audio to play.
        let audioBlock: Float32Array | undefined = undefined;
        if (this._isPlaying) {
            audioBlock = this._audioBuffer.shift();
            if (audioBlock === undefined) {
                // console.log("AudioOutputProcessor: Stop playing");
                this._isPlaying = false;
            }
        }

        if (!outputList || !outputList[0] || !outputList[0][0] || !outputList[0][1]) {
            return true;
        }

        const channelCount = 2;
        const EXPECTED_AUDIO_BLOCK_FRAMES = 128;
        const sampleCount = Math.min(outputList[0][0].length, audioBlock ? audioBlock.length / 2 : EXPECTED_AUDIO_BLOCK_FRAMES);

        const output = outputList[0];
        for (let channel = 0; channel < channelCount; channel++) {
            const samples = output[channel] as Float32Array;
            for (let i = 0; i < sampleCount; i++) {
                let sample = 0;
                if (audioBlock) {
                    sample = audioBlock[i * 2 + channel] as number;
                }
                samples[i] = sample;
            }
        }

        return true;
    }
}

registerProcessor("vircadia-audio-output-processor", AudioOutputProcessor);
