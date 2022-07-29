//
//  AudioInput.unit.test.js
//
//  Created by David Rowe 24 Sep 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2021 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import AudioWorkletsMock from "../../../mocks/domain/audio/AudioWorklets.mock.js";
AudioWorkletsMock.mock();


import AudioInput from "../../../src/domain/audio/AudioInput";


describe("AudioInput - unit tests", () => {

    test("Initial conditions", () => {
        const audioInput = new AudioInput();
        expect(audioInput.errorString()).toBe("");
        expect(audioInput.hasPendingFrame()).toBe(false);
        expect(audioInput.isStarted()).toBe(false);
        expect(audioInput.isSuspended()).toBe(false);
    });

});
