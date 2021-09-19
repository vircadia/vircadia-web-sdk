//
//  AudioOutputProcessor.ts
//
//  Created by David Rowe on 14 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/* eslint-disable class-methods-use-this */
class MyAudioOutputProcessor extends AudioWorkletProcessor {
    /*
    constructor(options?: AudioWorkletNodeOptions) {
        super(options);
    }
    */

    // eslint-disable-next-line
    // @ts-ignore
    process(inputList: Float32Array[][], outputList: Float32Array[][] /* , parameters: Record<string, Float32Array> */) {

        const sourceLimit = Math.min(inputList.length, outputList.length);

        /* eslint-disable @typescript-eslint/no-non-null-assertion */

        for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
            const input = inputList[inputNum];
            const output = outputList[inputNum];
            const channelCount = Math.min(input!.length, output!.length);

            for (let channelNum = 0; channelNum < channelCount; channelNum++) {
                const sampleCount = input![channelNum]!.length;

                for (let i = 0; i < sampleCount; i++) {
                    const sample = input![channelNum]![i];

                    /* Manipulate the sample. */

                    output![channelNum]![i] = sample!;
                }
            }
        }

        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        return true;
    }
}

registerProcessor("vircadia-audio-output-processor", MyAudioOutputProcessor);
