//
//  AudioOutputProcessor.ts
//
//  Created by David Rowe on 14 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/*@devdoc
 *  The <code>AudioOutputProcessor</code> class implements a Web Audio
 *  {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor|AudioWorkletProcessor} that outputs SDK audio
 *  to a MediaStream. It is used as a node in a Web Audio graph in {@link AudioOutput}.
 *  <p>It runs on its own thread and uses a ring buffer to buffer an amount of data received to play in order to help maintain a
 *  smooth output stream.</p>
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
    // FIXME: All these fields should be private (#s) but Firefox is handling transpiled code with them (Sep 2021).
    _audioBuffer: Int16Array[] = [];
    readonly MAX_AUDIO_BUFFER_LENGTH = 16;  // The maximum number of audio blocks to buffer.
    readonly MIN_AUDIO_BUFFER_LENGTH = 4;  // The minimum number of audio blocks to have before starting to play them.
    _isPlaying = false;  // Is playing audio blocks from the buffer.


    constructor(options?: AudioWorkletNodeOptions) {
        super(options);

        this.port.onmessage = this.onMessage;
    }


    /*@devdoc
     *  Takes incoming audio blocks posted to the audio worklet's message port and queues them in a ring buffer for playing.
     *  If too many audio blocks are queued, some of the older ones are discarded.
     *  If too few audio blocks are queued, playing is paused while a minimum number of audio blocks are accumulated.
     *  @function AudioOutputProcessor.onMessage
     *  @param {MessageEvent} message - The message posted to the audio worklet, with <code>message.data</code> being an
     *      <code>Int16Array</code> of PCM audio samples, ready to play.
     */
    onMessage = (message: MessageEvent) => {
        // Buffer the new block of audio samples.
        const audioBlock = new Int16Array(message.data);
        this._audioBuffer.push(audioBlock);

        // If we've reached the maximum buffer size, skip some of the audio blocks.
        if (this._audioBuffer.length > this.MAX_AUDIO_BUFFER_LENGTH) {
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


    /*@devdoc
     *  Called by the Web Audio pipeline to provide the next block of audio samples to play. The next audio block from the ring
     *  buffer is played if one is available and playing is not paused, otherwise a block of silence is played. The Int32 values
     *  from the ring buffer are converted to Float32 values.
     *  @param {Float32Array[][]} inputList - Input PCM audio samples. <em>Not used.</em>
     *  @param {Float32Array[][]} outputList - Output PCM audio samples.
     *  @param {Record<string, Float32Array>} parameters - Processing parameters. <em>Not used.</em>
     */
    // eslint-disable-next-line
    // @ts-ignore
    process(inputList: Float32Array[][], outputList: Float32Array[][] /* , parameters: Record<string, Float32Array> */) {

        const FLOAT_TO_INT = 32767;

        // Grab the next block of audio to play.
        let audioBlock: Int16Array | undefined = undefined;
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
                    sample = audioBlock[i * 2 + channel] as number / FLOAT_TO_INT;
                }
                samples[i] = sample;
            }
        }

        return true;
    }
}

registerProcessor("vircadia-audio-output-processor", AudioOutputProcessor);
