//
//  AudioWorklets.mock.js
//
//  Created by David Rowe on 13 Dec 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */

const AudioWorkletsMock = new class {

    mock() {
        jest.mock("../../../src/domain/audio/AudioWorklets", () => {
            return {
                loadInputProcessor: async (relativePath, audioContext) => {
                    // No-op;
                },
                loadOutputProcessor: async (relativePath, audioContext) => {
                    // No-op;
                }
            };
        });
    }


}();

export default AudioWorkletsMock;
