//
//  AudioWorklets.ts
//
//  Created by David Rowe on 13 Dec 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { WorkerUrl } from "worker-url";


/*@devdoc
 *  The <code>AudioWorklets</code> namespace abstracts the loading of the input and output audio worklets such that the worklet
 *  files are built (the WorkerUrl package used makes certain demands on the code) and the methods can be mocked for unit and
 *  integration testing the (the <code>import.meta.url</code> is not compatible with the Jest test environment).
 *  <p>C++: N/A</p>
 *  @namespace AudioWorklets
 */
const AudioWorklets = new class {

    /* eslint-disable class-methods-use-this */

    /*@devdoc
     *  Loads the {@link AudioInputProcessor} audio worklet.
     *  @function AudioWorklets.loadInputProcessor
     *  @param {string} relativePath - The relative path to the audio worklet JavaScript file.
     *  @param {AudioContext} audioContext - The AudioContext in which to load the audio worklet.
     */
    async loadInputProcessor(relativePath: string, audioContext: AudioContext): Promise<void> {
        const audioInputProcessorURL = new WorkerUrl(new URL("../worklets/AudioInputProcessor.ts", import.meta.url), {
            // The "name" property must be a literal value in order to successfully build the worklet; it cannot be a variable.
            name: "vircadia-audio-input",  // The filename (sans ".js") of the audio worklet that is built.
            customPath: () => {
                return new URL(`${relativePath}vircadia-audio-input.js`, window.location.href);
            }
        });
        console.log("Audio input worklet:", audioInputProcessorURL.href);
        // eslint-disable-next-line
        // @ts-ignore
        await audioContext.audioWorklet.addModule(audioInputProcessorURL);
    }

    /*@devdoc
     *  Loads the {@link AudioOutputProcessor} audio worklet.
     *  @function AudioWorklets.loadOutputProcessor
     *  @param {string} relativePath - The relative path to the audio worklet JavaScript file.
     *  @param {AudioContext} audioContext - The AudioContext in which to load the audio worklet.
     */
    async loadOutputProcessor(relativePath: string, audioContext: AudioContext): Promise<void> {
        const audioOutputProcessorURL = new WorkerUrl(new URL("../worklets/AudioOutputProcessor.ts", import.meta.url), {
            // The "name" property must be a literal value in order to successfully build the worklet; it cannot be a variable.
            name: "vircadia-audio-output",  // The filename (sans ".js") of the audio worklet that is built.
            customPath: () => {
                return new URL(`${relativePath}vircadia-audio-output.js`, window.location.href);
            }
        });
        console.log("Audio output worklet:", audioOutputProcessorURL.href);
        // eslint-disable-next-line
        // @ts-ignore
        await audioContext.audioWorklet.addModule(audioOutputProcessorURL);
    }

}();

export default AudioWorklets;
